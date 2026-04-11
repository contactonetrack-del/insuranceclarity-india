/**
 * GET /api/cron/reset-scans
 *
 * Monthly usage reset — resets scansUsed = 0 for all FREE and PRO users.
 * Triggered by Vercel Cron on the 1st of every month at midnight UTC.
 *
 * Security: Requires CRON_SECRET in Authorization header.
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { requireCronAuthorization } from '@/lib/security/cron-auth';
import { resetMonthlyScansForFreeAndPro } from '@/services/ops.service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const authFailure = requireCronAuthorization(request, { action: 'cron.reset-scans' });
    if (authFailure) return authFailure;

    try {
        // Reset scan counts for all non-ENTERPRISE users
        const result = await resetMonthlyScansForFreeAndPro();

        logger.info({
            action: 'cron.reset-scans.success',
            usersReset: result.count,
            timestamp: new Date().toISOString(),
        });

        return NextResponse.json({
            success: true,
            usersReset: result.count,
            resetAt: new Date().toISOString(),
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error({ action: 'cron.reset-scans.error', error: message });
        return NextResponse.json({ error: 'Reset failed', details: message }, { status: 500 });
    }
}
