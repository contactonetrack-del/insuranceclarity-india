import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '../route';

const { mockMarkStaleScansAndPayments } = vi.hoisted(() => ({
    mockMarkStaleScansAndPayments: vi.fn(),
}));

vi.mock('@/services/ops.service', () => ({
    markStaleScansAndPayments: mockMarkStaleScansAndPayments,
}));

vi.mock('@/lib/logger', () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

describe('GET /api/cron/cleanup-stale-scans', () => {
    const originalCronSecret = process.env.CRON_SECRET;

    const createRequest = (headers: Record<string, string> = {}) =>
        new NextRequest('http://localhost:3000/api/cron/cleanup-stale-scans', {
            method: 'GET',
            headers,
        });

    beforeEach(() => {
        vi.clearAllMocks();
        process.env.CRON_SECRET = 'cron-secret';
        mockMarkStaleScansAndPayments.mockResolvedValue([{ count: 2 }, { count: 1 }]);
    });

    afterEach(() => {
        process.env.CRON_SECRET = originalCronSecret;
    });

    it('returns 401 when auth header is invalid', async () => {
        const response = await GET(createRequest({ authorization: 'Bearer wrong-secret' }));
        const json = await response.json();

        expect(response.status).toBe(401);
        expect(json).toEqual({ error: 'Unauthorized' });
        expect(mockMarkStaleScansAndPayments).not.toHaveBeenCalled();
    });

    it('returns 500 when cron secret is not configured', async () => {
        delete process.env.CRON_SECRET;

        const response = await GET(createRequest({ authorization: 'Bearer cron-secret' }));
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json).toEqual({ error: 'Server misconfiguration' });
        expect(mockMarkStaleScansAndPayments).not.toHaveBeenCalled();
    });

    it('returns stale cleanup counts when authorized', async () => {
        const response = await GET(createRequest({ authorization: 'Bearer cron-secret' }));
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.staleScans).toBe(2);
        expect(json.stalePayments).toBe(1);
        expect(typeof json.checkedAt).toBe('string');
        expect(mockMarkStaleScansAndPayments).toHaveBeenCalledTimes(1);
    });

    it('returns 500 when cleanup operation throws', async () => {
        mockMarkStaleScansAndPayments.mockRejectedValue(new Error('db unavailable'));

        const response = await GET(createRequest({ authorization: 'Bearer cron-secret' }));
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json).toEqual({
            error: 'Cleanup failed',
            details: 'db unavailable',
        });
    });
});
