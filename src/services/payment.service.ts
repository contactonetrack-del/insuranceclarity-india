import { paymentRepository } from '@/repositories/payment.repository';

const SCAN_UNLOCK_AMOUNT_PAISE = 19900;

export function canAccessScan(params: {
    isAdmin: boolean;
    sessionUserId: string | null;
    ownerUserId: string | null;
    claimTokenValid: boolean;
    requestIp: string | null;
    ownerIp: string | null;
}): boolean {
    if (params.isAdmin) return true;
    if (params.ownerUserId) return params.sessionUserId === params.ownerUserId;
    if (params.claimTokenValid) return true;
    if (process.env.NODE_ENV !== 'production') {
        return Boolean(params.ownerIp && params.requestIp && params.ownerIp === params.requestIp);
    }
    return false;
}

export function getClientIpFromHeaders(headers: Headers): string | null {
    const forwarded = headers.get('x-forwarded-for');
    if (forwarded) {
        const first = forwarded.split(',')[0]?.trim();
        if (first) return first;
    }
    const realIp = headers.get('x-real-ip')?.trim();
    return realIp || null;
}

export async function findScanForPayment(scanId: string) {
    return paymentRepository.findScanForPayment(scanId);
}

export async function findPaymentByOrderId(orderId: string) {
    return paymentRepository.findPaymentByOrderId(orderId);
}

export async function findPaymentForWebhookByOrderId(orderId: string) {
    return paymentRepository.findPaymentForWebhookByOrderId(orderId);
}

export async function findPaymentStatusByScanId(scanId: string) {
    return paymentRepository.findPaymentStatusByScanId(scanId);
}

export async function upsertScanPayment(params: {
    scanId: string;
    userId: string | null;
    razorpayOrderId: string;
}) {
    const existing = await paymentRepository.findPaymentByScanId(params.scanId);
    if (existing?.status === 'CAPTURED') throw new Error('This report is already unlocked.');
    if (existing) {
        return paymentRepository.updatePaymentForScanUnlock({
            paymentId: existing.id,
            userId: params.userId,
            razorpayOrderId: params.razorpayOrderId,
            amount: SCAN_UNLOCK_AMOUNT_PAISE,
        });
    }
    return paymentRepository.createScanUnlockPayment({
        scanId: params.scanId,
        userId: params.userId,
        razorpayOrderId: params.razorpayOrderId,
        amount: SCAN_UNLOCK_AMOUNT_PAISE,
    });
}

export async function markPaymentFailedById(paymentId: string) {
    return paymentRepository.markPaymentFailedById(paymentId);
}

export async function markPaymentFailedByOrder(orderId: string) {
    return paymentRepository.markPaymentFailedByOrder(orderId);
}

export async function capturePaymentAndUnlockScanByPaymentId(params: {
    paymentId: string;
    scanId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
}) {
    return paymentRepository.capturePaymentAndUnlockScanByPaymentId(params);
}

export async function capturePaymentAndUnlockScan(params: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    scanId: string;
}) {
    return paymentRepository.capturePaymentAndUnlockScan(params);
}
