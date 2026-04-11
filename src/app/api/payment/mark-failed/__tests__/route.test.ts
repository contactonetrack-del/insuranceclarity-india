import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse, type NextRequest } from 'next/server';
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

const { mockFindUnique, mockUpdate } = vi.hoisted(() => ({
    mockFindUnique: vi.fn(),
    mockUpdate: vi.fn(),
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
        payment: {
            findUnique: mockFindUnique,
            update: mockUpdate,
        },
    },
}));

vi.mock('@/lib/logger', () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
    },
}));

describe('POST /api/payment/mark-failed', () => {
    const createRequest = (
        body: unknown,
        headers: Record<string, string> = {},
    ) => {
        return new Request('http://localhost:3000/api/payment/mark-failed', {
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
        mockValidateCsrfRequest.mockReturnValue(null);
        mockAuth.mockResolvedValue(null);
        mockVerifyScanClaimToken.mockResolvedValue(false);
    });

    it('returns csrf response when csrf validation fails', async () => {
        mockValidateCsrfRequest.mockReturnValue(
            NextResponse.json({ success: false, error: { code: 'FORBIDDEN' } }, { status: 403 }),
        );

        const response = await POST(createRequest({ scanId: 'scan_1', razorpayOrderId: 'order_1' }));
        expect(response.status).toBe(403);
        expect(mockFindUnique).not.toHaveBeenCalled();
    });

    it('returns 400 for invalid payload', async () => {
        const response = await POST(createRequest({ scanId: '', razorpayOrderId: '' }));
        const json = await response.json();

        expect(response.status).toBe(400);
        expect(json.success).toBe(false);
        expect(json.error.code).toBe('VALIDATION_ERROR');
        expect(mockFindUnique).not.toHaveBeenCalled();
    });

    it('returns 404 when payment record is missing', async () => {
        mockFindUnique.mockResolvedValue(null);

        const response = await POST(
            createRequest({ scanId: 'scan_1', razorpayOrderId: 'order_1' }),
        );
        const json = await response.json();

        expect(response.status).toBe(404);
        expect(json.success).toBe(false);
        expect(json.error.code).toBe('NOT_FOUND');
    });

    it('returns captured without mutating when payment is already captured', async () => {
        mockFindUnique.mockResolvedValue({
            id: 'pay_1',
            scanId: 'scan_1',
            status: 'CAPTURED',
            scan: {
                userId: 'user_1',
                ipAddress: null,
            },
        });
        mockAuth.mockResolvedValue({ user: { id: 'user_1', role: 'USER' } });

        const response = await POST(
            createRequest({ scanId: 'scan_1', razorpayOrderId: 'order_1' }),
        );
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toEqual({ success: true, status: 'CAPTURED' });
        expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('marks payment failed for authorized owner', async () => {
        mockFindUnique.mockResolvedValue({
            id: 'pay_2',
            scanId: 'scan_1',
            status: 'CREATED',
            scan: {
                userId: 'user_1',
                ipAddress: null,
            },
        });
        mockAuth.mockResolvedValue({ user: { id: 'user_1', role: 'USER' } });
        mockUpdate.mockResolvedValue({ id: 'pay_2', status: 'FAILED' });

        const response = await POST(
            createRequest({ scanId: 'scan_1', razorpayOrderId: 'order_1', reason: 'cancelled' }),
        );
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toEqual({ success: true, status: 'FAILED' });
        expect(mockUpdate).toHaveBeenCalledWith({
            where: { id: 'pay_2' },
            data: { status: 'FAILED' },
        });
    });

    it('allows anonymous scan access when claim token is valid', async () => {
        mockFindUnique.mockResolvedValue({
            id: 'pay_3',
            scanId: 'scan_anon',
            status: 'CREATED',
            scan: {
                userId: null,
                ipAddress: null,
            },
        });
        mockVerifyScanClaimToken.mockResolvedValue(true);
        mockUpdate.mockResolvedValue({ id: 'pay_3', status: 'FAILED' });

        const response = await POST(
            createRequest(
                { scanId: 'scan_anon', razorpayOrderId: 'order_anon' },
                { 'x-claim-token': 'claim_token' },
            ),
        );
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toEqual({ success: true, status: 'FAILED' });
        expect(mockVerifyScanClaimToken).toHaveBeenCalledWith('claim_token', 'scan_anon');
    });
});

