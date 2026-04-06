import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { sendUrgentWebhook } from '@/lib/observability/alerts';

/**
 * GET /api/cron/payment-cleanup
 *
 * Scheduled job to auto-fail stale payment orders after 24 hours.
 * Prevents accumulation of CREATED orders that were never completed.
 */
export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        let failedCount = 0;
        let errorCount = 0;

        // Find all payment records that are still CREATED and older than 24h
        const stalePayments = await prisma.payment.findMany({
            where: {
                status: 'CREATED',
                createdAt: {
                    lt: twentyFourHoursAgo
                }
            }
        });

        logger.info(`Found ${stalePayments.length} stale payments to auto-fail`);

        for (const payment of stalePayments) {
            try {
                // Update payment status to FAILED
                await prisma.payment.update({
                    where: { id: payment.id },
                    data: { status: 'FAILED' }
                });

                // If there's an associated scan, mark it as failed too
                if (payment.scanId) {
                    await prisma.scan.update({
                        where: { id: payment.scanId },
                        data: { status: 'FAILED' }
                    });
                }

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