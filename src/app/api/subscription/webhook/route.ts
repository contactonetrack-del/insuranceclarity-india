/**
 * POST /api/subscription/webhook
 *
 * Handles Razorpay webhook events for subscription lifecycle management.
 *
 * Events handled:
 * - subscription.activated   → upgrade User.plan to PRO/ENTERPRISE
 * - subscription.charged     → renew subscription period
 * - subscription.cancelled   → mark as cancelled (plan downgrades at period end)
 * - subscription.completed   → downgrade User.plan to FREE
 * - subscription.paused      → pause subscription
 *
 * Security:
 * - Verifies Razorpay HMAC-SHA256 signature on every request
 * - Returns 200 immediately to prevent Razorpay from retrying
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import {
    activateSubscription,
    verifyWebhookSignature,
} from '@/services/subscription.service';
import { prisma } from '@/lib/prisma';
import { redisClient } from '@/lib/cache/redis';
import { logAuditEvent } from '@/services/audit.service';

// Razorpay webhook events we care about
type RazorpayWebhookEvent =
    | 'subscription.authenticated'
    | 'subscription.activated'
    | 'subscription.charged'
    | 'subscription.cancelled'
    | 'subscription.completed'
    | 'subscription.paused'
    | 'subscription.resumed'
    | 'subscription.expired';

interface RazorpayWebhookPayload {
    event: RazorpayWebhookEvent;
    payload: {
        subscription: {
            entity: {
                id: string;
                status: string;
                plan_id?: string;
                current_start?: number;
                current_end?: number;
                charge_at?: number;
            };
        };
    };
}

export async function POST(request: NextRequest) {
    // Read raw body for signature verification (must be before any .json() calls)
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature') ?? '';

    // Always return 200 to Razorpay (prevents retries on our processing errors)
    // We validate signature and process asynchronously

    if (!verifyWebhookSignature(rawBody, signature)) {
        logger.warn({ action: 'subscription.webhook.invalid.signature' });
        // Return 200 to stop Razorpay from retrying, but log the failure
        return NextResponse.json({ received: true, valid: false });
    }

    let webhookPayload: RazorpayWebhookPayload;
    try {
        webhookPayload = JSON.parse(rawBody) as RazorpayWebhookPayload;
    } catch {
        logger.error({ action: 'subscription.webhook.parse.error' });
        return NextResponse.json({ received: true });
    }

    const { event, payload } = webhookPayload;
    const subscription = payload?.subscription?.entity;

    if (!subscription?.id) {
        logger.warn({ action: 'subscription.webhook.no.subscription', event });
        return NextResponse.json({ received: true });
    }

    const razorpayEventId = request.headers.get('x-razorpay-event-id');
    if (razorpayEventId) {
        const isSet = await redisClient.setnx(`webhook:lock:${razorpayEventId}`, "processed");
        if (isSet === 0) {
            logger.info({ action: 'subscription.webhook.duplicate', razorpayEventId });
            return NextResponse.json({ received: true, status: 'duplicate' });
        }
        await redisClient.expire(`webhook:lock:${razorpayEventId}`, 86400);
    }

    logger.info({
        action: 'subscription.webhook.received',
        event,
        subscriptionId: subscription.id,
        status: subscription.status,
        razorpayEventId,
    });

    try {
        switch (event) {
            case 'subscription.authenticated':
            case 'subscription.activated':
            case 'subscription.charged': {
                // Plan upgrade — set to ACTIVE and extend period
                const start = subscription.current_start
                    ? new Date(subscription.current_start * 1000)
                    : new Date();
                const end = subscription.current_end
                    ? new Date(subscription.current_end * 1000)
                    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // +30 days

                const updatedSub = await activateSubscription(subscription.id, start, end);

                // Audit log
                await logAuditEvent({
                    userId: updatedSub?.userId,
                    action: `subscription.${event.split('.')[1]}`,
                    resource: 'subscription',
                    resourceId: updatedSub?.id,
                    details: {
                        razorpaySubscriptionId: subscription.id,
                        planId: subscription.plan_id,
                        periodStart: start.toISOString(),
                        periodEnd: end.toISOString(),
                    },
                    ipAddress: request.headers.get('x-forwarded-for') || undefined,
                });
                break;
            }

            case 'subscription.cancelled': {
                // Mark as cancelled — plan stays active until period end
                const sub = await prisma.subscription.findUnique({
                    where: { razorpaySubscriptionId: subscription.id },
                    select: { id: true, userId: true, plan: true },
                });

                await prisma.subscription.update({
                    where: { razorpaySubscriptionId: subscription.id },
                    data: { status: 'CANCELLED', cancelledAt: new Date() },
                }).catch((err: unknown) => {
                    logger.warn({ action: 'subscription.cancel.db.failed', error: String(err) });
                });

                // Audit log
                if (sub) {
                    await logAuditEvent({
                        userId: sub.userId,
                        action: 'subscription.cancelled',
                        resource: 'subscription',
                        resourceId: sub.id,
                        details: {
                            razorpaySubscriptionId: subscription.id,
                            plan: sub.plan,
                        },
                        ipAddress: request.headers.get('x-forwarded-for') || undefined,
                    });
                }
                break;
            }

            case 'subscription.resumed': {
                const start = subscription.current_start
                    ? new Date(subscription.current_start * 1000)
                    : new Date();
                const end = subscription.current_end
                    ? new Date(subscription.current_end * 1000)
                    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

                const updatedSub = await activateSubscription(subscription.id, start, end);

                // Audit log
                await logAuditEvent({
                    userId: updatedSub?.userId,
                    action: 'subscription.resumed',
                    resource: 'subscription',
                    resourceId: updatedSub?.id,
                    details: {
                        razorpaySubscriptionId: subscription.id,
                        periodStart: start.toISOString(),
                        periodEnd: end.toISOString(),
                    },
                    ipAddress: request.headers.get('x-forwarded-for') || undefined,
                });
                break;
            }

            case 'subscription.completed':
            case 'subscription.paused':
            case 'subscription.expired': {
                // Downgrade user plan to FREE
                const sub = await prisma.subscription.findUnique({
                    where: { razorpaySubscriptionId: subscription.id },
                    select: { id: true, userId: true, plan: true },
                });
                if (sub) {
                    await prisma.$transaction([
                        prisma.subscription.update({
                            where: { razorpaySubscriptionId: subscription.id },
                            data: {
                                status: event === 'subscription.completed'
                                    ? 'COMPLETED'
                                    : event === 'subscription.expired'
                                        ? 'EXPIRED'
                                        : 'PAUSED',
                            },
                        }),
                        prisma.user.update({
                            where: { id: sub.userId },
                            data: { plan: 'FREE', planExpiresAt: null },
                        }),
                    ]);

                    // Audit log
                    await logAuditEvent({
                        userId: sub.userId,
                        action: `subscription.${event.split('.')[1]}`,
                        resource: 'subscription',
                        resourceId: sub.id,
                        details: {
                            razorpaySubscriptionId: subscription.id,
                            previousPlan: sub.plan,
                            newPlan: 'FREE',
                        },
                        ipAddress: request.headers.get('x-forwarded-for') || undefined,
                    });
                }
                break;
            }

            default:
                logger.info({ action: 'subscription.webhook.unhandled', event });
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error({ action: 'subscription.webhook.processing.error', event, error: message });
        // Still return 200 — Razorpay has already sent the event
    }

    return NextResponse.json({ received: true });
}
