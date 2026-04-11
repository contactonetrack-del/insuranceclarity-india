import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { redisClient } from '@/lib/cache/redis';
import { sendUrgentWebhook } from '@/lib/observability/alerts';
import { requireCronAuthorization } from '@/lib/security/cron-auth';
import { countCapturedPaymentsSince, countScansSince } from '@/services/ops.service';

async function sendUrgentWebhookSafely(title: string, message: string, severity: 'WARNING' | 'CRITICAL') {
    try {
        await sendUrgentWebhook(title, message, severity);
    } catch (error) {
        logger.error({
            action: 'cron.anomaly.alert.failed',
            title,
            severity,
            error: error instanceof Error ? error.message : String(error),
        });
    }
}

/**
 * GET /api/cron/anomaly-alerts
 * 
 * Scheduled job to monitor business-critical metrics and technical health.
 * Runs daily or every few hours.
 */
export async function GET(request: Request) {
    try {
        const authFailure = requireCronAuthorization(request, { action: 'cron.anomaly-alerts' });
        if (authFailure) return authFailure;

        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        // ── 1. Check for Zero Conversions in 24h ──
        const capturedCount = await countCapturedPaymentsSince(twentyFourHoursAgo);

        if (capturedCount === 0) {
            // Only alert if we actually had scan attempts (to avoid false positives on zero traffic)
            const scanCount = await countScansSince(twentyFourHoursAgo);

            if (scanCount > 5) {
                await sendUrgentWebhookSafely(
                    '⚠️ ZERO Conversions in 24h',
                    `Found 0 captured payments despite ${scanCount} scan attempts in the last 24h. Check Razorpay integration and checkout UI.`,
                    'CRITICAL'
                );
            }
        }

        // ── 2. Check for Dead-Letter Queue Spike ──
        let dlqCount = 0;
        if (redisClient.isConfigured()) {
            const dlqKeys = await redisClient.keys('queue:dead-letter:*');
            dlqCount = dlqKeys.length;

            if (dlqCount > 10) {
                await sendUrgentWebhookSafely(
                    '🔥 Background Job Failure Spike',
                    `Detected ${dlqCount} jobs in the dead-letter queue. Background processing (scans/emails) is failing.`,
                    'WARNING'
                );
            }
        }

        return NextResponse.json({ 
            success: true, 
            metrics: {
                capturedLast24h: capturedCount,
                deadLetterCount: dlqCount
            }
        });

    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        logger.error({ action: 'cron.anomaly.fatal', error: errorMsg });
        return NextResponse.json({ error: errorMsg }, { status: 500 });
    }
}
