import { getQueueProvider } from '@/lib/queue/config';
import { getFunnelSummary } from '@/lib/analytics/funnel';
import { redisClient } from '@/lib/cache/redis';
import { leadRepository } from '@/repositories/lead.repository';
import { opsRepository } from '@/repositories/ops.repository';
import { quoteRepository } from '@/repositories/quote.repository';
import { subscriptionRepository } from '@/repositories/subscription.repository';
import type { JobHealthAlertLevel, LeadStatus } from '@/types/app.types';
import {
    countCapturedPaymentsSince,
    countErrorLogs,
    countLeads,
    countPendingPaymentsForReconciliation,
    countScansSince,
    countStaleCreatedPayments,
    countStaleScans,
} from '@/services/ops.service';

export async function getAdminStatsData() {
    const [totalQuotes, quotes, reportAgg, activeSubscriptions] = await Promise.all([
        quoteRepository.countAll(),
        quoteRepository.findAll(),
        opsRepository.sumReportTokensUsed(),
        subscriptionRepository.countActive(),
    ]);

    return { totalQuotes, quotes, reportAgg, activeSubscriptions };
}

export async function getRecentLeads(limit = 100) {
    return leadRepository.findRecent(limit);
}

export async function setLeadStatus(leadId: string, status: LeadStatus) {
    return leadRepository.updateStatus(leadId, status);
}

