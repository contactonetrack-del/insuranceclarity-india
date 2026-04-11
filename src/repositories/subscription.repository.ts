import { logDbQuery, logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

export class SubscriptionRepository {
    async countActive() {
        const start = Date.now();
        try {
            const result = await prisma.subscription.count({ where: { status: 'ACTIVE' } });
            logDbQuery('Subscription', 'countActive', Date.now() - start);
            return result;
        } catch (error) {
            logger.error({ error, action: 'countActive', model: 'Subscription' }, 'Repository Error: Subscription.countActive');
            throw error;
        }
    }

    async findByRazorpaySubscriptionId(razorpaySubscriptionId: string) {
        const start = Date.now();
        try {
            const result = await prisma.subscription.findUnique({
                where: { razorpaySubscriptionId },
                select: { id: true, userId: true, plan: true },
            });
            logDbQuery('Subscription', 'findByRazorpaySubscriptionId', Date.now() - start, {
                razorpaySubscriptionId,
            });
            return result;
        } catch (error) {
            logger.error(
                { error, action: 'findByRazorpaySubscriptionId', model: 'Subscription', razorpaySubscriptionId },
                'Repository Error: Subscription.findByRazorpaySubscriptionId',
            );
            throw error;
        }
    }

    async cancelByRazorpaySubscriptionId(razorpaySubscriptionId: string) {
        const start = Date.now();
        try {
            const result = await prisma.subscription.update({
                where: { razorpaySubscriptionId },
                data: { status: 'CANCELLED', cancelledAt: new Date() },
            });
            logDbQuery('Subscription', 'cancelByRazorpaySubscriptionId', Date.now() - start, {
                razorpaySubscriptionId,
            });
            return result;
        } catch (error) {
            logger.error(
                { error, action: 'cancelByRazorpaySubscriptionId', model: 'Subscription', razorpaySubscriptionId },
                'Repository Error: Subscription.cancelByRazorpaySubscriptionId',
            );
            throw error;
        }
    }

    async completePauseOrExpireAndDowngrade(params: {
        razorpaySubscriptionId: string;
        status: 'COMPLETED' | 'PAUSED' | 'EXPIRED';
        userId: string;
    }) {
        const start = Date.now();
        try {
            const result = await prisma.$transaction([
                prisma.subscription.update({
                    where: { razorpaySubscriptionId: params.razorpaySubscriptionId },
                    data: { status: params.status },
                }),
                prisma.user.update({
                    where: { id: params.userId },
                    data: { plan: 'FREE', planExpiresAt: null },
                }),
            ]);
            logDbQuery('Subscription', 'completePauseOrExpireAndDowngrade', Date.now() - start, {
                razorpaySubscriptionId: params.razorpaySubscriptionId,
                status: params.status,
                userId: params.userId,
            });
            return result;
        } catch (error) {
            logger.error(
                {
                    error,
                    action: 'completePauseOrExpireAndDowngrade',
                    model: 'Subscription',
                    razorpaySubscriptionId: params.razorpaySubscriptionId,
                    status: params.status,
                    userId: params.userId,
                },
                'Repository Error: Subscription.completePauseOrExpireAndDowngrade',
            );
            throw error;
        }
    }

    async findLatestActiveOrCreatedForUser(userId: string) {
        const start = Date.now();
        try {
            const result = await prisma.subscription.findFirst({
                where: {
                    userId,
                    status: { in: ['CREATED', 'AUTHENTICATED', 'ACTIVE'] },
                },
                orderBy: { createdAt: 'desc' },
            });
            logDbQuery('Subscription', 'findLatestActiveOrCreatedForUser', Date.now() - start, { userId });
            return result;
        } catch (error) {
            logger.error(
                { error, action: 'findLatestActiveOrCreatedForUser', model: 'Subscription', userId },
                'Repository Error: Subscription.findLatestActiveOrCreatedForUser',
            );
            throw error;
        }
    }

    async upsertCreatedSubscription(params: {
        userId: string;
        plan: 'PRO' | 'ENTERPRISE';
        razorpaySubscriptionId: string;
        razorpayPlanId: string;
    }) {
        const start = Date.now();
        try {
            const result = await prisma.subscription.upsert({
                where: { razorpaySubscriptionId: params.razorpaySubscriptionId },
                create: {
                    userId: params.userId,
                    plan: params.plan,
                    razorpaySubscriptionId: params.razorpaySubscriptionId,
                    razorpayPlanId: params.razorpayPlanId,
                    status: 'CREATED',
                },
                update: {
                    userId: params.userId,
                    plan: params.plan,
                    razorpayPlanId: params.razorpayPlanId,
                    status: 'CREATED',
                    cancelledAt: null,
                },
            });
            logDbQuery('Subscription', 'upsertCreatedSubscription', Date.now() - start, {
                userId: params.userId,
                razorpaySubscriptionId: params.razorpaySubscriptionId,
            });
            return result;
        } catch (error) {
            logger.error(
                {
                    error,
                    action: 'upsertCreatedSubscription',
                    model: 'Subscription',
                    userId: params.userId,
                    razorpaySubscriptionId: params.razorpaySubscriptionId,
                },
                'Repository Error: Subscription.upsertCreatedSubscription',
            );
            throw error;
        }
    }

    async findForActivation(razorpaySubscriptionId: string) {
        const start = Date.now();
        try {
            const result = await prisma.subscription.findUnique({
                where: { razorpaySubscriptionId },
                include: { user: { select: { email: true, name: true } } },
            });
            logDbQuery('Subscription', 'findForActivation', Date.now() - start, { razorpaySubscriptionId });
            return result;
        } catch (error) {
            logger.error(
                { error, action: 'findForActivation', model: 'Subscription', razorpaySubscriptionId },
                'Repository Error: Subscription.findForActivation',
            );
            throw error;
        }
    }

    async activateAndUpgradeUser(params: {
        razorpaySubscriptionId: string;
        userId: string;
        plan: 'FREE' | 'PRO' | 'ENTERPRISE';
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
    }) {
        const start = Date.now();
        try {
            const result = await prisma.$transaction([
                prisma.subscription.update({
                    where: { razorpaySubscriptionId: params.razorpaySubscriptionId },
                    data: {
                        status: 'ACTIVE',
                        currentPeriodStart: params.currentPeriodStart,
                        currentPeriodEnd: params.currentPeriodEnd,
                    },
                }),
                prisma.user.update({
                    where: { id: params.userId },
                    data: {
                        plan: params.plan,
                        planExpiresAt: params.currentPeriodEnd,
                    },
                }),
            ]);
            logDbQuery('Subscription', 'activateAndUpgradeUser', Date.now() - start, {
                razorpaySubscriptionId: params.razorpaySubscriptionId,
                userId: params.userId,
            });
            return result;
        } catch (error) {
            logger.error(
                {
                    error,
                    action: 'activateAndUpgradeUser',
                    model: 'Subscription',
                    razorpaySubscriptionId: params.razorpaySubscriptionId,
                    userId: params.userId,
                },
                'Repository Error: Subscription.activateAndUpgradeUser',
            );
            throw error;
        }
    }

    async findByRazorpaySubscriptionIdForCancel(razorpaySubscriptionId: string) {
        const start = Date.now();
        try {
            const result = await prisma.subscription.findUnique({
                where: { razorpaySubscriptionId },
            });
            logDbQuery('Subscription', 'findByRazorpaySubscriptionIdForCancel', Date.now() - start, { razorpaySubscriptionId });
            return result;
        } catch (error) {
            logger.error(
                { error, action: 'findByRazorpaySubscriptionIdForCancel', model: 'Subscription', razorpaySubscriptionId },
                'Repository Error: Subscription.findByRazorpaySubscriptionIdForCancel',
            );
            throw error;
        }
    }

    async cancelByRazorpaySubscriptionIdWithTimestamp(razorpaySubscriptionId: string, cancelledAt: Date) {
        const start = Date.now();
        try {
            const result = await prisma.subscription.update({
                where: { razorpaySubscriptionId },
                data: {
                    status: 'CANCELLED',
                    cancelledAt,
                },
            });
            logDbQuery('Subscription', 'cancelByRazorpaySubscriptionIdWithTimestamp', Date.now() - start, {
                razorpaySubscriptionId,
            });
            return result;
        } catch (error) {
            logger.error(
                {
                    error,
                    action: 'cancelByRazorpaySubscriptionIdWithTimestamp',
                    model: 'Subscription',
                    razorpaySubscriptionId,
                },
                'Repository Error: Subscription.cancelByRazorpaySubscriptionIdWithTimestamp',
            );
            throw error;
        }
    }

    async downgradeUserPlan(userId: string) {
        const start = Date.now();
        try {
            const result = await prisma.user.update({
                where: { id: userId },
                data: { plan: 'FREE', planExpiresAt: null },
            });
            logDbQuery('User', 'downgradeUserPlan', Date.now() - start, { userId });
            return result;
        } catch (error) {
            logger.error(
                { error, action: 'downgradeUserPlan', model: 'User', userId },
                'Repository Error: User.downgradeUserPlan',
            );
            throw error;
        }
    }
}

export const subscriptionRepository = new SubscriptionRepository();
