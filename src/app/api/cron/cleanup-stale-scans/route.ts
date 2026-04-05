/**
 * GET /api/cron/cleanup-stale-scans
 *
 * Marks long-running scan/payment records as failed so users can retry.
 *
 * - Scans: PENDING/PROCESSING older than 5 minutes -> FAILED
 * - Payments: CREATED older than 2 hours -> FAILED
 *
 * Security: Requires CRON_SECRET in Authorization header.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const STALE_SCAN_MS = 5 * 60 * 1000;
const STALE_PAYMENT_MS = 2 * 60 * 60 * 1000;

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        logger.warn({
            action: 'cron.cleanup-stale-scans.unauthorized',
            ip: request.headers.get('x-forwarded-for'),
        });
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const staleScanBefore = new Date(Date.now() - STALE_SCAN_MS);
        const stalePaymentBefore = new Date(Date.now() - STALE_PAYMENT_MS);

        const [staleScans, stalePayments] = await prisma.$transaction([
            prisma.scan.updateMany({
                where: {
                    status: { in: ['PENDING', 'PROCESSING'] },
                    updatedAt: { lt: staleScanBefore },
                },
                data: { status: 'FAILED' },
            }),
            prisma.payment.updateMany({
                where: {
                    status: 'CREATED',
                    createdAt: { lt: stalePaymentBefore },
                },
                data: { status: 'FAILED' },
            }),
        ]);

        logger.info({
            action: 'cron.cleanup-stale-scans.success',
            staleScans: staleScans.count,
            stalePayments: stalePayments.count,
        });

        return NextResponse.json({
            success: true,
            staleScans: staleScans.count,
            stalePayments: stalePayments.count,
            checkedAt: new Date().toISOString(),
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error({ action: 'cron.cleanup-stale-scans.error', error: message });
        return NextResponse.json({ error: 'Cleanup failed', details: message }, { status: 500 });
    }
}

