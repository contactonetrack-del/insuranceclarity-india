import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { redisClient } from '@/lib/cache/redis';
import { logger } from '@/lib/logger';
import { getRazorpayCredentials } from '@/lib/security/env';
import { logAuditEvent } from '@/services/audit.service';

/**
 * POST /api/payment/webhook
 * 
 * Secure Razorpay Webhook Handler.
 * Use this to handle async payment notifications (captured, failed, etc.)
 * 
 * To test locally:
 * Use ngrok to expose your local server and point Razorpay Dashboard to it.
 */

export async function POST(request: NextRequest) {
    const { webhookSecret: secret } = getRazorpayCredentials();

    if (!secret) {
        logger.error({ action: 'payment.webhook.missing_secret' });
        return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    try {
        // ─── 1. Verify Signature ────────────────────────────────────────────────
        const signature = request.headers.get('x-razorpay-signature');
        const rawBody = await request.text();

        if (!signature) {
            return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
        }

        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(rawBody)
            .digest('hex');

        const isValid = crypto.timingSafeEqual(
            Buffer.from(expectedSignature, 'hex'),
            Buffer.from(signature, 'hex')
        );

        if (!isValid) {
            logger.warn({ action: 'payment.webhook.invalid_signature' });
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        // ─── 2. Parse Event ───────────────────────────────────────────────────
        const event = JSON.parse(rawBody);
        const { event: eventType, payload } = event;
        const paymentData = payload.payment.entity;
        const orderId = paymentData.order_id;
        const razorpayEventId = request.headers.get('x-razorpay-event-id');

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
            const payment = await prisma.payment.findUnique({
                where: { razorpayOrderId: orderId },
                select: { id: true, scanId: true, status: true, userId: true, amount: true }
            });

            if (!payment) {
                logger.error({ action: 'payment.webhook.order_not_found', orderId });
                return NextResponse.json({ error: 'Order not found' }, { status: 404 });
            }

            if (payment.status !== 'CAPTURED') {
                // Perform atomic update
                await prisma.$transaction([
                    prisma.payment.update({
                        where: { id: payment.id },
                        data: {
                            status: 'CAPTURED',
                            razorpayPaymentId: paymentData.id,
                            razorpaySignature: signature // In webhooks, this is different but we log it
                        }
                    }),
                    prisma.scan.update({
                        where: { id: payment.scanId },
                        data: { isPaid: true, isPaywalled: false }
                    })
                ]);

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
            await prisma.payment.updateMany({
                where: { razorpayOrderId: orderId },
                data: { status: 'FAILED' }
            });
            logger.warn({ action: 'payment.webhook.failed', orderId });
        }

        // Always return 200 to Razorpay to prevent retries
        return NextResponse.json({ received: true });

    } catch (error) {
        const message = error instanceof Error ? error.message : 'Webhook processing failed';
        logger.error({ action: 'payment.webhook.error', error: message });
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
