/**
 * POST /api/payment/create-order
 *
 * Creates a payment-provider order for unlocking a full policy scan report.
 *
 * Body: { scanId: string }
 * Returns: { orderId, amount, currency, keyId }
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { logger } from '@/lib/logger';
import { validateCsrfRequest } from '@/lib/security/csrf';
import { verifyScanClaimToken } from '@/lib/security/scan-claim';
import { getRazorpayCredentials, getRazorpayPublicKeyId } from '@/lib/security/env';
import { getPaymentProvider } from '@/lib/payments/provider';
import { ErrorFactory } from '@/lib/api/error-response';
import {
    canAccessScan,
    findScanForPayment,
    getClientIpFromHeaders,
    upsertScanPayment,
} from '@/services/payment.service';
import type { CreateOrderResponse } from '@/types/report.types';

const SCAN_UNLOCK_AMOUNT_PAISE = 19900; // Rs 199 in paise

export async function POST(request: NextRequest) {
    try {
        const csrfError = validateCsrfRequest(request);
        if (csrfError) return csrfError;

        const session = await auth();
        const userId = (session?.user as { id?: string })?.id ?? null;
        const role = (session?.user as { role?: string } | undefined)?.role;
        const requestIp = getClientIpFromHeaders(request.headers);
        const claimToken = request.headers.get('x-claim-token');

        const body = await request.json() as { scanId?: string };
        const { scanId } = body;

        if (!scanId || typeof scanId !== 'string') {
            return ErrorFactory.validationError('scanId is required.');
        }

        const scan = await findScanForPayment(scanId);
        if (!scan) {
            return ErrorFactory.notFound('Scan not found.');
        }

        const claimTokenValid = !scan.userId
            ? await verifyScanClaimToken(claimToken, scanId)
            : false;

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

        const paymentProvider = getPaymentProvider();
        const order = await paymentProvider.createOrder({
            amount: SCAN_UNLOCK_AMOUNT_PAISE,
            currency: 'INR',
            receipt: `scan_${scanId.slice(0, 16)}`,
            notes: {
                scanId,
                userId: userId ?? 'anonymous',
                product: 'policy_scan_unlock',
            },
        });

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
