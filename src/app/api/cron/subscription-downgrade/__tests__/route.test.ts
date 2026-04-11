import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from '../route';

const {
    mockFindExpiredSubscriptions,
    mockDowngradeExpiredSubscription,
} = vi.hoisted(() => ({
    mockFindExpiredSubscriptions: vi.fn(),
    mockDowngradeExpiredSubscription: vi.fn(),
}));

const { mockSendUrgentWebhook } = vi.hoisted(() => ({
    mockSendUrgentWebhook: vi.fn(),
}));

vi.mock('@/services/ops.service', () => ({
    findExpiredSubscriptions: mockFindExpiredSubscriptions,
    downgradeExpiredSubscription: mockDowngradeExpiredSubscription,
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

describe('GET /api/cron/subscription-downgrade', () => {
    const originalCronSecret = process.env.CRON_SECRET;

    const createRequest = (headers: Record<string, string> = {}) =>
        new Request('http://localhost:3000/api/cron/subscription-downgrade', {
            method: 'GET',
            headers,
        });

    beforeEach(() => {
        vi.clearAllMocks();
        process.env.CRON_SECRET = 'cron-secret';
        mockFindExpiredSubscriptions.mockResolvedValue([]);
        mockDowngradeExpiredSubscription.mockResolvedValue(undefined);
    });

    afterEach(() => {
        process.env.CRON_SECRET = originalCronSecret;
    });

    it('returns 401 when cron secret is configured and auth header is invalid', async () => {
        const response = await GET(createRequest({ Authorization: 'Bearer wrong' }));
        const json = await response.json();

        expect(response.status).toBe(401);
        expect(json.error).toBe('Unauthorized');
        expect(mockFindExpiredSubscriptions).not.toHaveBeenCalled();
    });

    it('processes expired subscriptions and downgrades supported statuses', async () => {
        mockFindExpiredSubscriptions.mockResolvedValue([
            {
                id: 'sub_active_1',
                userId: 'user_1',
                status: 'ACTIVE',
                user: { plan: 'PRO' },
            },
            {
                id: 'sub_cancelled_1',
                userId: 'user_2',
                status: 'CANCELLED',
                user: { plan: 'ENTERPRISE' },
            },
        ]);

        const response = await GET(createRequest({ Authorization: 'Bearer cron-secret' }));
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toEqual({
            success: true,
            processed: 2,
            downgraded: 2,
            errors: 0,
        });
        expect(mockDowngradeExpiredSubscription).toHaveBeenNthCalledWith(1, 'sub_active_1', 'user_1', 'ACTIVE');
        expect(mockDowngradeExpiredSubscription).toHaveBeenNthCalledWith(2, 'sub_cancelled_1', 'user_2', 'CANCELLED');
    });

    it('skips unsupported statuses without counting them as errors', async () => {
        mockFindExpiredSubscriptions.mockResolvedValue([
            {
                id: 'sub_pending_1',
                userId: 'user_3',
                status: 'PENDING',
                user: { plan: 'PRO' },
            },
        ]);

        const response = await GET(createRequest({ Authorization: 'Bearer cron-secret' }));
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toEqual({
            success: true,
            processed: 1,
            downgraded: 0,
            errors: 0,
        });
        expect(mockDowngradeExpiredSubscription).not.toHaveBeenCalled();
    });

    it('sends warning alert when high volume downgrades occur', async () => {
        const subscriptions = Array.from({ length: 11 }).map((_, index) => ({
            id: `sub_${index}`,
            userId: `user_${index}`,
            status: 'ACTIVE',
            user: { plan: 'PRO' },
        }));
        mockFindExpiredSubscriptions.mockResolvedValue(subscriptions);

        const response = await GET(createRequest({ Authorization: 'Bearer cron-secret' }));
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.downgraded).toBe(11);
        expect(mockSendUrgentWebhook).toHaveBeenCalledWith(
            '🚨 High Volume Subscription Downgrades',
            'Downgraded 11 users in this run. Check for subscription sync issues.',
            'WARNING',
        );
    });

    it('tracks per-subscription errors and continues processing', async () => {
        mockFindExpiredSubscriptions.mockResolvedValue([
            {
                id: 'sub_1',
                userId: 'user_1',
                status: 'ACTIVE',
                user: { plan: 'PRO' },
            },
            {
                id: 'sub_2',
                userId: 'user_2',
                status: 'ACTIVE',
                user: { plan: 'PRO' },
            },
        ]);
        mockDowngradeExpiredSubscription.mockRejectedValueOnce(new Error('db write failed'));

        const response = await GET(createRequest({ Authorization: 'Bearer cron-secret' }));
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toEqual({
            success: true,
            processed: 2,
            downgraded: 1,
            errors: 1,
        });
    });

    it('returns 500 and sends critical alert on fatal cron failure', async () => {
        mockFindExpiredSubscriptions.mockRejectedValue(new Error('database offline'));

        const response = await GET(createRequest({ Authorization: 'Bearer cron-secret' }));
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json.error).toBe('Internal server error');
        expect(mockSendUrgentWebhook).toHaveBeenCalledWith(
            '💥 Subscription Downgrade Cron Failed',
            'Error: database offline',
            'CRITICAL',
        );
    });
});
