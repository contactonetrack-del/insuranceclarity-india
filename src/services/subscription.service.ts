/**
 * Subscription Service - Razorpay recurring billing.
 *
 * Manages Pro and Enterprise subscription lifecycle:
 * - Create subscription via Razorpay Subscriptions API
 * - Verify webhook events (subscription activated, cancelled, etc.)
 * - Upgrade/downgrade User.plan in DB
 * - Send confirmation emails
 */

import { logger } from '@/lib/logger';
import { sendWelcomeEmail } from '@/services/email.service';
import { getRazorpayPlanId } from '@/lib/security/env';
import { subscriptionRepository } from '@/repositories/subscription.repository';
import { getPaymentProvider } from '@/lib/payments/provider';
import crypto from 'crypto';
import { after } from 'next/server';

// Razorpay plan IDs are configured in env and dashboard:
// https://dashboard.razorpay.com/app/subscriptions/plans

export interface CreateSubscriptionInput {
    userId: string;
    plan: 'PRO' | 'ENTERPRISE';
    userEmail: string;
    userName: string;
}

export interface SubscriptionDetails {
    subscriptionId: string;
    planId: string;
    shortUrl: string;
    status: string;
}

/**
 * Creates a Razorpay subscription for the given user/plan.
 * Returns subscription details including hosted checkout URL.
 */
export async function createRazorpaySubscription(
    input: CreateSubscriptionInput,
): Promise<SubscriptionDetails> {
    const { userId, plan, userEmail, userName } = input;

    const existingActive = await subscriptionRepository.findLatestActiveOrCreatedForUser(userId);

    if (existingActive?.status === 'ACTIVE' && existingActive.currentPeriodEnd && existingActive.currentPeriodEnd > new Date()) {
        throw new Error('You already have an active subscription.');
    }

    const planId = getRazorpayPlanId(plan);

    const paymentProvider = getPaymentProvider();
    const subscription = await paymentProvider.createSubscription({
        planId,
        totalCount: 12,
        quantity: 1,
        notifyEmail: userEmail,
        userId,
        plan,
        userName,
    });

    await subscriptionRepository.upsertCreatedSubscription({
        userId,
        plan,
        razorpaySubscriptionId: subscription.id,
        razorpayPlanId: subscription.planId,
    });

    logger.info({
        action: 'subscription.created',
        userId,
        plan,
        subscriptionId: subscription.id,
    });

    return {
        subscriptionId: subscription.id,
        planId: subscription.planId,
        shortUrl: subscription.shortUrl,
        status: subscription.status,
    };
}

/**
 * Activates a subscription after successful payment verification.
 * Updates Subscription status and User plan.
 */
export async function activateSubscription(
    razorpaySubscriptionId: string,
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
): Promise<{ id: string; userId: string } | null> {
    const subscription = await subscriptionRepository.findForActivation(razorpaySubscriptionId);

    if (!subscription) {
        logger.warn({ action: 'subscription.activate.notfound', razorpaySubscriptionId });
        return null;
    }

    await subscriptionRepository.activateAndUpgradeUser({
        razorpaySubscriptionId,
        userId: subscription.userId,
        plan: subscription.plan,
        currentPeriodStart,
        currentPeriodEnd,
    });

    logger.info({
        action: 'subscription.activated',
        userId: subscription.userId,
        plan: subscription.plan,
        subscriptionId: razorpaySubscriptionId,
    });

    const userEmail = subscription.user?.email;
    if (userEmail) {
        after(() => {
            sendWelcomeEmail(userEmail, {
                userName: subscription.user!.name ?? 'there',
            }).catch(() => { /* non-fatal */ });
        });
    }

    return {
        id: subscription.id,
        userId: subscription.userId,
    };
}

/**
 * Cancels a subscription and updates local state.
 * If cancelled immediately, user is downgraded now.
 */
export async function cancelSubscription(
    razorpaySubscriptionId: string,
    atPeriodEnd = true,
): Promise<void> {
    const paymentProvider = getPaymentProvider();
    await paymentProvider.cancelSubscription(razorpaySubscriptionId, atPeriodEnd).catch((err: unknown) => {
        logger.warn({ action: 'subscription.cancel.razorpay.failed', error: String(err) });
    });

    const subscription = await subscriptionRepository.findByRazorpaySubscriptionIdForCancel(razorpaySubscriptionId);

    if (!subscription) return;

    await subscriptionRepository.cancelByRazorpaySubscriptionIdWithTimestamp(razorpaySubscriptionId, new Date());

    if (!atPeriodEnd) {
        await subscriptionRepository.downgradeUserPlan(subscription.userId);
    }

    logger.info({
        action: 'subscription.cancelled',
        subscriptionId: razorpaySubscriptionId,
        atPeriodEnd,
    });
}

/**
 * Verifies Razorpay webhook signature (HMAC-SHA256).
 */
export function verifyWebhookSignature(
    rawBody: string,
    signature: string,
): boolean {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
        logger.warn({ action: 'webhook.secret.missing' });
        return false;
    }

    const expected = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');

    return crypto.timingSafeEqual(
        Buffer.from(expected),
        Buffer.from(signature),
    );
}
