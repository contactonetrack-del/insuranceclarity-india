import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '../route';

const { mockAuth } = vi.hoisted(() => ({
    mockAuth: vi.fn(),
}));

const { mockVerifyScanClaimToken } = vi.hoisted(() => ({
    mockVerifyScanClaimToken: vi.fn(),
}));

const { mockFindScanUnique, mockFindPaymentUnique } = vi.hoisted(() => ({
    mockFindScanUnique: vi.fn(),
    mockFindPaymentUnique: vi.fn(),
}));

vi.mock('@/auth', () => ({
    auth: mockAuth,
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
        },
    },
}));

vi.mock('@/lib/logger', () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

describe('GET /api/payment/status', () => {
    const createRequest = (scanId?: string, headers: Record<string, string> = {}) => {
        const url = new URL('http://localhost:3000/api/payment/status');
        if (scanId) {
            url.searchParams.set('scanId', scanId);
        }

        return new NextRequest(url.toString(), {
            method: 'GET',
            headers,
        });
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockAuth.mockResolvedValue({ user: { id: 'user_1', role: 'USER' } });
        mockVerifyScanClaimToken.mockResolvedValue(false);
    });

    it('returns validation error when scanId is missing', async () => {
        const response = await GET(createRequest());
        const json = await response.json();

        expect(response.status).toBe(400);
        expect(json.success).toBe(false);
        expect(json.error.code).toBe('VALIDATION_ERROR');
        expect(mockFindScanUnique).not.toHaveBeenCalled();
    });

    it('returns not found when scan does not exist', async () => {
        mockFindScanUnique.mockResolvedValue(null);

        const response = await GET(createRequest('scan_missing'));
        const json = await response.json();

        expect(response.status).toBe(404);
        expect(json.success).toBe(false);
        expect(json.error.code).toBe('NOT_FOUND');
    });

    it('returns not found when caller is unauthorized for the scan', async () => {
        mockFindScanUnique.mockResolvedValue({
            id: 'scan_1',
            userId: 'owner_user',
            ipAddress: '10.0.0.1',
            isPaid: false,
        });
        mockAuth.mockResolvedValue({ user: { id: 'other_user', role: 'USER' } });

        const response = await GET(createRequest('scan_1', { 'x-forwarded-for': '10.0.0.2' }));
        const json = await response.json();

        expect(response.status).toBe(404);
        expect(json.success).toBe(false);
        expect(json.error.code).toBe('NOT_FOUND');
    });

    it('returns captured when scan is already paid', async () => {
        mockFindScanUnique.mockResolvedValue({
            id: 'scan_1',
            userId: 'user_1',
            ipAddress: null,
            isPaid: true,
        });
        mockFindPaymentUnique.mockResolvedValue(null);

        const response = await GET(createRequest('scan_1'));
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.status).toBe('CAPTURED');
        expect(json.canRetry).toBe(false);
    });

    it('returns NOT_CREATED when no payment record exists', async () => {
        mockFindScanUnique.mockResolvedValue({
            id: 'scan_1',
            userId: 'user_1',
            ipAddress: null,
            isPaid: false,
        });
        mockFindPaymentUnique.mockResolvedValue(null);

        const response = await GET(createRequest('scan_1'));
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.status).toBe('NOT_CREATED');
        expect(json.canRetry).toBe(true);
        expect(json.updatedAt).toBeNull();
    });

    it('returns CREATED for pending payment and FAILED for failed payment', async () => {
        mockFindScanUnique.mockResolvedValue({
            id: 'scan_1',
            userId: 'user_1',
            ipAddress: null,
            isPaid: false,
        });
        mockFindPaymentUnique.mockResolvedValueOnce({
            status: 'CREATED',
            updatedAt: new Date('2026-04-10T00:00:00.000Z'),
            razorpayOrderId: 'order_1',
        });
        mockFindPaymentUnique.mockResolvedValueOnce({
            status: 'FAILED',
            updatedAt: new Date('2026-04-10T00:00:00.000Z'),
            razorpayOrderId: 'order_2',
        });

        const createdResponse = await GET(createRequest('scan_1'));
        const createdJson = await createdResponse.json();
        expect(createdResponse.status).toBe(200);
        expect(createdJson.status).toBe('CREATED');
        expect(createdJson.lastOrderId).toBe('order_1');

        const failedResponse = await GET(createRequest('scan_1'));
        const failedJson = await failedResponse.json();
        expect(failedResponse.status).toBe(200);
        expect(failedJson.status).toBe('FAILED');
        expect(failedJson.lastOrderId).toBe('order_2');
    });

    it('allows anonymous access when claim token is valid for unowned scan', async () => {
        mockAuth.mockResolvedValue(null);
        mockFindScanUnique.mockResolvedValue({
            id: 'scan_anon',
            userId: null,
            ipAddress: null,
            isPaid: false,
        });
        mockVerifyScanClaimToken.mockResolvedValue(true);
        mockFindPaymentUnique.mockResolvedValue({
            status: 'REFUNDED',
            updatedAt: new Date('2026-04-10T00:00:00.000Z'),
            razorpayOrderId: 'order_anon',
        });

        const response = await GET(createRequest('scan_anon', { 'x-claim-token': 'claim_token' }));
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(mockVerifyScanClaimToken).toHaveBeenCalledWith('claim_token', 'scan_anon');
        expect(json.status).toBe('FAILED');
        expect(json.lastOrderId).toBe('order_anon');
    });

    it('returns internal server error when scan lookup throws', async () => {
        mockFindScanUnique.mockRejectedValue(new Error('db unavailable'));

        const response = await GET(createRequest('scan_1'));
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json.success).toBe(false);
        expect(json.error.code).toBe('INTERNAL_SERVER_ERROR');
        expect(json.error.message).toBe('Unable to fetch payment status.');
    });
});
