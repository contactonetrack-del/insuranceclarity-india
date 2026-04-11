import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from '../route';

const {
    mockFindStaleCreatedPayments,
    mockFailPaymentAndScan,
} = vi.hoisted(() => ({
    mockFindStaleCreatedPayments: vi.fn(),
    mockFailPaymentAndScan: vi.fn(),
}));

const { mockSendUrgentWebhook } = vi.hoisted(() => ({
    mockSendUrgentWebhook: vi.fn(),
}));

vi.mock('@/services/ops.service', () => ({
    findStaleCreatedPayments: mockFindStaleCreatedPayments,
    failPaymentAndScan: mockFailPaymentAndScan,
}));

vi.mock('@/lib/observability/alerts', () => ({
    sendUrgentWebhook: mockSendUrgentWebhook,
}));

vi.mock('@/lib/logger', () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

describe('GET /api/cron/payment-cleanup', () => {
    const originalCronSecret = process.env.CRON_SECRET;

    const createRequest = (headers: Record<string, string> = {}) =>
        new Request('http://localhost:3000/api/cron/payment-cleanup', {
            method: 'GET',
            headers,
        });

    beforeEach(() => {
        vi.clearAllMocks();
        process.env.CRON_SECRET = 'cron-secret';
        mockFindStaleCreatedPayments.mockResolvedValue([]);
    });

    afterEach(() => {
        process.env.CRON_SECRET = originalCronSecret;
    });

    it('returns 401 when authorization is invalid', async () => {
        const response = await GET(createRequest({ Authorization: 'Bearer wrong' }));
        const json = await response.json();

        expect(response.status).toBe(401);
        expect(json).toEqual({ error: 'Unauthorized' });
        expect(mockFindStaleCreatedPayments).not.toHaveBeenCalled();
    });

    it('returns 500 when cron secret is not configured', async () => {
        delete process.env.CRON_SECRET;

        const response = await GET(createRequest({ Authorization: 'Bearer cron-secret' }));
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json).toEqual({ error: 'Server misconfiguration' });
        expect(mockFindStaleCreatedPayments).not.toHaveBeenCalled();
    });

    it('processes stale payments and records per-item errors', async () => {
        mockFindStaleCreatedPayments.mockResolvedValue([
            { id: 'pay_1', scanId: 'scan_1' },
            { id: 'pay_2', scanId: 'scan_2' },
        ]);
        mockFailPaymentAndScan.mockRejectedValueOnce(new Error('update failed'));

        const response = await GET(createRequest({ Authorization: 'Bearer cron-secret' }));
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toEqual({
            success: true,
            processed: 2,
            failed: 1,
            errors: 1,
        });
        expect(mockFailPaymentAndScan).toHaveBeenCalledTimes(2);
    });

    it('sends warning alert when stale failure volume is high', async () => {
        const stalePayments = Array.from({ length: 11 }).map((_, index) => ({
            id: `pay_${index}`,
            scanId: `scan_${index}`,
        }));
        mockFindStaleCreatedPayments.mockResolvedValue(stalePayments);

        const response = await GET(createRequest({ Authorization: 'Bearer cron-secret' }));
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.failed).toBe(11);
        expect(mockSendUrgentWebhook).toHaveBeenCalledWith(
            '🚨 High Volume Stale Payments',
            expect.stringContaining('Auto-failed 11 payments'),
            'WARNING',
        );
    });

    it('returns 500 and sends critical alert when cron crashes', async () => {
        mockFindStaleCreatedPayments.mockRejectedValue(new Error('db offline'));

        const response = await GET(createRequest({ Authorization: 'Bearer cron-secret' }));
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json).toEqual({ error: 'Internal server error' });
        expect(mockSendUrgentWebhook).toHaveBeenCalledWith(
            '💥 Payment Cleanup Cron Failed',
            expect.stringContaining('db offline'),
            'CRITICAL',
        );
    });
});
