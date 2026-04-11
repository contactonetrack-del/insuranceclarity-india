import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { sendUrgentWebhook } from '@/lib/observability/alerts';
import { requireCronAuthorization } from '@/lib/security/cron-auth';
import { failPaymentAndScan, findStaleCreatedPayments } from '@/services/ops.service';

/**
 * GET /api/cron/payment-cleanup
 *
 * Scheduled job to auto-fail stale payment orders after 24 hours.
 * Prevents accumulation of CREATED orders that were never completed.
 */
export async function GET(request: Request) {
    try {
        const authFailure = requireCronAuthorization(request, { action: 'cron.payment-cleanup' });
        if (authFailure) return authFailure;

        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        let failedCount = 0;
        let errorCount = 0;

        // Find all payment records that are still CREATED and older than 24h
        const stalePayments = await findStaleCreatedPayments(twentyFourHoursAgo);

        logger.info(`Found ${stalePayments.length} stale payments to auto-fail`);

        for (const payment of stalePayments) {
            try {
                // Update payment status to FAILED
                await failPaymentAndScan(payment.id, payment.scanId);

                failedCount++;
                logger.info(`Auto-failed stale payment ${payment.id} and scan ${payment.scanId}`);

            } catch (error) {
                errorCount++;
                logger.error({ action: 'payment.auto_fail.error', paymentId: payment.id, error });
            }
        }

        // Alert if many stale payments (potential Razorpay issue)
        if (failedCount > 10) {
            await sendUrgentWebhook(
                '🚨 High Volume Stale Payments',
                `Auto-failed ${failedCount} payments older than 24h. Check Razorpay webhook delivery.`,
                'WARNING'
            );
        }

        return NextResponse.json({
            success: true,
            processed: stalePayments.length,
            failed: failedCount,
            errors: errorCount
        });

    } catch (error) {
        logger.error({ action: 'payment.cleanup.cron.error', error });
        await sendUrgentWebhook(
            '💥 Payment Cleanup Cron Failed',
            `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            'CRITICAL'
        );
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
