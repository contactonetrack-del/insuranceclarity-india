/**
 * GET /api/cron/reset-scans
 *
 * Monthly usage reset — resets scansUsed = 0 for all FREE and PRO users.
 * Triggered by Vercel Cron on the 1st of every month at midnight UTC.
 *
 * Security: Requires CRON_SECRET in Authorization header.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    // Validate cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        logger.warn({ action: 'cron.reset-scans.unauthorized', ip: request.headers.get('x-forwarded-for') });
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Reset scan counts for all non-ENTERPRISE users
        const result = await prisma.user.updateMany({
            where: {
                plan: { in: ['FREE', 'PRO'] },
            },
            data: {
                scansUsed: 0,
            },
        });

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
