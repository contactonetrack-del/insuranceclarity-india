import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { sendUrgentWebhook } from '@/lib/observability/alerts';
import { requireCronAuthorization } from '@/lib/security/cron-auth';
import { downgradeExpiredSubscription, findExpiredSubscriptions } from '@/services/ops.service';

/**
 * GET /api/cron/subscription-downgrade
 *
 * Scheduled job to enforce subscription downgrades at period end.
 * Runs daily at midnight to check expired subscriptions.
 */
export async function GET(request: Request) {
    try {
        const authFailure = requireCronAuthorization(request, { action: 'cron.subscription-downgrade' });
        if (authFailure) return authFailure;

        const now = new Date();
        let downgradedCount = 0;
        let errorCount = 0;

        // Find all subscriptions that have expired (currentPeriodEnd < now)
        // and user is still on paid plan
        const expiredSubscriptions = await findExpiredSubscriptions(now);

        logger.info(`Found ${expiredSubscriptions.length} expired subscriptions to process`);

        for (const subscription of expiredSubscriptions) {
            try {
                if (subscription.status !== 'ACTIVE' && subscription.status !== 'CANCELLED') {
                    logger.warn({
                        action: 'subscription.downgrade.skip-unsupported-status',
                        subscriptionId: subscription.id,
                        status: subscription.status,
                    });
                    continue;
                }

                // Downgrade user to FREE plan
                await downgradeExpiredSubscription(
                    subscription.id,
                    subscription.userId,
                    subscription.status,
                );

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
