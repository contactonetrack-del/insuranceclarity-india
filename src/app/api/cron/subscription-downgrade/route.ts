import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { sendUrgentWebhook } from '@/lib/observability/alerts';

/**
 * GET /api/cron/subscription-downgrade
 *
 * Scheduled job to enforce subscription downgrades at period end.
 * Runs daily at midnight to check expired subscriptions.
 */
export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const now = new Date();
        let downgradedCount = 0;
        let errorCount = 0;

        // Find all subscriptions that have expired (currentPeriodEnd < now)
        // and user is still on paid plan
        const expiredSubscriptions = await prisma.subscription.findMany({
            where: {
                currentPeriodEnd: {
                    lt: now
                },
                status: {
                    in: ['ACTIVE', 'CANCELLED'] // Include cancelled ones that haven't been processed yet
                }
            },
            include: {
                user: true
            }
        });

        logger.info(`Found ${expiredSubscriptions.length} expired subscriptions to process`);

        for (const subscription of expiredSubscriptions) {
            try {
                // Downgrade user to FREE plan
                await prisma.user.update({
                    where: { id: subscription.userId },
                    data: { plan: 'FREE' }
                });

                // Update subscription status to COMPLETED if it was ACTIVE
                if (subscription.status === 'ACTIVE') {
                    await prisma.subscription.update({
                        where: { id: subscription.id },
                        data: { status: 'COMPLETED' }
                    });
                }

                downgradedCount++;
                logger.info(`Downgraded user ${subscription.userId} from ${subscription.user.plan} to FREE`);

            } catch (error) {
                errorCount++;
                logger.error({ action: 'subscription.downgrade.error', subscriptionId: subscription.id, error });
            }
        }

        // Alert if many downgrades happened (potential issue)
        if (downgradedCount > 10) {
            await sendUrgentWebhook(
                '🚨 High Volume Subscription Downgrades',
                `Downgraded ${downgradedCount} users in this run. Check for subscription sync issues.`,
                'WARNING'
            );
        }

        return NextResponse.json({
            success: true,
            processed: expiredSubscriptions.length,
            downgraded: downgradedCount,
            errors: errorCount
        });

    } catch (error) {
        logger.error({ action: 'subscription.downgrade.cron.error', error });
        await sendUrgentWebhook(
            '💥 Subscription Downgrade Cron Failed',
            `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            'CRITICAL'
        );
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}