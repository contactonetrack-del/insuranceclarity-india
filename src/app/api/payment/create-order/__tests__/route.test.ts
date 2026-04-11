import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';
import { POST } from '../route';
import { resetPaymentProviderForTests } from '@/lib/payments/provider';

const { mockAuth } = vi.hoisted(() => ({
    mockAuth: vi.fn(),
}));

const { mockValidateCsrfRequest } = vi.hoisted(() => ({
    mockValidateCsrfRequest: vi.fn(),
}));

const { mockVerifyScanClaimToken } = vi.hoisted(() => ({
    mockVerifyScanClaimToken: vi.fn(),
}));

const { mockFindScanUnique, mockFindPaymentUnique, mockCreatePayment, mockUpdatePayment } = vi.hoisted(() => ({
    mockFindScanUnique: vi.fn(),
    mockFindPaymentUnique: vi.fn(),
    mockCreatePayment: vi.fn(),
    mockUpdatePayment: vi.fn(),
}));

const { mockCreateRazorpayOrder } = vi.hoisted(() => ({
    mockCreateRazorpayOrder: vi.fn(),
}));

const { mockGetRazorpayCredentials, mockGetRazorpayPublicKeyId } = vi.hoisted(() => ({
    mockGetRazorpayCredentials: vi.fn(),
    mockGetRazorpayPublicKeyId: vi.fn(),
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

vi.mock('@/lib/prisma', () => ({
    prisma: {
        scan: {
            findUnique: mockFindScanUnique,
        },
        payment: {
            findUnique: mockFindPaymentUnique,
            create: mockCreatePayment,
            update: mockUpdatePayment,
        },
    },
}));

vi.mock('@/lib/security/env', () => ({
    getRazorpayCredentials: mockGetRazorpayCredentials,
    getRazorpayPublicKeyId: mockGetRazorpayPublicKeyId,
}));

vi.mock('@/lib/logger', () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock('razorpay', () => ({
    default: vi.fn().mockImplementation(function () {
        return {
        orders: {
            create: mockCreateRazorpayOrder,
        },
        };
    }),
}));

describe('POST /api/payment/create-order', () => {
    const createRequest = (body: unknown, headers: Record<string, string> = {}) => {
        return new Request('http://localhost:3000/api/payment/create-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
            body: JSON.stringify(body),
        }) as unknown as NextRequest;
    };

    beforeEach(() => {
        vi.clearAllMocks();
        resetPaymentProviderForTests();
        mockValidateCsrfRequest.mockReturnValue(null);
        mockVerifyScanClaimToken.mockResolvedValue(false);
        mockGetRazorpayCredentials.mockReturnValue({ keyId: 'rzp_test_key', keySecret: 'secret' });
        mockGetRazorpayPublicKeyId.mockReturnValue('rzp_test_public');
        mockAuth.mockResolvedValue({ user: { id: 'user_1', role: 'USER' } });
        mockCreateRazorpayOrder.mockResolvedValue({ id: 'order_123' });
        mockFindPaymentUnique.mockResolvedValue(null);
        mockCreatePayment.mockResolvedValue({ id: 'payment_1' });
    });

    it('creates order and payment record for scan owner', async () => {
        mockFindScanUnique.mockResolvedValue({
            id: 'scan_1',
            status: 'COMPLETED',
            isPaid: false,
            userId: 'user_1',
            ipAddress: null,
        });

        const response = await POST(createRequest({ scanId: 'scan_1' }));
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toEqual({
            orderId: 'order_123',
            amount: 19900,
            currency: 'INR',
            keyId: 'rzp_test_public',
        });
        expect(mockCreateRazorpayOrder).toHaveBeenCalled();
        expect(mockCreatePayment).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    scanId: 'scan_1',
                    userId: 'user_1',
                    razorpayOrderId: 'order_123',
                    status: 'CREATED',
                }),
            }),
        );
    });

    it('returns validation error when scanId is missing', async () => {
        const response = await POST(createRequest({}));
        const json = await response.json();

        expect(response.status).toBe(400);
        expect(json.success).toBe(false);
        expect(json.error.code).toBe('VALIDATION_ERROR');
        expect(mockFindScanUnique).not.toHaveBeenCalled();
    });

    it('returns not found when scan is missing', async () => {
        mockFindScanUnique.mockResolvedValue(null);

        const response = await POST(createRequest({ scanId: 'scan_missing' }));
        const json = await response.json();

        expect(response.status).toBe(404);
        expect(json.success).toBe(false);
        expect(json.error.code).toBe('NOT_FOUND');
    });

    it('returns not found when caller cannot access scan', async () => {
        mockFindScanUnique.mockResolvedValue({
            id: 'scan_1',
            status: 'COMPLETED',
            isPaid: false,
            userId: 'owner_user',
            ipAddress: '10.0.0.1',
        });
        mockAuth.mockResolvedValue({ user: { id: 'other_user', role: 'USER' } });

        const response = await POST(
            createRequest({ scanId: 'scan_1' }, { 'x-forwarded-for': '10.0.0.2' }),
        );
        const json = await response.json();

        expect(response.status).toBe(404);
        expect(json.success).toBe(false);
        expect(json.error.code).toBe('NOT_FOUND');
        expect(mockCreateRazorpayOrder).not.toHaveBeenCalled();
    });

    it('allows anonymous scan when claim token is valid', async () => {
        mockFindScanUnique.mockResolvedValue({
            id: 'scan_anon',
            status: 'COMPLETED',
            isPaid: false,
            userId: null,
            ipAddress: null,
        });
        mockAuth.mockResolvedValue(null);
        mockVerifyScanClaimToken.mockResolvedValue(true);

        const response = await POST(
            createRequest({ scanId: 'scan_anon' }, { 'x-claim-token': 'token_1' }),
        );
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.orderId).toBe('order_123');
        expect(mockVerifyScanClaimToken).toHaveBeenCalledWith('token_1', 'scan_anon');
        expect(mockCreatePayment).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    userId: null,
                    scanId: 'scan_anon',
                }),
            }),
        );
    });

    it('returns validation error when existing payment is already captured', async () => {
        mockFindScanUnique.mockResolvedValue({
            id: 'scan_1',
            status: 'COMPLETED',
            isPaid: false,
            userId: 'user_1',
            ipAddress: null,
        });
        mockFindPaymentUnique.mockResolvedValue({
            id: 'payment_1',
            status: 'CAPTURED',
        });

        const response = await POST(createRequest({ scanId: 'scan_1' }));
        const json = await response.json();

        expect(response.status).toBe(400);
        expect(json.success).toBe(false);
        expect(json.error.code).toBe('VALIDATION_ERROR');
        expect(mockUpdatePayment).not.toHaveBeenCalled();
        expect(mockCreatePayment).not.toHaveBeenCalled();
    });

    it('returns validation error when scan is not yet complete', async () => {
        mockFindScanUnique.mockResolvedValue({
            id: 'scan_1',
            status: 'PROCESSING',
            isPaid: false,
            userId: 'user_1',
            ipAddress: null,
        });

        const response = await POST(createRequest({ scanId: 'scan_1' }));
        const json = await response.json();

        expect(response.status).toBe(400);
        expect(json.success).toBe(false);
        expect(json.error.code).toBe('VALIDATION_ERROR');
        expect(mockCreateRazorpayOrder).not.toHaveBeenCalled();
    });

    it('returns csrf error response when csrf validation fails', async () => {
        mockValidateCsrfRequest.mockReturnValue(
            new Response(JSON.stringify({ success: false }), { status: 403 }),
        );

        const response = await POST(createRequest({ scanId: 'scan_1' }));

        expect(response.status).toBe(403);
        expect(mockFindScanUnique).not.toHaveBeenCalled();
        expect(mockCreateRazorpayOrder).not.toHaveBeenCalled();
    });

    it('returns internal error when payment provider order creation fails', async () => {
        mockFindScanUnique.mockResolvedValue({
            id: 'scan_1',
            status: 'COMPLETED',
            isPaid: false,
            userId: 'user_1',
            ipAddress: null,
        });
        mockCreateRazorpayOrder.mockRejectedValue(new Error('provider unavailable'));

        const response = await POST(createRequest({ scanId: 'scan_1' }));
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json.success).toBe(false);
        expect(json.error.code).toBe('INTERNAL_SERVER_ERROR');
        expect(mockCreatePayment).not.toHaveBeenCalled();
    });
});
