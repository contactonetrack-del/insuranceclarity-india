import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from '../route';

const {
    mockCountCapturedPaymentsSince,
    mockCountScansSince,
} = vi.hoisted(() => ({
    mockCountCapturedPaymentsSince: vi.fn(),
    mockCountScansSince: vi.fn(),
}));

const { mockRedisIsConfigured, mockRedisKeys } = vi.hoisted(() => ({
    mockRedisIsConfigured: vi.fn(),
    mockRedisKeys: vi.fn(),
}));

const { mockSendUrgentWebhook } = vi.hoisted(() => ({
    mockSendUrgentWebhook: vi.fn(),
}));

vi.mock('@/services/ops.service', () => ({
    countCapturedPaymentsSince: mockCountCapturedPaymentsSince,
    countScansSince: mockCountScansSince,
}));

vi.mock('@/lib/cache/redis', () => ({
    redisClient: {
        isConfigured: mockRedisIsConfigured,
        keys: mockRedisKeys,
    },
}));

vi.mock('@/lib/observability/alerts', () => ({
    sendUrgentWebhook: mockSendUrgentWebhook,
}));

vi.mock('@/lib/logger', () => ({
    logger: {
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

describe('GET /api/cron/anomaly-alerts', () => {
    const originalCronSecret = process.env.CRON_SECRET;

    const createRequest = (headers: Record<string, string> = {}) =>
        new Request('http://localhost:3000/api/cron/anomaly-alerts', {
            method: 'GET',
            headers,
        });

    beforeEach(() => {
        vi.clearAllMocks();
        process.env.CRON_SECRET = 'cron-secret';
        mockCountCapturedPaymentsSince.mockResolvedValue(4);
        mockCountScansSince.mockResolvedValue(3);
        mockRedisIsConfigured.mockReturnValue(false);
        mockRedisKeys.mockResolvedValue([]);
    });

    afterEach(() => {
        process.env.CRON_SECRET = originalCronSecret;
    });

    it('returns 401 when authorization header is invalid', async () => {
        const response = await GET(createRequest({ Authorization: 'Bearer wrong' }));
        const json = await response.json();

        expect(response.status).toBe(401);
        expect(json).toEqual({ error: 'Unauthorized' });
        expect(mockCountCapturedPaymentsSince).not.toHaveBeenCalled();
    });

    it('sends critical conversion alert when scans are high and captures are zero', async () => {
        mockCountCapturedPaymentsSince.mockResolvedValue(0);
        mockCountScansSince.mockResolvedValue(8);

        const response = await GET(createRequest({ Authorization: 'Bearer cron-secret' }));
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.metrics).toEqual({
            capturedLast24h: 0,
            deadLetterCount: 0,
        });
        expect(mockSendUrgentWebhook).toHaveBeenCalledWith(
            expect.stringContaining('ZERO Conversions'),
            expect.stringContaining('0 captured payments despite 8 scan attempts'),
            'CRITICAL',
        );
    });

    it('does not send conversion alert when low-traffic scans are below threshold', async () => {
        mockCountCapturedPaymentsSince.mockResolvedValue(0);
        mockCountScansSince.mockResolvedValue(5);

        const response = await GET(createRequest({ Authorization: 'Bearer cron-secret' }));
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.metrics).toEqual({
            capturedLast24h: 0,
            deadLetterCount: 0,
        });
        expect(mockSendUrgentWebhook).not.toHaveBeenCalled();
    });

    it('sends warning when dead-letter queue count spikes', async () => {
        mockRedisIsConfigured.mockReturnValue(true);
        mockRedisKeys.mockResolvedValue(Array.from({ length: 11 }, (_, index) => `queue:dead-letter:${index}`));

        const response = await GET(createRequest({ Authorization: 'Bearer cron-secret' }));
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.metrics).toEqual({
            capturedLast24h: 4,
            deadLetterCount: 11,
        });
        expect(mockSendUrgentWebhook).toHaveBeenCalledWith(
            expect.stringContaining('Background Job Failure Spike'),
            expect.stringContaining('Detected 11 jobs in the dead-letter queue'),
            'WARNING',
        );
    });

    it('continues successfully when alert webhook delivery fails', async () => {
        mockCountCapturedPaymentsSince.mockResolvedValue(0);
        mockCountScansSince.mockResolvedValue(7);
        mockSendUrgentWebhook.mockRejectedValue(new Error('alert transport failed'));

        const response = await GET(createRequest({ Authorization: 'Bearer cron-secret' }));
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.metrics).toEqual({
            capturedLast24h: 0,
            deadLetterCount: 0,
        });
        expect(mockSendUrgentWebhook).toHaveBeenCalledTimes(1);
    });

    it('returns 500 when metric counting crashes', async () => {
        mockCountCapturedPaymentsSince.mockRejectedValue(new Error('ops db unavailable'));

        const response = await GET(createRequest({ Authorization: 'Bearer cron-secret' }));
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json).toEqual({ error: 'ops db unavailable' });
    });
});
