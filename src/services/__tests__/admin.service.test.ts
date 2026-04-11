import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAdminBusinessReadinessData, getAdminJobHealthData, getAdminStatsData } from '../admin.service';

const {
    mockCountCapturedPaymentsSince,
    mockCountPendingPaymentsForReconciliation,
    mockCountLeads,
    mockCountScansSince,
    mockCountStaleCreatedPayments,
    mockCountStaleScans,
    mockCountErrorLogs,
} = vi.hoisted(() => ({
    mockCountCapturedPaymentsSince: vi.fn(),
    mockCountPendingPaymentsForReconciliation: vi.fn(),
    mockCountLeads: vi.fn(),
    mockCountScansSince: vi.fn(),
    mockCountStaleCreatedPayments: vi.fn(),
    mockCountStaleScans: vi.fn(),
    mockCountErrorLogs: vi.fn(),
}));

const { mockGetQueueProvider } = vi.hoisted(() => ({
    mockGetQueueProvider: vi.fn(),
}));

const { mockRedisIsConfigured, mockRedisKeys } = vi.hoisted(() => ({
    mockRedisIsConfigured: vi.fn(),
    mockRedisKeys: vi.fn(),
}));

vi.mock('@/services/ops.service', () => ({
    countCapturedPaymentsSince: mockCountCapturedPaymentsSince,
    countLeads: mockCountLeads,
    countPendingPaymentsForReconciliation: mockCountPendingPaymentsForReconciliation,
    countScansSince: mockCountScansSince,
    countStaleCreatedPayments: mockCountStaleCreatedPayments,
    countStaleScans: mockCountStaleScans,
    countErrorLogs: mockCountErrorLogs,
}));

const { mockGetFunnelSummary } = vi.hoisted(() => ({
    mockGetFunnelSummary: vi.fn(),
}));

vi.mock('@/lib/analytics/funnel', () => ({
    getFunnelSummary: mockGetFunnelSummary,
}));

vi.mock('@/lib/queue/config', () => ({
    getQueueProvider: mockGetQueueProvider,
}));

vi.mock('@/lib/cache/redis', () => ({
    redisClient: {
        isConfigured: mockRedisIsConfigured,
        keys: mockRedisKeys,
    },
}));

vi.mock('@/repositories/lead.repository', () => ({
    leadRepository: {
        findRecent: vi.fn(),
        updateStatus: vi.fn(),
    },
}));

const { mockQuoteCountAll, mockQuoteFindAll } = vi.hoisted(() => ({
    mockQuoteCountAll: vi.fn(),
    mockQuoteFindAll: vi.fn(),
}));

vi.mock('@/repositories/quote.repository', () => ({
    quoteRepository: {
        countAll: mockQuoteCountAll,
        findAll: mockQuoteFindAll,
    },
}));

const { mockSumReportTokensUsed } = vi.hoisted(() => ({
    mockSumReportTokensUsed: vi.fn(),
}));

vi.mock('@/repositories/ops.repository', () => ({
    opsRepository: {
        sumReportTokensUsed: mockSumReportTokensUsed,
    },
}));

const { mockSubscriptionCountActive } = vi.hoisted(() => ({
    mockSubscriptionCountActive: vi.fn(),
}));

vi.mock('@/repositories/subscription.repository', () => ({
    subscriptionRepository: {
        countActive: mockSubscriptionCountActive,
    },
}));

