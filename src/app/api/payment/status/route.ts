import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

import { prisma } from '@/lib/prisma';
import { redisClient } from '@/lib/cache/redis';
import { logger } from '@/lib/logger';
import { ErrorFactory } from '@/lib/api/error-response';

export const dynamic = 'force-dynamic';

function getClientIp(request: NextRequest): string | null {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        const first = forwarded.split(',')[0]?.trim();
        if (first) return first;
    }

    const realIp = request.headers.get('x-real-ip')?.trim();
    return realIp || null;
}

function canAccessScan(params: {
    isAdmin: boolean;
    sessionUserId: string | null;
    ownerUserId: string | null;
    claimTokenValid: boolean;
    requestIp: string | null;
    ownerIp: string | null;
}): boolean {
    if (params.isAdmin) return true;

    if (params.ownerUserId) {
        return params.sessionUserId === params.ownerUserId;
    }

    if (params.claimTokenValid) return true;

    if (process.env.NODE_ENV !== 'production') {
        return Boolean(params.ownerIp && params.requestIp && params.ownerIp === params.requestIp);
    }

    return false;
}

function statusMessage(status: 'NOT_CREATED' | 'CREATED' | 'FAILED' | 'CAPTURED') {
    switch (status) {
        case 'CAPTURED':
            return 'Payment captured. Your report is unlocked.';
        case 'FAILED':
            return 'Last payment attempt failed. You can retry now.';
        case 'CREATED':
            return 'A previous payment order exists but is not completed yet. You can retry safely.';
        default:
            return 'No payment attempt found yet.';
    }
}

export async function GET(request: NextRequest) {
    try {
        const scanId = request.nextUrl.searchParams.get('scanId');
        if (!scanId) {
            return ErrorFactory.validationError('scanId is required.');
        }

        const session = await auth();
        const sessionUserId = (session?.user as { id?: string } | undefined)?.id ?? null;
        const isAdmin = (session?.user as { role?: string } | undefined)?.role === 'ADMIN';
        const requestIp = getClientIp(request);
        const claimToken = request.headers.get('x-claim-token');

        const scan = await prisma.scan.findUnique({
            where: { id: scanId },
            select: {
                id: true,
                userId: true,
                ipAddress: true,
                isPaid: true,
            },
        });

        if (!scan) {
            return ErrorFactory.notFound('Scan not found.');
        }

        let claimTokenValid = false;
        if (claimToken && !scan.userId && redisClient.isConfigured()) {
            const claimedScanId = await redisClient.get<string>(`scan:claim:${claimToken}`);
            claimTokenValid = claimedScanId === scanId;
        }

        const isAllowed = canAccessScan({
            isAdmin,
            sessionUserId,
            ownerUserId: scan.userId,
            claimTokenValid,
            requestIp,
            ownerIp: scan.ipAddress,
        });

        if (!isAllowed) {
            logger.warn({
                action: 'payment.status.access.denied',
                scanId,
                sessionUserId: sessionUserId ?? 'anonymous',
            });
            return ErrorFactory.notFound('Scan not found.');
        }

        const payment = await prisma.payment.findUnique({
            where: { scanId },
            select: {
                status: true,
                updatedAt: true,
                razorpayOrderId: true,
            },
        });

        if (scan.isPaid || payment?.status === 'CAPTURED') {
            return NextResponse.json({
                scanId,
                status: 'CAPTURED',
                canRetry: false,
                message: statusMessage('CAPTURED'),
                updatedAt: payment?.updatedAt?.toISOString() ?? null,
            });
        }

        if (!payment) {
            return NextResponse.json({
                scanId,
                status: 'NOT_CREATED',
                canRetry: true,
                message: statusMessage('NOT_CREATED'),
                updatedAt: null,
            });
        }

        const status = payment.status === 'FAILED' || payment.status === 'REFUNDED'
            ? 'FAILED'
            : 'CREATED';

        return NextResponse.json({
            scanId,
            status,
            canRetry: true,
            message: statusMessage(status),
            updatedAt: payment.updatedAt.toISOString(),
            lastOrderId: payment.razorpayOrderId,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error({ action: 'payment.status.error', error: message });
        return ErrorFactory.internalServerError('Unable to fetch payment status.');
    }
}
