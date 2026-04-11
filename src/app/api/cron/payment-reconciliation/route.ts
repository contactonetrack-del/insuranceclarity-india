import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { getPaymentProvider } from '@/lib/payments/provider';
import { sendUrgentWebhook } from '@/lib/observability/alerts';
import { requireCronAuthorization } from '@/lib/security/cron-auth';
import { findPendingPaymentsForReconciliation, reconcileCapturedPaymentById } from '@/services/ops.service';
import { markPaymentFailedById } from '@/services/payment.service';

/**
 * GET /api/cron/payment-reconciliation
 * 
 * Scheduled job to sweep "CREATED" payments older than 30 minutes.
 * Prevents revenue tracking loss if Webhooks drop or clients hard-close tabs.
 */
export async function GET(request: Request) {
    try {
        const authFailure = requireCronAuthorization(request, { action: 'cron.payment-reconciliation' });
        if (authFailure) return authFailure;

        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

        // Limit sweep to slightly older, preventing clash with active checkouts
        let totalSwept = 0;
        let reconciledCount = 0;
        const MAX_BATCH_SIZE = 50;
        const MAX_TOTAL_SWEPT = 250; // Safety limit to avoid Vercel timeouts (10s limit on Hobby/Pro)

        const paymentProvider = getPaymentProvider();

        while (totalSwept < MAX_TOTAL_SWEPT) {
            const pendingPayments = await findPendingPaymentsForReconciliation(thirtyMinutesAgo, MAX_BATCH_SIZE);

            if (pendingPayments.length === 0) break;

            for (const payment of pendingPayments) {
                try {
                    const orderData = await paymentProvider.fetchOrder(payment.razorpayOrderId);
                    const orderStatus = orderData.status; // 'created', 'attempted', 'paid'

                    if (orderStatus === 'paid') {
                        // Fetch actual payment intent to mark complete
                        const paymentsForOrder = await paymentProvider.fetchOrderPayments(payment.razorpayOrderId);
                        const successfulPayment = paymentsForOrder.items.find(p => p.status === 'captured');

                        if (successfulPayment) {
                            await reconcileCapturedPaymentById(payment.id, payment.scanId, successfulPayment.id);
                            reconciledCount++;
                            logger.info({ action: 'cron.reconcile.success', paymentId: payment.id, scanId: payment.scanId });
                        }
                    } else if ((orderData.createdAtUnix ?? 0) < Math.floor(Date.now() / 1000) - (24 * 60 * 60)) {
                        // Fail out orders older than 24 hours that were never captured
                        await markPaymentFailedById(payment.id);
                    }
                } catch (err) {
                    logger.error({ action: 'cron.reconcile.sweep_error', paymentId: payment.id, error: String(err) });
                }
            }

            totalSwept += pendingPayments.length;
            // If we didn't fill the batch, we're definitely done with the backlog
            if (pendingPayments.length < MAX_BATCH_SIZE) break;
        }

        if (totalSwept === 0) {
            return NextResponse.json({ message: 'No pending payments to reconcile' });
        }

        if (reconciledCount > 5) {
            await sendUrgentWebhook(
                'High Payment Reconciliation Rate', 
                `Reconciled ${reconciledCount} dropped webhooks in a single cron run. Investigate Webhook queue latency.`,
                'WARNING'
            );
        }

        return NextResponse.json({ message: `Reconciled ${reconciledCount} payments.`, swept: totalSwept });

    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        logger.error({ action: 'cron.reconcile.fatal', error: errorMsg });
        await sendUrgentWebhook('Cron Fatal Error', `Payment Reconciliation crashed: ${errorMsg}`, 'CRITICAL');
        return NextResponse.json({ error: errorMsg }, { status: 500 });
    }
}