describe('admin.service getAdminJobHealthData', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns queue/cron observability metrics with redis dead-letter count', async () => {
        mockCountPendingPaymentsForReconciliation.mockResolvedValue(3);
        mockCountStaleCreatedPayments.mockResolvedValue(2);
        mockCountStaleScans.mockResolvedValue(1);
        mockCountErrorLogs
            .mockResolvedValueOnce(1)
            .mockResolvedValueOnce(4)
            .mockResolvedValueOnce(14)
            .mockResolvedValueOnce(42)
            .mockResolvedValueOnce(0)
            .mockResolvedValueOnce(2)
            .mockResolvedValueOnce(9)
            .mockResolvedValueOnce(15);
        mockGetQueueProvider.mockReturnValue('qstash');
        mockRedisIsConfigured.mockReturnValue(true);
        mockRedisKeys.mockResolvedValue(['queue:dead-letter:1', 'queue:dead-letter:2']);
        process.env.DISCORD_WEBHOOK_URL = 'https://discord.example/webhook';
        delete process.env.SLACK_WEBHOOK_URL;

        const result = await getAdminJobHealthData();

        expect(mockCountErrorLogs).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                route: { startsWith: '/api/cron/' },
                severity: { in: ['HIGH', 'CRITICAL'] },
                timestamp: { gte: expect.any(Date) },
            }),
        );
        expect(mockCountErrorLogs).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                route: { startsWith: '/api/cron/' },
                severity: { in: ['HIGH', 'CRITICAL'] },
                timestamp: { gte: expect.any(Date) },
            }),
        );
        expect(mockCountErrorLogs).toHaveBeenNthCalledWith(
            3,
            expect.objectContaining({
                route: { startsWith: '/api/cron/' },
                severity: { in: ['HIGH', 'CRITICAL'] },
                timestamp: { gte: expect.any(Date) },
            }),
        );
        expect(mockCountErrorLogs).toHaveBeenNthCalledWith(
            4,
            expect.objectContaining({
                route: { startsWith: '/api/cron/' },
                severity: { in: ['HIGH', 'CRITICAL'] },
                timestamp: { gte: expect.any(Date) },
            }),
        );
        expect(mockCountErrorLogs).toHaveBeenNthCalledWith(
            5,
            expect.objectContaining({
                route: { startsWith: '/api/jobs/' },
                severity: { in: ['HIGH', 'CRITICAL'] },
                timestamp: { gte: expect.any(Date) },
            }),
        );
        expect(mockCountErrorLogs).toHaveBeenNthCalledWith(
            6,
            expect.objectContaining({
                route: { startsWith: '/api/jobs/' },
                severity: { in: ['HIGH', 'CRITICAL'] },
                timestamp: { gte: expect.any(Date) },
            }),
        );
        expect(mockCountErrorLogs).toHaveBeenNthCalledWith(
            7,
            expect.objectContaining({
                route: { startsWith: '/api/jobs/' },
                severity: { in: ['HIGH', 'CRITICAL'] },
                timestamp: { gte: expect.any(Date) },
            }),
        );
        expect(mockCountErrorLogs).toHaveBeenNthCalledWith(
            8,
            expect.objectContaining({
                route: { startsWith: '/api/jobs/' },
                severity: { in: ['HIGH', 'CRITICAL'] },
                timestamp: { gte: expect.any(Date) },
            }),
        );

        expect(result).toMatchObject({
            pendingPaymentReconciliation: 3,
            staleCreatedPayments: 2,
            staleScans: 1,
            deadLetterJobs: 2,
            recentCronErrors1h: 1,
            recentCronErrors24h: 4,
            recentCronErrors7d: 14,
            recentCronErrors30d: 42,
            recentQueueErrors1h: 0,
            recentQueueErrors24h: 2,
            recentQueueErrors7d: 9,
            recentQueueErrors30d: 15,
            cronHourlyBaseline24h: 0.17,
            queueHourlyBaseline24h: 0.08,
            cronDailyBaseline7d: 2,
            queueDailyBaseline7d: 1.29,
            cronSpike: false,
            queueSpike: false,
            cronAlertLevel: 'warning',
            queueAlertLevel: 'warning',
            queueProvider: 'qstash',
            redisConfigured: true,
            alertDestinationsConfigured: 1,
            alertDestinationLabels: ['Discord'],
        });
        expect(typeof result.generatedAt).toBe('string');
    });

    it('returns zero dead-letter jobs when redis is not configured', async () => {
        mockCountPendingPaymentsForReconciliation.mockResolvedValue(0);
        mockCountStaleCreatedPayments.mockResolvedValue(0);
        mockCountStaleScans.mockResolvedValue(0);
        mockCountErrorLogs.mockResolvedValue(0);
        mockGetQueueProvider.mockReturnValue('http');
        mockRedisIsConfigured.mockReturnValue(false);
        delete process.env.DISCORD_WEBHOOK_URL;
        delete process.env.SLACK_WEBHOOK_URL;

        const result = await getAdminJobHealthData();

        expect(mockRedisKeys).not.toHaveBeenCalled();
        expect(result).toMatchObject({
            deadLetterJobs: 0,
            recentCronErrors1h: 0,
            recentCronErrors24h: 0,
            recentCronErrors7d: 0,
            recentCronErrors30d: 0,
            recentQueueErrors1h: 0,
            recentQueueErrors24h: 0,
            recentQueueErrors7d: 0,
            recentQueueErrors30d: 0,
            cronHourlyBaseline24h: 0,
            queueHourlyBaseline24h: 0,
            cronDailyBaseline7d: 0,
            queueDailyBaseline7d: 0,
            cronSpike: false,
            queueSpike: false,
            cronAlertLevel: 'ok',
            queueAlertLevel: 'ok',
            queueProvider: 'http',
            redisConfigured: false,
            alertDestinationsConfigured: 0,
            alertDestinationLabels: [],
        });
    });
});

