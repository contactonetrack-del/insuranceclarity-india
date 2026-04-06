/**
 * Subscription Service â€” Razorpay Recurring Billing
 *
 * Manages Pro and Enterprise subscription lifecycle:
 * - Create subscription via Razorpay Subscriptions API
 * - Verify webhook events (subscription activated, cancelled, etc.)
 * - Upgrade/downgrade User.plan in DB
 * - Send confirmation emails
 */

import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { sendWelcomeEmail } from '@/services/email.service';
import { getRazorpayCredentials, getRazorpayPlanId } from '@/lib/security/env';
import crypto from 'crypto';
import { after } from 'next/server';

// ——— Razorpay Plan IDs (set these in your Razorpay dashboard) ——————————————————————
// Create plans at: https://dashboard.razorpay.com/app/subscriptions/plans

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Razorpay Client Helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function getRazorpayAuth(): string {
    const { keyId, keySecret } = getRazorpayCredentials();
    return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;
}

async function razorpayRequest<T>(
    path: string,
    method: string,
    body?: Record<string, unknown>,
): Promise<T> {
    const response = await fetch(`https://api.razorpay.com/v1${path}`, {
        method,
        headers: {
            'Authorization': getRazorpayAuth(),
            'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({ description: response.statusText })) as { description?: string };
        throw new Error(`Razorpay API error: ${err.description ?? response.statusText}`);
    }

    return response.json() as Promise<T>;
}

// â”€â”€â”€ Create Subscription â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Creates a Razorpay subscription for the given user/plan.
 * Returns the subscription details including a hosted payment link.
 */
export async function createRazorpaySubscription(
    input: CreateSubscriptionInput,
): Promise<SubscriptionDetails> {
    const { userId, plan, userEmail, userName } = input;

    const existingActive = await prisma.subscription.findFirst({
        where: {
            userId,
            status: { in: ['CREATED', 'AUTHENTICATED', 'ACTIVE'] },
        },
        orderBy: { createdAt: 'desc' },
    });

    if (existingActive?.status === 'ACTIVE' && existingActive.currentPeriodEnd && existingActive.currentPeriodEnd > new Date()) {
        throw new Error('You already have an active subscription.');
    }

    const planId = getRazorpayPlanId(plan);

    interface RazorpaySubscriptionResponse {
        id: string;
        plan_id: string;
        short_url: string;
        status: string;
    }

    const subscription = await razorpayRequest<RazorpaySubscriptionResponse>('/subscriptions', 'POST', {
        plan_id: planId,
        total_count: 12,          // 12 billing cycles (1 year)
        quantity: 1,
        notify_info: {
            notify_phone: '',
            notify_email: userEmail,
        },
        notes: {
            userId,
            plan,
            userName,
        },
    });

    // Persist to DB (upsert by Razorpay subscription id for idempotency)
    await prisma.subscription.upsert({
        where: { razorpaySubscriptionId: subscription.id },
        create: {
            userId,
            plan,
            razorpaySubscriptionId: subscription.id,
            razorpayPlanId: subscription.plan_id,
            status: 'CREATED',
        },
        update: {
            userId,
            plan,
            razorpayPlanId: subscription.plan_id,
            status: 'CREATED',
            cancelledAt: null,
        },
    });

    logger.info({
        action: 'subscription.created',
        userId,
        plan,
        subscriptionId: subscription.id,
    });

    return {
        subscriptionId: subscription.id,
        planId: subscription.plan_id,
        shortUrl: subscription.short_url,
        status: subscription.status,
    };
}

// â”€â”€â”€ Activate Subscription (called from webhook) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Activates a subscription after successful payment verification.
 * Updates User.plan and Subscription.status in DB.
 */
export async function activateSubscription(
    razorpaySubscriptionId: string,
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
): Promise<{ id: string; userId: string } | null> {
    const subscription = await prisma.subscription.findUnique({
        where: { razorpaySubscriptionId },
        include: { user: { select: { email: true, name: true } } },
    });

    if (!subscription) {
        logger.warn({ action: 'subscription.activate.notfound', razorpaySubscriptionId });
        return null;
    }

    await prisma.$transaction([
        // Update subscription status
        prisma.subscription.update({
            where: { razorpaySubscriptionId },
            data: {
                status: 'ACTIVE',
                currentPeriodStart,
                currentPeriodEnd,
            },
        }),
        // Upgrade user's plan
        prisma.user.update({
            where: { id: subscription.userId },
            data: {
                plan: subscription.plan,
                planExpiresAt: currentPeriodEnd,
            },
        }),
    ]);

    logger.info({
        action: 'subscription.activated',
        userId: subscription.userId,
        plan: subscription.plan,
        subscriptionId: razorpaySubscriptionId,
    });

    const userEmail = subscription.user?.email;
    if (userEmail) {
        // Enqueue email async execution so webhook doesn't block
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

// â”€â”€â”€ Cancel Subscription â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Cancels a subscription â€” downgrades user plan back to FREE at period end.
 */
export async function cancelSubscription(
    razorpaySubscriptionId: string,
    atPeriodEnd = true,
): Promise<void> {
    // Cancel in Razorpay
    await razorpayRequest(`/subscriptions/${razorpaySubscriptionId}/cancel`, 'POST', {
        cancel_at_cycle_end: atPeriodEnd ? 1 : 0,
    }).catch((err: unknown) => {
        logger.warn({ action: 'subscription.cancel.razorpay.failed', error: String(err) });
    });

    // Update DB
    const subscription = await prisma.subscription.findUnique({
        where: { razorpaySubscriptionId },
    });

    if (!subscription) return;

    await prisma.subscription.update({
        where: { razorpaySubscriptionId },
        data: {
            status: 'CANCELLED',
            cancelledAt: new Date(),
        },
    });

    // If cancelling immediately, downgrade plan now
    if (!atPeriodEnd) {
        await prisma.user.update({
            where: { id: subscription.userId },
            data: { plan: 'FREE', planExpiresAt: null },
        });
    }

    logger.info({
        action: 'subscription.cancelled',
        subscriptionId: razorpaySubscriptionId,
        atPeriodEnd,
    });
}

// â”€â”€â”€ Webhook Signature Verification â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Verifies Razorpay webhook signature (HMAC-SHA256).
 * Must be called before processing any webhook payload.
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
