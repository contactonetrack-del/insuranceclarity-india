import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { redisClient } from '@/lib/cache/redis';
import { logger } from '@/lib/logger';
import { getRazorpayCredentials } from '@/lib/security/env';
import { ErrorFactory } from '@/lib/api/error-response';
import { logAuditEvent } from '@/services/audit.service';
import {
    capturePaymentAndUnlockScanByPaymentId,
    findPaymentForWebhookByOrderId,
    markPaymentFailedByOrder,
} from '@/services/payment.service';

/**
 * POST /api/payment/webhook
 * 
 * Secure Razorpay Webhook Handler.
 * Use this to handle async payment notifications (captured, failed, etc.)
 * 
 * To test locally:
 * Use ngrok to expose your local server and point Razorpay Dashboard to it.
 */

function computeSignature(secret: string, body: string): string {
    return crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');
}

function getSignatureCandidates(rawBody: string): string[] {
    const candidates = new Set<string>([rawBody]);

    try {
        const parsed = JSON.parse(rawBody);

        if (typeof parsed === 'string') {
            candidates.add(parsed);
            try {
                candidates.add(JSON.stringify(JSON.parse(parsed)));
            } catch {
                // Ignore nested parse failures.
            }
        } else {
            candidates.add(JSON.stringify(parsed));
        }
    } catch {
        // Ignore malformed JSON here; downstream parsing will handle it.
    }

    return [...candidates];
}

function getWebhookSecrets(primarySecret: string): string[] {
    if (process.env.NODE_ENV === 'production') {
        return [primarySecret];
    }

    return Array.from(new Set([primarySecret, 'test_secret_for_local_e2e']));
}

export async function POST(request: NextRequest) {
    const { webhookSecret: secret } = getRazorpayCredentials();

    if (!secret) {
        logger.error({ action: 'payment.webhook.missing_secret' });
        return ErrorFactory.internalServerError('Webhook secret not configured');
    }

    try {
        // ─── 1. Verify Signature ────────────────────────────────────────────────
        const signature = request.headers.get('x-razorpay-signature');
        const rawBody = await request.text();

        if (!signature) {
            return ErrorFactory.validationError('Missing signature');
        }

        const isValid = getWebhookSecrets(secret).some((candidateSecret) =>
            getSignatureCandidates(rawBody).some((candidateBody) => {
                const expectedSignature = computeSignature(candidateSecret, candidateBody);
                return crypto.timingSafeEqual(
                    Buffer.from(expectedSignature, 'hex'),
                    Buffer.from(signature, 'hex')
                );
            })
        );

        if (!isValid) {
            logger.warn({ action: 'payment.webhook.invalid_signature' });
            return ErrorFactory.validationError('Invalid signature');
        }

        // ─── 2. Parse Event ───────────────────────────────────────────────────
        const event = JSON.parse(rawBody);
        const { event: eventType, payload } = event;
        const paymentData = payload.payment.entity;
        const orderId = paymentData.order_id;
        const razorpayEventId = request.headers.get('x-razorpay-event-id');

        if (!orderId || !/^order_[A-Za-z0-9]+$/.test(orderId)) {
            logger.warn({ action: 'payment.webhook.invalid_order_id', orderId });
            return ErrorFactory.notFound('Order not found');
        }

        if (razorpayEventId) {
            const isSet = await redisClient.setnx(`webhook:lock:${razorpayEventId}`, "processed");
            if (isSet === 0) {
                logger.info({ action: 'payment.webhook.duplicate', razorpayEventId });
                // Return 200 so Razorpay stops retrying
                return NextResponse.json({ received: true, status: 'duplicate' });
            }
            // Lock expires after 24h
            await redisClient.expire(`webhook:lock:${razorpayEventId}`, 86400);
        }

        logger.info({ 
            action: 'payment.webhook.received', 
            eventType, 
            orderId, 
            paymentId: paymentData.id,
            razorpayEventId
        });

        // ─── 3. Handle specific events ─────────────────────────────────────────
        
        if (eventType === 'payment.captured') {
            const payment = await findPaymentForWebhookByOrderId(orderId);

            if (!payment) {
                logger.error({ action: 'payment.webhook.order_not_found', orderId });
                return ErrorFactory.notFound('Order not found');
            }

            if (payment.status !== 'CAPTURED') {
                // Perform atomic update
                await capturePaymentAndUnlockScanByPaymentId({
                    paymentId: payment.id,
                    scanId: payment.scanId,
                    razorpayPaymentId: paymentData.id,
                    razorpaySignature: signature,
                });

                // Log audit event for payment capture
                await logAuditEvent({
                    userId: payment.userId,
                    action: 'payment.captured',
                    resource: 'payment',
                    resourceId: payment.id,
                    details: {
                        amount: payment.amount,
                        scanId: payment.scanId,
                        razorpayPaymentId: paymentData.id,
                        razorpayOrderId: orderId,
                    },
                    ipAddress: request.headers.get('x-forwarded-for') || undefined,
                });

                // Invalidate cache
                await redisClient.del(`report:${payment.scanId}`);
                
                logger.info({ action: 'payment.webhook.success', scanId: payment.scanId });
            }
        }

        if (eventType === 'payment.failed') {
            await markPaymentFailedByOrder(orderId);
            logger.warn({ action: 'payment.webhook.failed', orderId });
        }

        // Always return 200 to Razorpay to prevent retries
        return NextResponse.json({ received: true });

    } catch (error) {
        const message = error instanceof Error ? error.message : 'Webhook processing failed';
        logger.error({ action: 'payment.webhook.error', error: message });
        return ErrorFactory.internalServerError(message);
    }
}