describe('admin.service getAdminStatsData', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('loads admin stats through repository boundaries', async () => {
        mockQuoteCountAll.mockResolvedValue(12);
        mockQuoteFindAll.mockResolvedValue([{ id: 'q_1' }]);
        mockSumReportTokensUsed.mockResolvedValue({ _sum: { tokensUsed: 4500 } });
        mockSubscriptionCountActive.mockResolvedValue(4);

        const result = await getAdminStatsData();

        expect(mockQuoteCountAll).toHaveBeenCalledTimes(1);
        expect(mockQuoteFindAll).toHaveBeenCalledTimes(1);
        expect(mockSumReportTokensUsed).toHaveBeenCalledTimes(1);
        expect(mockSubscriptionCountActive).toHaveBeenCalledTimes(1);
        expect(result).toEqual({
            totalQuotes: 12,
            quotes: [{ id: 'q_1' }],
            reportAgg: { _sum: { tokensUsed: 4500 } },
            activeSubscriptions: 4,
        });
    });
});

describe('admin.service getAdminBusinessReadinessData', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('builds business readiness metrics from funnel and operating signals', async () => {
        mockGetFunnelSummary.mockResolvedValue([
            { day: '2026-04-09', signup: 10, scan: 7, pay: 4, retain: 2 },
            { day: '2026-04-10', signup: 8, scan: 5, pay: 3, retain: 1 },
        ]);
        mockCountLeads.mockResolvedValue(42);
        mockCountScansSince.mockResolvedValue(21);
        mockCountCapturedPaymentsSince.mockResolvedValue(11);
        mockSubscriptionCountActive.mockResolvedValue(6);

        const result = await getAdminBusinessReadinessData(30);

        expect(mockGetFunnelSummary).toHaveBeenCalledWith(30);
        expect(mockCountLeads).toHaveBeenCalledTimes(1);
        expect(mockCountScansSince).toHaveBeenCalledWith(expect.any(Date));
        expect(mockCountCapturedPaymentsSince).toHaveBeenCalledWith(expect.any(Date));
        expect(result).toMatchObject({
            days: 30,
            totals: {
                signup: 18,
                scan: 12,
                pay: 7,
                retain: 3,
            },
            conversion: {
                signupToScan: 0.6667,
                scanToPay: 0.5833,
                payToRetain: 0.4286,
            },
            supporting: {
                totalLeads: 42,
                scansInWindow: 21,
                capturedPaymentsInWindow: 11,
                activeSubscriptions: 6,
            },
        });
        expect(typeof result.generatedAt).toBe('string');
    });

    it('clamps days and returns zero conversion when no funnel activity exists', async () => {
        mockGetFunnelSummary.mockResolvedValue([]);
        mockCountLeads.mockResolvedValue(0);
        mockCountScansSince.mockResolvedValue(0);
        mockCountCapturedPaymentsSince.mockResolvedValue(0);
        mockSubscriptionCountActive.mockResolvedValue(0);

        const result = await getAdminBusinessReadinessData(365);

        expect(mockGetFunnelSummary).toHaveBeenCalledWith(90);
        expect(result).toMatchObject({
            days: 90,
            totals: {
                signup: 0,
                scan: 0,
                pay: 0,
                retain: 0,
            },
            conversion: {
                signupToScan: 0,
                scanToPay: 0,
                payToRetain: 0,
            },
            supporting: {
                totalLeads: 0,
                scansInWindow: 0,
                capturedPaymentsInWindow: 0,
                activeSubscriptions: 0,
            },
        });
    });
});
