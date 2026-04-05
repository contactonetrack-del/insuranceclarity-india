/**
 * POST /api/payment/verify
 *
 * Verifies Razorpay payment signature and unlocks the full report.
 *
 * Body: {
 *   scanId: string;
 *   razorpayOrderId: string;
 *   razorpayPaymentId: string;
 *   razorpaySignature: string;
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { auth } from '@/auth';

import { prisma } from '@/lib/prisma';
import { redisClient } from '@/lib/cache/redis';
import { logger } from '@/lib/logger';
import { getRazorpayCredentials } from '@/lib/security/env';
import { trackFunnelStep } from '@/lib/analytics/funnel';
import type { VerifyPaymentRequest, VerifyPaymentResponse } from '@/types/report.types';

// ─── Signature Verification ───────────────────────────────────────────────────

function verifyRazorpaySignature(
    orderId: string,
    paymentId: string,
    signature: string,
    secret: string,
): boolean {
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(signature, 'hex'),
    );
}

function getClientIp(request: NextRequest): string | null {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        const first = forwarded.split(',')[0]?.trim();
        if (first) return first;
    }

    const realIp = request.headers.get('x-real-ip')?.trim();
    return realIp || null;
}

function canAccessScan(params: {
    isAdmin: boolean;
    sessionUserId: string | null;
    requestIp: string | null;
    ownerUserId: string | null;
    ownerIp: string | null;
}): boolean {
    if (params.isAdmin) return true;

    if (params.ownerUserId) {
        return params.sessionUserId === params.ownerUserId;
    }

    return Boolean(params.ownerIp && params.requestIp && params.ownerIp === params.requestIp);
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
    try {
        const { keySecret: secret } = getRazorpayCredentials();
        const requestIp = getClientIp(request);
        const session = await auth();
        const sessionUserId = (session?.user as { id?: string } | undefined)?.id ?? null;
        const isAdmin = (session?.user as { role?: string } | undefined)?.role === 'ADMIN';

        const body = await request.json() as Partial<VerifyPaymentRequest>;
        const { scanId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

        // Validate all required fields
        if (!scanId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
            return NextResponse.json(
                { error: 'Missing payment verification fields.' },
                { status: 400 },
            );
        }

        // 1. Find payment record in DB
        const payment = await prisma.payment.findUnique({
            where: { razorpayOrderId },
            select: {
                id: true,
                status: true,
                scanId: true,
                scan: {
                    select: {
                        userId: true,
                        ipAddress: true,
                    },
                },
            },
        });

        if (!payment) {
            return NextResponse.json({ error: 'Payment record not found.' }, { status: 404 });
        }

        if (payment.scanId !== scanId) {
            logger.warn({
                action: 'payment.verify.scan_mismatch',
                expectedScanId: payment.scanId,
                providedScanId: scanId,
                razorpayOrderId,
            });
            return NextResponse.json({ error: 'Payment does not belong to this scan.' }, { status: 400 });
        }

        const isAllowed = canAccessScan({
            isAdmin,
            sessionUserId,
            requestIp,
            ownerUserId: payment.scan.userId,
            ownerIp: payment.scan.ipAddress,
        });

        if (!isAllowed) {
            logger.warn({
                action: 'payment.verify.access.denied',
                scanId,
                razorpayOrderId,
                userId: sessionUserId ?? 'anonymous',
            });
            return NextResponse.json({ error: 'Payment record not found.' }, { status: 404 });
        }

        if (payment.status === 'CAPTURED') {
            // Already processed — idempotent response
            const response: VerifyPaymentResponse = {
                success: true,
                message: 'Payment already verified. Your report is unlocked.',
            };
            return NextResponse.json(response);
        }

        // 2. Verify HMAC signature (MOST IMPORTANT — prevents fraud)
        const isValid = verifyRazorpaySignature(
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
            secret,
        );

        if (!isValid) {
            await prisma.payment.update({
                where: { id: payment.id },
                data: { status: 'FAILED' },
            }).catch(() => {
                // no-op; we still return signature failure
            });

            logger.warn({
                action: 'payment.verify.invalid_signature',
                scanId,
                razorpayOrderId,
            });
            return NextResponse.json(
                { error: 'Payment verification failed. Invalid signature.' },
                { status: 400 },
            );
        }

        // 3. Update payment status and unlock scan report (atomic transaction)
        await prisma.$transaction([
            prisma.payment.update({
                where: { razorpayOrderId },
                data: {
                    status:            'CAPTURED',
                    razorpayPaymentId,
                    razorpaySignature,
                },
            }),
            prisma.scan.update({
                where: { id: payment.scanId },
                data: { isPaid: true, isPaywalled: false },
            }),
        ]);

        // 4. Invalidate the cached report so next fetch returns full data
        await redisClient.del(`report:${payment.scanId}`);

        logger.info({
            action: 'payment.verified',
            scanId,
            razorpayOrderId,
            razorpayPaymentId,
        });

        void trackFunnelStep('pay', {
            userId: payment.scan.userId ?? sessionUserId,
            scanId,
            paymentId: razorpayPaymentId,
        });

        const response: VerifyPaymentResponse = {
            success: true,
            message: 'Payment verified. Your full report is now unlocked!',
        };

        return NextResponse.json(response);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Payment verification failed';
        logger.error({ action: 'payment.verify.error', error: message });

        return NextResponse.json({ error: message }, { status: 500 });
    }
}