export async function getAdminJobHealthData() {
    const now = Date.now();
    const oneHourAgo = new Date(now - 60 * 60 * 1000);
    const thirtyMinutesAgo = new Date(now - 30 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const fiveMinutesAgo = new Date(now - 5 * 60 * 1000);

    const [
        pendingPaymentReconciliation,
        staleCreatedPayments,
        staleScans,
        deadLetterJobs,
        recentCronErrors1h,
        recentCronErrors24h,
        recentCronErrors7d,
        recentCronErrors30d,
        recentQueueErrors1h,
        recentQueueErrors24h,
        recentQueueErrors7d,
        recentQueueErrors30d,
    ] = await Promise.all([
        countPendingPaymentsForReconciliation(thirtyMinutesAgo),
        countStaleCreatedPayments(twentyFourHoursAgo),
        countStaleScans(fiveMinutesAgo),
        redisClient.isConfigured()
            ? redisClient.keys('queue:dead-letter:*').then((keys) => keys.length)
            : Promise.resolve(0),
        countErrorLogs({
            route: { startsWith: '/api/cron/' },
            severity: { in: ['HIGH', 'CRITICAL'] },
            timestamp: { gte: oneHourAgo },
        }),
        countErrorLogs({
            route: { startsWith: '/api/cron/' },
            severity: { in: ['HIGH', 'CRITICAL'] },
            timestamp: { gte: twentyFourHoursAgo },
        }),
        countErrorLogs({
            route: { startsWith: '/api/cron/' },
            severity: { in: ['HIGH', 'CRITICAL'] },
            timestamp: { gte: sevenDaysAgo },
        }),
        countErrorLogs({
            route: { startsWith: '/api/cron/' },
            severity: { in: ['HIGH', 'CRITICAL'] },
            timestamp: { gte: thirtyDaysAgo },
        }),
        countErrorLogs({
            route: { startsWith: '/api/jobs/' },
            severity: { in: ['HIGH', 'CRITICAL'] },
            timestamp: { gte: oneHourAgo },
        }),
        countErrorLogs({
            route: { startsWith: '/api/jobs/' },
            severity: { in: ['HIGH', 'CRITICAL'] },
            timestamp: { gte: twentyFourHoursAgo },
        }),
        countErrorLogs({
            route: { startsWith: '/api/jobs/' },
            severity: { in: ['HIGH', 'CRITICAL'] },
            timestamp: { gte: sevenDaysAgo },
        }),
        countErrorLogs({
            route: { startsWith: '/api/jobs/' },
            severity: { in: ['HIGH', 'CRITICAL'] },
            timestamp: { gte: thirtyDaysAgo },
        }),
    ]);

    const alertDestinationLabels = [
        process.env.DISCORD_WEBHOOK_URL?.trim() ? 'Discord' : null,
        process.env.SLACK_WEBHOOK_URL?.trim() ? 'Slack' : null,
    ].filter((value): value is string => Boolean(value));

    const cronHourlyBaseline24h = Number((recentCronErrors24h / 24).toFixed(2));
    const queueHourlyBaseline24h = Number((recentQueueErrors24h / 24).toFixed(2));
    const cronDailyBaseline7d = Number((recentCronErrors7d / 7).toFixed(2));
    const queueDailyBaseline7d = Number((recentQueueErrors7d / 7).toFixed(2));
    const cronSpike =
        recentCronErrors1h >= 3 &&
        recentCronErrors1h >= Math.max(1, Math.ceil(cronHourlyBaseline24h * 2));
    const queueSpike =
        recentQueueErrors1h >= 3 &&
        recentQueueErrors1h >= Math.max(1, Math.ceil(queueHourlyBaseline24h * 2));
    const cronAlertLevel: JobHealthAlertLevel =
        recentCronErrors1h >= 6 || recentCronErrors24h >= 24
            ? 'critical'
            : cronSpike || recentCronErrors1h > 0
              ? 'warning'
              : 'ok';
    const queueAlertLevel: JobHealthAlertLevel =
        deadLetterJobs >= 10 || recentQueueErrors1h >= 6 || recentQueueErrors24h >= 24
            ? 'critical'
            : queueSpike || deadLetterJobs > 0 || recentQueueErrors1h > 0
              ? 'warning'
              : 'ok';

    return {
        pendingPaymentReconciliation,
        staleCreatedPayments,
        staleScans,
        deadLetterJobs,
        recentCronErrors1h,
        recentCronErrors24h,
        recentCronErrors7d,
        recentCronErrors30d,
        recentQueueErrors1h,
        recentQueueErrors24h,
        recentQueueErrors7d,
        recentQueueErrors30d,
        cronHourlyBaseline24h,
        queueHourlyBaseline24h,
        cronDailyBaseline7d,
        queueDailyBaseline7d,
        cronSpike,
        queueSpike,
        cronAlertLevel,
        queueAlertLevel,
        queueProvider: getQueueProvider(),
        redisConfigured: redisClient.isConfigured(),
        alertDestinationsConfigured: alertDestinationLabels.length,
        alertDestinationLabels,
        generatedAt: new Date(now).toISOString(),
    };
}

export async function getAdminBusinessReadinessData(days = 30) {
    const clampedDays = Math.max(1, Math.min(90, days));
    const since = new Date(Date.now() - clampedDays * 24 * 60 * 60 * 1000);

    const [timeline, totalLeads, scansInWindow, capturedPaymentsInWindow, activeSubscriptions] = await Promise.all([
        getFunnelSummary(clampedDays),
        countLeads(),
        countScansSince(since),
        countCapturedPaymentsSince(since),
        subscriptionRepository.countActive(),
    ]);

    const totals = timeline.reduce(
        (acc, row) => {
            acc.signup += row.signup;
            acc.scan += row.scan;
            acc.pay += row.pay;
            acc.retain += row.retain;
            return acc;
        },
        { signup: 0, scan: 0, pay: 0, retain: 0 },
    );

    return {
        days: clampedDays,
        totals,
        conversion: {
            signupToScan: totals.signup > 0 ? Number((totals.scan / totals.signup).toFixed(4)) : 0,
            scanToPay: totals.scan > 0 ? Number((totals.pay / totals.scan).toFixed(4)) : 0,
            payToRetain: totals.pay > 0 ? Number((totals.retain / totals.pay).toFixed(4)) : 0,
        },
        supporting: {
            totalLeads,
            scansInWindow,
            capturedPaymentsInWindow,
            activeSubscriptions,
        },
        generatedAt: new Date().toISOString(),
    };
}
