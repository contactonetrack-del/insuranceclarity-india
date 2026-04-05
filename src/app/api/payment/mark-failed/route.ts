import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

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
    requestIp: string | null;
    ownerUserId: string | null;
    ownerIp: string | null;
}): boolean {
    if (params.isAdmin) return true;

    if (params.ownerUserId) {
        return params.sessionUserId === params.ownerUserId;
    }

    return Boolean(params.ownerIp && params.requestIp && params.ownerIp === params.requestIp);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as {
            scanId?: string;
            razorpayOrderId?: string;
            reason?: string;
        };

        if (!body.scanId || !body.razorpayOrderId) {
            return NextResponse.json(
                { error: 'scanId and razorpayOrderId are required.' },
                { status: 400 },
            );
        }

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

        const isAllowed = canAccessScan({
            isAdmin,
            sessionUserId,
            requestIp,
            ownerUserId: payment.scan.userId,
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

