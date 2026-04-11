/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import type { HTMLAttributes, ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { AdminJobHealthCard } from './AdminJobHealthCard'

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string, values?: Record<string, string | number>) => {
        const messages: Record<string, string> = {
            aria: 'Localized background jobs health',
            title: 'Localized Background Jobs Health',
            subtitle: 'Localized queue and cron subtitle',
            'status.healthy': 'Localized Healthy',
            'status.attention': 'Localized Needs Attention',
            'metrics.pendingPaymentReconciliation': 'Localized Pending Reconciliation',
            'metrics.staleCreatedPayments': 'Localized Stale Created',
            'metrics.staleScans': 'Localized Stale Scans',
            'metrics.deadLetterJobs': 'Localized Dead Letters',
            'metrics.recentCronErrors1h': 'Localized Cron 1h',
            'metrics.recentCronErrors24h': 'Localized Cron 24h',
            'metrics.recentCronErrors7d': 'Localized Cron 7d',
            'metrics.recentCronErrors30d': 'Localized Cron 30d',
            'metrics.recentQueueErrors1h': 'Localized Queue 1h',
            'metrics.recentQueueErrors24h': 'Localized Queue 24h',
            'metrics.recentQueueErrors7d': 'Localized Queue 7d',
            'metrics.recentQueueErrors30d': 'Localized Queue 30d',
            'trend.title': 'Localized Error Trend Signals',
            'trend.cron': 'Localized Cron Rate',
            'trend.queue': 'Localized Queue Rate',
            'trend.currentVsBaseline': `Localized ${values?.current}/h vs ${values?.baseline}/h`,
            'trend.last24hVs7d': `Localized ${values?.current}/24h vs ${values?.baseline}/day`,
            'trend.level.ok': 'Localized OK',
            'trend.level.warning': 'Localized Watch',
            'trend.level.critical': 'Localized Critical',
            'trend.spikeAlert': 'Localized spike alert',
            redisConfigured: 'Localized Redis configured',
            redisNotConfigured: 'Localized Redis not configured',
            footer: `Localized footer ${values?.queueProvider} ${values?.redis}`,
            alertsFooter: `Localized alerts ${values?.alerts}`,
            alertsConfigured: `Localized ${values?.count} ${values?.channels}`,
            alertsNotConfigured: 'Localized alerts not configured',
        }

        return messages[key] ?? key
    },
}))

vi.mock('framer-motion', () => ({
    motion: {
        section: ({ children, ...props }: HTMLAttributes<HTMLElement> & { children: ReactNode }) => <section {...props}>{children}</section>,
    },
}))

describe('AdminJobHealthCard', () => {
    it('renders translated 1h, 24h, and 7d operational metrics', () => {
        render(
            <AdminJobHealthCard
                health={{
                    pendingPaymentReconciliation: 2,
                    staleCreatedPayments: 1,
                    staleScans: 0,
                    deadLetterJobs: 3,
                    recentCronErrors1h: 4,
                    recentCronErrors24h: 8,
                    recentCronErrors7d: 20,
                    recentCronErrors30d: 55,
                    recentQueueErrors1h: 2,
                    recentQueueErrors24h: 5,
                    recentQueueErrors7d: 12,
                    recentQueueErrors30d: 34,
                    cronHourlyBaseline24h: 0.33,
                    queueHourlyBaseline24h: 0.21,
                    cronDailyBaseline7d: 2.86,
                    queueDailyBaseline7d: 1.71,
                    cronSpike: true,
                    queueSpike: false,
                    cronAlertLevel: 'critical',
                    queueAlertLevel: 'warning',
                    queueProvider: 'qstash',
                    redisConfigured: true,
                    alertDestinationsConfigured: 2,
                    alertDestinationLabels: ['Discord', 'Slack'],
                    generatedAt: '2026-04-12T10:00:00.000Z',
                }}
            />,
        )

        expect(screen.getByLabelText('Localized background jobs health')).toBeInTheDocument()
        expect(screen.getByText('Localized Background Jobs Health')).toBeInTheDocument()
        expect(screen.getByText('Localized Needs Attention')).toBeInTheDocument()
        expect(screen.getByText('Localized Cron 7d')).toBeInTheDocument()
        expect(screen.getByText('Localized Cron 30d')).toBeInTheDocument()
        expect(screen.getByText('Localized Queue 7d')).toBeInTheDocument()
        expect(screen.getByText('Localized Queue 30d')).toBeInTheDocument()
        expect(screen.getByText('Localized Error Trend Signals')).toBeInTheDocument()
        expect(screen.getByText('Localized 4/h vs 0.33/h')).toBeInTheDocument()
        expect(screen.getByText('Localized 8/24h vs 2.86/day')).toBeInTheDocument()
        expect(screen.getByText('Localized spike alert')).toBeInTheDocument()
        expect(screen.getByText('Localized footer qstash Localized Redis configured')).toBeInTheDocument()
        expect(screen.getByText('Localized alerts Localized 2 Discord, Slack')).toBeInTheDocument()
    })

    it('renders healthy state without spike or configured alerts', () => {
        render(
            <AdminJobHealthCard
                health={{
                    pendingPaymentReconciliation: 0,
                    staleCreatedPayments: 0,
                    staleScans: 0,
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
                    generatedAt: '2026-04-12T10:30:00.000Z',
                }}
            />,
        )

        expect(screen.getByText('Localized Healthy')).toBeInTheDocument()
        expect(screen.queryByText('Localized spike alert')).not.toBeInTheDocument()
        expect(screen.getByText('Localized footer http Localized Redis not configured')).toBeInTheDocument()
        expect(screen.getByText('Localized alerts Localized alerts not configured')).toBeInTheDocument()
        expect(screen.getAllByText('Localized OK')).toHaveLength(2)
    })
})
