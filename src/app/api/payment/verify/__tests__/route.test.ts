import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';
import type { NextRequest } from 'next/server';
import { POST } from '../route';

const { mockAuth } = vi.hoisted(() => ({
    mockAuth: vi.fn(),
}));

const { mockValidateCsrfRequest } = vi.hoisted(() => ({
    mockValidateCsrfRequest: vi.fn(),
}));

const { mockVerifyScanClaimToken } = vi.hoisted(() => ({
    mockVerifyScanClaimToken: vi.fn(),
}));

const { mockGetRazorpayCredentials } = vi.hoisted(() => ({
    mockGetRazorpayCredentials: vi.fn(),
}));

const {
    mockFindPaymentUnique,
    mockUpdatePayment,
    mockUpdateScan,
    mockTransaction,
} = vi.hoisted(() => ({
    mockFindPaymentUnique: vi.fn(),
    mockUpdatePayment: vi.fn(),
    mockUpdateScan: vi.fn(),
    mockTransaction: vi.fn(),
}));

const { mockRedisDel } = vi.hoisted(() => ({
    mockRedisDel: vi.fn(),
}));

const { mockTrackFunnelStep } = vi.hoisted(() => ({
    mockTrackFunnelStep: vi.fn(),
}));

vi.mock('@/auth', () => ({
    auth: mockAuth,
}));

vi.mock('@/lib/security/csrf', () => ({
    validateCsrfRequest: mockValidateCsrfRequest,
}));

vi.mock('@/lib/security/scan-claim', () => ({
    verifyScanClaimToken: mockVerifyScanClaimToken,
}));

vi.mock('@/lib/security/env', () => ({
    getRazorpayCredentials: mockGetRazorpayCredentials,
}));

vi.mock('@/lib/prisma', () => ({
    prisma: {
        payment: {
            findUnique: mockFindPaymentUnique,
            update: mockUpdatePayment,
        },
        scan: {
            update: mockUpdateScan,
        },
        $transaction: mockTransaction,
    },
}));

vi.mock('@/lib/cache/redis', () => ({
    redisClient: {
        del: mockRedisDel,
    },
}));

vi.mock('@/lib/analytics/funnel', () => ({
    trackFunnelStep: mockTrackFunnelStep,
}));

vi.mock('@/lib/logger', () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

describe('POST /api/payment/verify', () => {
    const createRequest = (body: unknown, headers: Record<string, string> = {}) => {
        return new Request('http://localhost:3000/api/payment/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
            body: JSON.stringify(body),
        }) as unknown as NextRequest;
    };

    const defaultBody = {
        scanId: 'scan_1',
        razorpayOrderId: 'order_1',
        razorpayPaymentId: 'pay_1',
        razorpaySignature: '',
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockValidateCsrfRequest.mockReturnValue(null);
        mockVerifyScanClaimToken.mockResolvedValue(false);
        mockGetRazorpayCredentials.mockReturnValue({ keySecret: 'secret_key' });
        mockAuth.mockResolvedValue({ user: { id: 'user_1', role: 'USER' } });
        mockUpdatePayment.mockResolvedValue({ id: 'payment_1' });
        mockUpdateScan.mockResolvedValue({ id: 'scan_1' });
        mockTransaction.mockResolvedValue([]);
        mockRedisDel.mockResolvedValue(1);
        mockTrackFunnelStep.mockResolvedValue(undefined);
    });

    it('returns 400 when required verification fields are missing', async () => {
        const response = await POST(createRequest({ scanId: 'scan_1' }));
        const json = await response.json();

        expect(response.status).toBe(400);
        expect(json.success).toBe(false);
        expect(json.error.code).toBe('VALIDATION_ERROR');
        expect(mockFindPaymentUnique).not.toHaveBeenCalled();
    });

    it('returns 404 when payment record is not found', async () => {
        mockFindPaymentUnique.mockResolvedValue(null);

        const signature = crypto
            .createHmac('sha256', 'secret_key')
            .update('order_1|pay_1')
            .digest('hex');

        const response = await POST(createRequest({ ...defaultBody, razorpaySignature: signature }));
        const json = await response.json();

        expect(response.status).toBe(404);
        expect(json.success).toBe(false);
        expect(json.error.code).toBe('NOT_FOUND');
    });

    it('returns idempotent success when payment is already captured', async () => {
        mockFindPaymentUnique.mockResolvedValue({
            id: 'payment_1',
            status: 'CAPTURED',
            scanId: 'scan_1',
            scan: {
                userId: 'user_1',
                ipAddress: null,
            },
        });

        const signature = crypto
            .createHmac('sha256', 'secret_key')
            .update('order_1|pay_1')
            .digest('hex');

        const response = await POST(createRequest({ ...defaultBody, razorpaySignature: signature }));
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.message).toContain('already verified');
        expect(mockTransaction).not.toHaveBeenCalled();
    });

    it('marks payment as failed when signature is invalid', async () => {
        mockFindPaymentUnique.mockResolvedValue({
            id: 'payment_1',
            status: 'CREATED',
            scanId: 'scan_1',
            scan: {
                userId: 'user_1',
                ipAddress: null,
            },
        });

        const response = await POST(
            createRequest({ ...defaultBody, razorpaySignature: '0'.repeat(64) }),
        );
        const json = await response.json();

        expect(response.status).toBe(400);
        expect(json.success).toBe(false);
        expect(json.error.code).toBe('VALIDATION_ERROR');
        expect(mockUpdatePayment).toHaveBeenCalledWith({
            where: { id: 'payment_1' },
            data: { status: 'FAILED' },
        });
    });

    it('captures payment and unlocks scan for valid signature', async () => {
        mockFindPaymentUnique.mockResolvedValue({
            id: 'payment_1',
            status: 'CREATED',
            scanId: 'scan_1',
            scan: {
                userId: 'user_1',
                ipAddress: null,
            },
        });

        const signature = crypto
            .createHmac('sha256', 'secret_key')
            .update('order_1|pay_1')
            .digest('hex');

        const response = await POST(createRequest({ ...defaultBody, razorpaySignature: signature }));
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.message).toContain('unlocked');
        expect(mockTransaction).toHaveBeenCalledTimes(1);
        expect(mockRedisDel).toHaveBeenCalledWith('report:scan_1');
        expect(mockTrackFunnelStep).toHaveBeenCalled();
    });
});

