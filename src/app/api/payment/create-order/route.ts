/**
 * POST /api/payment/create-order
 *
 * Creates a Razorpay order for unlocking a full policy scan report.
 *
 * Body: { scanId: string }
 * Returns: { orderId, amount, currency, keyId }
 */

import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { auth } from '@/auth';

import { prisma } from '@/lib/prisma';
import { redisClient } from '@/lib/cache/redis';
import { logger } from '@/lib/logger';
import { validateCsrfRequest } from '@/lib/security/csrf';
import { getRazorpayCredentials, getRazorpayPublicKeyId } from '@/lib/security/env';
import { ErrorFactory } from '@/lib/api/error-response';
import type { CreateOrderResponse } from '@/types/report.types';

// ─── Constants ────────────────────────────────────────────────────────────────

const SCAN_UNLOCK_AMOUNT_PAISE = 19900; // ₹199 in paise

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
    ownerUserId: string | null;
    claimTokenValid: boolean;
    requestIp: string | null;
    ownerIp: string | null;
}): boolean {
    if (params.isAdmin) return true;

    if (params.ownerUserId) {
        return params.sessionUserId === params.ownerUserId;
    }

    if (params.claimTokenValid) return true;

    // Temporary legacy fallback for pre-token scans in non-production only.
    if (process.env.NODE_ENV !== 'production') {
        return Boolean(params.ownerIp && params.requestIp && params.ownerIp === params.requestIp);
    }

    return false;
}

async function upsertScanPayment(params: {
    scanId: string;
    userId: string | null;
    razorpayOrderId: string;
}) {
    const existing = await prisma.payment.findUnique({
        where: { scanId: params.scanId },
        select: { id: true, status: true },
    });

    if (existing?.status === 'CAPTURED') {
        throw new Error('This report is already unlocked.');
    }

    if (existing) {
        return prisma.payment.update({
            where: { id: existing.id },
            data: {
                userId: params.userId,
                razorpayOrderId: params.razorpayOrderId,
                razorpayPaymentId: null,
                razorpaySignature: null,
                amount: SCAN_UNLOCK_AMOUNT_PAISE,
                currency: 'INR',
                status: 'CREATED',
                plan: 'SCAN_UNLOCK',
            },
        });
    }

    return prisma.payment.create({
        data: {
            userId: params.userId,
            scanId: params.scanId,
            razorpayOrderId: params.razorpayOrderId,
            amount: SCAN_UNLOCK_AMOUNT_PAISE,
            currency: 'INR',
            status: 'CREATED',
            plan: 'SCAN_UNLOCK',
        },
    });
}

// ─── Razorpay Client ──────────────────────────────────────────────────────────

function getRazorpayClient(): Razorpay {
    const { keyId, keySecret } = getRazorpayCredentials();

    return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
    try {
        const csrfError = validateCsrfRequest(request);
        if (csrfError) return csrfError;

        const session = await auth();
        const userId = (session?.user as { id?: string })?.id ?? null;
        const role = (session?.user as { role?: string } | undefined)?.role;
        const requestIp = getClientIp(request);
        const claimToken = request.headers.get('x-claim-token');

        const body = await request.json() as { scanId?: string };
        const { scanId } = body;

        if (!scanId || typeof scanId !== 'string') {
            return ErrorFactory.validationError('scanId is required.');
        }

        // Verify scan exists and is completed
        const scan = await prisma.scan.findUnique({
            where: { id: scanId },
            select: { id: true, status: true, isPaid: true, userId: true, ipAddress: true },
        });

        if (!scan) {
            return ErrorFactory.notFound('Scan not found.');
        }

        let claimTokenValid = false;
        if (claimToken && !scan.userId && redisClient.isConfigured()) {
            const claimedScanId = await redisClient.get<string>(`scan:claim:${claimToken}`);
            claimTokenValid = claimedScanId === scanId;
        }

        const isAllowed = canAccessScan({
            isAdmin: role === 'ADMIN',
            sessionUserId: userId,
            ownerUserId: scan.userId,
            claimTokenValid,
            requestIp,
            ownerIp: scan.ipAddress,
        });

        if (!isAllowed) {
            logger.warn({ action: 'payment.order.access.denied', scanId, userId: userId ?? 'anonymous' });
            return ErrorFactory.notFound('Scan not found.');
        }

        if (scan.isPaid) {
            return ErrorFactory.validationError('This report is already unlocked.');
        }

        if (scan.status !== 'COMPLETED') {
            return ErrorFactory.validationError('Scan is not yet complete.');
        }

        // Create Razorpay order
        const razorpay = getRazorpayClient();
        const order = await razorpay.orders.create({
            amount: SCAN_UNLOCK_AMOUNT_PAISE,
            currency: 'INR',
            receipt: `scan_${scanId.slice(0, 16)}`,
            notes: {
                scanId,
                userId: userId ?? 'anonymous',
                product: 'policy_scan_unlock',
            },
        });

        // Save payment record in CREATED state (or rotate failed/previous attempt to a new order id)
        await upsertScanPayment({
            scanId,
            userId,
            razorpayOrderId: order.id,
        });

        logger.info({
            action: 'payment.order.created',
            scanId,
            orderId: order.id,
            amount: SCAN_UNLOCK_AMOUNT_PAISE,
            userId: userId ?? 'anonymous',
        });

        const { keyId } = getRazorpayCredentials();
        const publicKeyId = getRazorpayPublicKeyId(keyId);
        const response: CreateOrderResponse = {
            orderId: order.id,
            amount: SCAN_UNLOCK_AMOUNT_PAISE,
            currency: 'INR',
            keyId: publicKeyId,
        };

        return NextResponse.json(response);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Order creation failed';
        logger.error({ action: 'payment.order.error', error: message });

        if (message.toLowerCase().includes('already unlocked')) {
            return ErrorFactory.validationError(message);
        }

        return ErrorFactory.internalServerError(message);
    }
}
