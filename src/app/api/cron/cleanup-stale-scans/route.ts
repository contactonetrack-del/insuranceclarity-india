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
import { logger } from '@/lib/logger';
import { requireCronAuthorization } from '@/lib/security/cron-auth';
import { markStaleScansAndPayments } from '@/services/ops.service';

export const dynamic = 'force-dynamic';

const STALE_SCAN_MS = 5 * 60 * 1000;
const STALE_PAYMENT_MS = 2 * 60 * 60 * 1000;

export async function GET(request: NextRequest) {
    const authFailure = requireCronAuthorization(request, { action: 'cron.cleanup-stale-scans' });
    if (authFailure) return authFailure;

    try {
        const staleScanBefore = new Date(Date.now() - STALE_SCAN_MS);
        const stalePaymentBefore = new Date(Date.now() - STALE_PAYMENT_MS);

        const [staleScans, stalePayments] = await markStaleScansAndPayments(staleScanBefore, stalePaymentBefore);

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

