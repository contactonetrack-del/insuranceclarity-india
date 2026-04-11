import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '../route';

const { mockAuth } = vi.hoisted(() => ({
    mockAuth: vi.fn(),
}));

const { mockFindScanUnique } = vi.hoisted(() => ({
    mockFindScanUnique: vi.fn(),
}));

const { mockGetScanStatus, mockGetReport } = vi.hoisted(() => ({
    mockGetScanStatus: vi.fn(),
    mockGetReport: vi.fn(),
}));

const { mockVerifyScanClaimToken } = vi.hoisted(() => ({
    mockVerifyScanClaimToken: vi.fn(),
}));

vi.mock('@/auth', () => ({
    auth: mockAuth,
}));

vi.mock('@/lib/prisma', () => ({
    prisma: {
        scan: {
            findUnique: mockFindScanUnique,
        },
    },
}));

vi.mock('@/services/report.service', () => ({
    getScanStatus: mockGetScanStatus,
    getReport: mockGetReport,
}));

vi.mock('@/lib/security/scan-claim', () => ({
    verifyScanClaimToken: mockVerifyScanClaimToken,
}));

vi.mock('@/lib/logger', () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

describe('GET /api/result/[id]', () => {
    const validScanId = 'c12345678901234567890';

    const createRequest = (url: string, headers: Record<string, string> = {}) =>
        new NextRequest(url, {
            method: 'GET',
            headers,
        });

    const createParams = (id: string) =>
        ({ params: Promise.resolve({ id }) }) as { params: Promise<{ id: string }> };

    beforeEach(() => {
        vi.clearAllMocks();
        mockAuth.mockResolvedValue({ user: { id: 'user_1', role: 'USER' } });
        mockFindScanUnique.mockResolvedValue({ userId: 'user_1', ipAddress: null });
        mockVerifyScanClaimToken.mockResolvedValue(false);
        mockGetScanStatus.mockResolvedValue({ status: 'COMPLETED', isPaid: false });
        mockGetReport.mockResolvedValue({ scanId: validScanId, isPaywalled: true });
    });

    it('returns 404 for implausible scan id', async () => {
        const response = await GET(
            createRequest('http://localhost:3000/api/result/bad'),
            createParams('bad'),
        );
        const json = await response.json();

        expect(response.status).toBe(404);
        expect(json.error).toBe('Scan not found.');
    });

    it('returns 404 when scan access record is missing', async () => {
        mockFindScanUnique.mockResolvedValue(null);

        const response = await GET(
            createRequest(`http://localhost:3000/api/result/${validScanId}`),
            createParams(validScanId),
        );
        const json = await response.json();

        expect(response.status).toBe(404);
        expect(json.error).toBe('Scan not found.');
    });

    it('returns 404 when requester does not own the scan and is not admin', async () => {
        mockAuth.mockResolvedValue({ user: { id: 'user_other', role: 'USER' } });
        mockFindScanUnique.mockResolvedValue({ userId: 'user_owner', ipAddress: null });

        const response = await GET(
            createRequest(`http://localhost:3000/api/result/${validScanId}`),
            createParams(validScanId),
        );
        const json = await response.json();

        expect(response.status).toBe(404);
        expect(json.error).toBe('Scan not found.');
        expect(mockGetScanStatus).not.toHaveBeenCalled();
    });

    it('returns status payload in status polling mode', async () => {
        mockGetScanStatus.mockResolvedValue({ status: 'PROCESSING', progress: 72, isPaid: false });

        const response = await GET(
            createRequest(`http://localhost:3000/api/result/${validScanId}?status=true`),
            createParams(validScanId),
        );
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toEqual({ status: 'PROCESSING', progress: 72, isPaid: false });
        expect(mockGetScanStatus).toHaveBeenCalledWith(validScanId);
        expect(mockGetReport).not.toHaveBeenCalled();
    });

    it('returns 202 for pending/processing scan states', async () => {
        mockGetScanStatus.mockResolvedValue({ status: 'PENDING', isPaid: false });

        const response = await GET(
            createRequest(`http://localhost:3000/api/result/${validScanId}`),
            createParams(validScanId),
        );
        const json = await response.json();

        expect(response.status).toBe(202);
        expect(json.status).toBe('PENDING');
    });

    it('returns 422 for failed scan state', async () => {
        mockGetScanStatus.mockResolvedValue({ status: 'FAILED', isPaid: false });

        const response = await GET(
            createRequest(`http://localhost:3000/api/result/${validScanId}`),
            createParams(validScanId),
        );
        const json = await response.json();

        expect(response.status).toBe(422);
        expect(json.status).toBe('FAILED');
    });

    it('returns full report using locale from request headers', async () => {
        mockGetScanStatus.mockResolvedValue({ status: 'COMPLETED', isPaid: true });
        mockGetReport.mockResolvedValue({ scanId: validScanId, isPaywalled: false, score: 81 });

        const response = await GET(
            createRequest(`http://localhost:3000/api/result/${validScanId}`, {
                'accept-language': 'hi-IN,hi;q=0.9,en;q=0.8',
            }),
            createParams(validScanId),
        );
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toEqual({ scanId: validScanId, isPaywalled: false, score: 81 });
        expect(mockGetReport).toHaveBeenCalledWith({
            scanId: validScanId,
            isPaid: true,
            locale: 'hi',
        });
    });

    it('uses claim token access for anonymous users and returns paywalled report for unpaid scan', async () => {
        mockAuth.mockResolvedValue(null);
        mockFindScanUnique.mockResolvedValue({ userId: null, ipAddress: '198.51.100.11' });
        mockVerifyScanClaimToken.mockResolvedValue(true);
        mockGetScanStatus.mockResolvedValue({ status: 'COMPLETED', isPaid: false });
        mockGetReport.mockResolvedValue({ scanId: validScanId, isPaywalled: true, score: 81 });

        const response = await GET(
            createRequest(`http://localhost:3000/api/result/${validScanId}`, {
                'x-claim-token': 'valid-claim-token',
                'x-forwarded-for': '203.0.113.25',
            }),
            createParams(validScanId),
        );
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toEqual({ scanId: validScanId, isPaywalled: true, score: 81 });
        expect(mockVerifyScanClaimToken).toHaveBeenCalledWith('valid-claim-token', validScanId);
        expect(mockGetReport).toHaveBeenCalledWith({
            scanId: validScanId,
            isPaid: false,
            locale: 'en',
        });
    });
});
