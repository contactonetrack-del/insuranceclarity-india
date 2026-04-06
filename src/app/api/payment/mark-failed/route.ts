import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

import { prisma } from '@/lib/prisma';
import { redisClient } from '@/lib/cache/redis';
import { logger } from '@/lib/logger';
import { validateCsrfRequest } from '@/lib/security/csrf';
import { z } from 'zod';

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

const markFailedSchema = z.object({
    scanId: z.string().min(1),
    razorpayOrderId: z.string().min(1),
    reason: z.string().max(120).optional(),
});

export async function POST(request: NextRequest) {
    try {
        const csrfError = validateCsrfRequest(request);
        if (csrfError) return csrfError;

        const claimToken = request.headers.get('x-claim-token');
        const parsed = markFailedSchema.safeParse(await request.json());

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message ?? 'Invalid payload.' },
                { status: 400 },
            );
        }

        const body = parsed.data;

        const session = await auth();
        const sessionUserId = (session?.user as { id?: string } | undefined)?.id ?? null;
        const isAdmin = (session?.user as { role?: string } | undefined)?.role === 'ADMIN';
        const requestIp = getClientIp(request);

        const payment = await prisma.payment.findUnique({
            where: { razorpayOrderId: body.razorpayOrderId },
            select: {
                id: true,
                scanId: true,
                status: true,
                scan: {
                    select: {
                        userId: true,
                        ipAddress: true,
                    },
                },
            },
        });

        if (!payment || payment.scanId !== body.scanId) {
            return NextResponse.json({ error: 'Payment record not found.' }, { status: 404 });
        }

        let claimTokenValid = false;
        if (claimToken && !payment.scan.userId && redisClient.isConfigured()) {
            const claimedScanId = await redisClient.get<string>(`scan:claim:${claimToken}`);
            claimTokenValid = claimedScanId === body.scanId;
        }

        const isAllowed = canAccessScan({
            isAdmin,
            sessionUserId,
            ownerUserId: payment.scan.userId,
            claimTokenValid,
            requestIp,
            ownerIp: payment.scan.ipAddress,
        });

        if (!isAllowed) {
            return NextResponse.json({ error: 'Payment record not found.' }, { status: 404 });
        }

        if (payment.status === 'CAPTURED') {
            return NextResponse.json({ success: true, status: 'CAPTURED' });
        }

        await prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'FAILED' },
        });

        logger.info({
            action: 'payment.mark_failed',
            scanId: body.scanId,
            razorpayOrderId: body.razorpayOrderId,
            reason: body.reason ?? 'unspecified',
        });

        return NextResponse.json({ success: true, status: 'FAILED' });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error({ action: 'payment.mark_failed.error', error: message });
        return NextResponse.json({ error: 'Unable to mark payment attempt as failed.' }, { status: 500 });
    }
}

