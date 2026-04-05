import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import Razorpay from 'razorpay';
import { getRazorpayCredentials } from '@/lib/security/env';
import { sendUrgentWebhook } from '@/lib/observability/alerts';

/**
 * GET /api/cron/payment-reconciliation
 * 
 * Scheduled job to sweep "CREATED" payments older than 30 minutes.
 * Prevents revenue tracking loss if Webhooks drop or clients hard-close tabs.
 */
export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        // Simple security: Since cron comes from Vercel, it uses the CRON_SECRET if configured.
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

        // Limit sweep to slightly older, preventing clash with active checkouts
        const pendingPayments = await prisma.payment.findMany({
            where: {
                status: 'CREATED',
                createdAt: { lte: thirtyMinutesAgo }
            },
            take: 50 // process in batches
        });

        if (pendingPayments.length === 0) {
            return NextResponse.json({ message: 'No pending payments to reconcile' });
        }

        const { keyId, keySecret } = getRazorpayCredentials();
        const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
        let reconciledCount = 0;

        for (const payment of pendingPayments) {
            try {
                const orderData = await razorpay.orders.fetch(payment.razorpayOrderId);
                const orderStatus = orderData.status; // 'created', 'attempted', 'paid'
                
                if (orderStatus === 'paid') {
                    // Fetch actual payment intent to mark complete
                    const paymentsForOrder = await razorpay.orders.fetchPayments(payment.razorpayOrderId);
                    const successfulPayment = paymentsForOrder.items.find(p => p.status === 'captured');

                    if (successfulPayment) {
                        await prisma.$transaction([
                            prisma.payment.update({
                                where: { id: payment.id },
                                data: {
                                    status: 'CAPTURED',
                                    razorpayPaymentId: successfulPayment.id,
                                }
                            }),
                            prisma.scan.update({
                                where: { id: payment.scanId },
                                data: { isPaid: true }
                            })
                        ]);
                        reconciledCount++;
                        logger.info({ action: 'cron.reconcile.success', paymentId: payment.id, scanId: payment.scanId });
                    }
                } else if (orderData.created_at < Math.floor(Date.now() / 1000) - (24 * 60 * 60)) {
                    // Fail out orders older than 24 hours that were never captured
                    await prisma.payment.update({
                        where: { id: payment.id },
                        data: { status: 'FAILED' }
                    });
                }
            } catch (err) {
                logger.error({ action: 'cron.reconcile.sweep_error', paymentId: payment.id, error: String(err) });
            }
        }

        if (reconciledCount > 5) {
            await sendUrgentWebhook(
                'High Payment Reconciliation Rate', 
                `Reconciled ${reconciledCount} dropped webhooks in a single cron run. Investigate Webhook queue latency.`,
                'WARNING'
            );
        }

        return NextResponse.json({ message: `Reconciled ${reconciledCount} payments.`, swept: pendingPayments.length });
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        logger.error({ action: 'cron.reconcile.fatal', error: errorMsg });
        await sendUrgentWebhook('Cron Fatal Error', `Payment Reconciliation crashed: ${errorMsg}`, 'CRITICAL');
        return NextResponse.json({ error: errorMsg }, { status: 500 });
    }
}
