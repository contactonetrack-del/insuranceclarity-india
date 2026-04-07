/**
 * Integrated Payment Verify Route with Error Handling & Auto-Retry
 * Phase 7: /api/payment-integrated/verify
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { getRazorpayCredentials } from '@/lib/security/env';

// ✨ Error handling imports
import { 
  ApiError, 
  withErrorHandler, 
  withRateLimit,
  ApiClient 
} from '@/lib/errors';

// ─────────────────────────────────────────────────────────────────────────────

function verifySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(`${orderId}|${paymentId}`);
  const computed = hmac.digest('hex');
  return computed === signature;
}

// ─────────────────────────────────────────────────────────────────────────────
// ✨ MAIN HANDLER - WITH ERROR HANDLING & RETRIES
// ─────────────────────────────────────────────────────────────────────────────

async function verifyPaymentHandler(request: NextRequest) {
  // Parse request
  const body = await request.json() as {
    orderId?: string;
    paymentId?: string;
    signature?: string;
  };

  const { orderId, paymentId, signature } = body;

  // Validate inputs
  if (!orderId || typeof orderId !== 'string') {
    throw ApiError.badRequest('orderId required', {
      errorCode: 'PAYMENT_VERIFY_NO_ORDER',
    });
  }

  if (!paymentId || typeof paymentId !== 'string') {
    throw ApiError.badRequest('paymentId required', {
      errorCode: 'PAYMENT_VERIFY_NO_PAYMENT',
    });
  }

  if (!signature || typeof signature !== 'string') {
    throw ApiError.badRequest('signature required', {
      errorCode: 'PAYMENT_VERIFY_NO_SIGNATURE',
    });
  }

  // Verify signature
  const { keySecret } = getRazorpayCredentials();
  const isValid = verifySignature(orderId, paymentId, signature, keySecret);

  if (!isValid) {
    logger.warn({
      action: 'payment.signature_invalid',
      orderId,
      paymentId,
    });
    throw ApiError.forbidden('Invalid signature', {
      errorCode: 'PAYMENT_SIGNATURE_INVALID',
    });
  }

  // Find payment record
  const payment = await prisma.payment.findUnique({
    where: { razorpayOrderId: orderId },
    select: {
      id: true,
      scanId: true,
      status: true,
      userId: true,
      razorpayPaymentId: true,
    },
  });

  if (!payment) {
    throw ApiError.notFound('Payment not found', {
      errorCode: 'PAYMENT_NOT_FOUND',
      orderId,
    });
  }

  if (payment.status === 'CAPTURED') {
    logger.info({
      action: 'payment.already_captured',
      orderId,
      paymentId,
    });
    // Idempotent: return success even if already captured
    return NextResponse.json({
      success: true,
      data: {
        orderId,
        paymentId,
        status: 'CAPTURED',
        message: 'Payment already processed',
      },
    });
  }

  // Update payment status
  try {
    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        status: 'CAPTURED',
        capturedAt: new Date(),
      },
      select: {
        id: true,
        scanId: true,
        status: true,
        amount: true,
      },
    });

    // Mark scan as paid (for display purposes)
    await prisma.scan.update({
      where: { id: updated.scanId },
      data: { isPaid: true },
    });

    logger.info({
      action: 'payment.verified',
      orderId,
      paymentId,
      scanId: updated.scanId,
      amount: updated.amount,
      userId: payment.userId,
    });

    return NextResponse.json({
      success: true,
      data: {
        orderId,
        paymentId,
        scanId: updated.scanId,
        status: 'CAPTURED',
        amount: updated.amount,
      },
    });
  } catch (error) {
    // If database update fails, payment is still valid
    if (error instanceof Error && error.message.includes('unique constraint')) {
      logger.warn({
        action: 'payment.duplicate_verification',
        orderId,
        paymentId,
      });
      throw ApiError.conflict('Payment already recorded', {
        errorCode: 'PAYMENT_DUPLICATE',
      });
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ✨ EXPORT WITH ERROR HANDLING
// ─────────────────────────────────────────────────────────────────────────────

export const POST = withRateLimit(
  withErrorHandler(verifyPaymentHandler),
  {
    scope: 'payments',
    maxRequests: 100, // Higher limit for webhook callbacks
    timeWindowSeconds: 3600,
  }
);
