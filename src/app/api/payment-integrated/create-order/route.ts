/**
 * Integrated Payment API Routes with Error Handling
 * Phase 7: Replace original create-order route with error handling
 */

import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redisClient } from '@/lib/cache/redis';
import { logger } from '@/lib/logger';
import { validateCsrfRequest } from '@/lib/security/csrf';
import { getRazorpayCredentials, getRazorpayPublicKeyId } from '@/lib/security/env';

// ✨ NEW: Error handling imports
import { 
  ApiError, 
  withErrorHandler, 
  withRateLimit,
  createApiHandler 
} from '@/lib/errors';
import type { CreateOrderResponse } from '@/types/report.types';

// ─────────────────────────────────────────────────────────────────────────────

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
    throw ApiError.conflict('This report is already unlocked.', {
      errorCode: 'PAYMENT_ALREADY_CAPTURED',
      scanId: params.scanId,
    });
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

function getRazorpayClient(): Razorpay {
  const { keyId, keySecret } = getRazorpayCredentials();
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

// ─────────────────────────────────────────────────────────────────────────────
// ✨ MAIN HANDLER - WITH ERROR HANDLING
// ─────────────────────────────────────────────────────────────────────────────

async function createOrderHandler(request: NextRequest) {
  // CSRF validation
  const csrfError = validateCsrfRequest(request);
  if (csrfError) {
    throw ApiError.forbidden('CSRF validation failed', {
      errorCode: 'CSRF_INVALID',
    });
  }

  // Authentication
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id ?? null;
  const role = (session?.user as { role?: string } | undefined)?.role;
  const requestIp = getClientIp(request);
  const claimToken = request.headers.get('x-claim-token');

  // Parse & validate request body
  const body = await request.json() as { scanId?: string };
  const { scanId } = body;

  if (!scanId || typeof scanId !== 'string') {
    throw ApiError.badRequest('scanId is required', {
      errorCode: 'PAYMENT_INVALID_SCAN',
      received: typeof scanId,
    });
  }

  if (scanId.length < 8) {
    throw ApiError.badRequest('scanId format invalid', {
      errorCode: 'PAYMENT_INVALID_FORMAT',
      minLength: 8,
    });
  }

  // Verify scan exists
  const scan = await prisma.scan.findUnique({
    where: { id: scanId },
    select: { 
      id: true, 
      status: true, 
      isPaid: true, 
      userId: true, 
      ipAddress: true 
    },
  });

  if (!scan) {
    logger.warn({
      action: 'payment.scan.not_found',
      scanId,
      userId: userId ?? 'anonymous',
    });
    throw ApiError.notFound('Scan not found', {
      errorCode: 'PAYMENT_SCAN_NOT_FOUND',
      scanId,
    });
  }

  // Authorization check
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
    logger.warn({
      action: 'payment.access_denied',
      scanId,
      userId: userId ?? 'anonymous',
    });
    throw ApiError.unauthorized('Access denied', {
      errorCode: 'PAYMENT_ACCESS_DENIED',
    });
  }

  // Business logic validations
  if (scan.isPaid) {
    throw ApiError.conflict('Report already unlocked', {
      errorCode: 'PAYMENT_ALREADY_PAID',
      scanId,
    });
  }

  if (scan.status !== 'COMPLETED') {
    throw ApiError.badRequest('Scan not complete', {
      errorCode: 'PAYMENT_SCAN_INCOMPLETE',
      scanStatus: scan.status,
    });
  }

  // Create Razorpay order
  try {
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

    // Save payment record
    await upsertScanPayment({
      scanId,
      userId,
      razorpayOrderId: order.id,
    });

    logger.info({
      action: 'payment.order_created',
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

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    // Handle Razorpay-specific errors
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      
      if (message.includes('network') || message.includes('timeout')) {
        throw ApiError.serviceUnavailable('Payment service temporarily unavailable', {
          errorCode: 'PAYMENT_SERVICE_UNAVAILABLE',
          retryAfter: 30,
        });
      }
      
      if (message.includes('authentication')) {
        throw ApiError.internalServerError('Payment service configuration error', {
          errorCode: 'PAYMENT_CONFIG_ERROR',
          severity: 'CRITICAL',
        });
      }
    }
    
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ✨ EXPORT WITH ERROR HANDLING WRAPPER
// ─────────────────────────────────────────────────────────────────────────────

// Apply both error handling and rate limiting middleware
export const POST = withRateLimit(
  withErrorHandler(createOrderHandler),
  {
    scope: 'payments',
    maxRequests: 50, // 50 per hour
    timeWindowSeconds: 3600,
  }
);
