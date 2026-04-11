import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '../route';

const { mockResetMonthlyScansForFreeAndPro } = vi.hoisted(() => ({
    mockResetMonthlyScansForFreeAndPro: vi.fn(),
}));

vi.mock('@/services/ops.service', () => ({
    resetMonthlyScansForFreeAndPro: mockResetMonthlyScansForFreeAndPro,
}));

vi.mock('@/lib/logger', () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

describe('GET /api/cron/reset-scans', () => {
    const originalCronSecret = process.env.CRON_SECRET;

    const createRequest = (headers: Record<string, string> = {}) =>
        new NextRequest('http://localhost:3000/api/cron/reset-scans', {
            method: 'GET',
            headers,
        });

    beforeEach(() => {
        vi.clearAllMocks();
        process.env.CRON_SECRET = 'cron-secret';
        mockResetMonthlyScansForFreeAndPro.mockResolvedValue({ count: 42 });
    });

    afterEach(() => {
        process.env.CRON_SECRET = originalCronSecret;
    });

    it('returns 401 for invalid authorization header', async () => {
        const response = await GET(createRequest({ authorization: 'Bearer invalid' }));
        const json = await response.json();

        expect(response.status).toBe(401);
        expect(json.error).toBe('Unauthorized');
        expect(mockResetMonthlyScansForFreeAndPro).not.toHaveBeenCalled();
    });

    it('returns success payload for authorized cron call', async () => {
        const response = await GET(createRequest({ authorization: 'Bearer cron-secret' }));
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.usersReset).toBe(42);
        expect(typeof json.resetAt).toBe('string');
        expect(mockResetMonthlyScansForFreeAndPro).toHaveBeenCalledTimes(1);
    });

    it('returns 500 when reset operation throws', async () => {
        mockResetMonthlyScansForFreeAndPro.mockRejectedValue(new Error('db unavailable'));

        const response = await GET(createRequest({ authorization: 'Bearer cron-secret' }));
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json.error).toBe('Reset failed');
        expect(json.details).toBe('db unavailable');
    });
});
