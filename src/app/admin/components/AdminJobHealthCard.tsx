'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Clock3, Database, Layers3, Server } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { AdminJobHealth } from '@/types/app.types'

interface AdminJobHealthCardProps {
    health: AdminJobHealth
}

function getBadgeTone(isHealthy: boolean) {
    if (isHealthy) {
        return {
            container: 'bg-success-50 text-success-500 border-success-500/20',
            icon: <CheckCircle2 className="h-4 w-4" />,
        }
    }

    return {
        container: 'bg-warning-500/10 text-warning-500 border-warning-500/20',
        icon: <AlertTriangle className="h-4 w-4" />,
    }
}

function getTrendFillWidth(currentHourly: number, baselineHourly: number) {
    const baseline = Math.max(1, baselineHourly);
    const ratio = currentHourly / baseline;
    return Math.max(8, Math.min(100, Math.round(ratio * 40)));
}

function getAlertLevelTone(level: AdminJobHealth['cronAlertLevel']) {
    switch (level) {
        case 'critical':
            return 'bg-danger-500/15 text-danger-500 border-danger-500/30';
        case 'warning':
            return 'bg-warning-500/15 text-warning-500 border-warning-500/30';
        default:
            return 'bg-success-50 text-success-500 border-success-500/20';
    }
}

export function AdminJobHealthCard({ health }: AdminJobHealthCardProps) {
    const t = useTranslations('adminDashboard.jobHealth')

    const isHealthy =
        health.pendingPaymentReconciliation === 0 &&
        health.staleCreatedPayments === 0 &&
        health.staleScans === 0 &&
        health.deadLetterJobs === 0 &&
        health.recentCronErrors1h === 0 &&
        health.recentCronErrors24h === 0 &&
        health.recentQueueErrors1h === 0 &&
        health.recentQueueErrors24h === 0 &&
        health.cronAlertLevel === 'ok' &&
        health.queueAlertLevel === 'ok' &&
        !health.cronSpike &&
        !health.queueSpike

    const badgeTone = getBadgeTone(isHealthy)

    const metrics = [
        {
            key: 'pendingPaymentReconciliation',
            icon: <Clock3 className="h-4 w-4 text-info-500" />,
            value: health.pendingPaymentReconciliation,
        },
        {
            key: 'staleCreatedPayments',
            icon: <Database className="h-4 w-4 text-danger-500" />,
            value: health.staleCreatedPayments,
        },
        {
            key: 'staleScans',
            icon: <Layers3 className="h-4 w-4 text-warning-500" />,
            value: health.staleScans,
        },
        {
            key: 'deadLetterJobs',
            icon: <Server className="h-4 w-4 text-accent" />,
            value: health.deadLetterJobs,
        },
        {
            key: 'recentCronErrors1h',
            icon: <AlertTriangle className="h-4 w-4 text-warning-500" />,
            value: health.recentCronErrors1h,
        },
        {
            key: 'recentCronErrors24h',
            icon: <AlertTriangle className="h-4 w-4 text-warning-500" />,
            value: health.recentCronErrors24h,
        },
        {
            key: 'recentCronErrors7d',
            icon: <AlertTriangle className="h-4 w-4 text-warning-500" />,
            value: health.recentCronErrors7d,
        },
        {
            key: 'recentCronErrors30d',
            icon: <AlertTriangle className="h-4 w-4 text-warning-500" />,
            value: health.recentCronErrors30d,
        },
        {
            key: 'recentQueueErrors1h',
            icon: <Server className="h-4 w-4 text-danger-500" />,
            value: health.recentQueueErrors1h,
        },
        {
            key: 'recentQueueErrors24h',
            icon: <Server className="h-4 w-4 text-danger-500" />,
            value: health.recentQueueErrors24h,
        },
        {
            key: 'recentQueueErrors7d',
            icon: <Server className="h-4 w-4 text-danger-500" />,
            value: health.recentQueueErrors7d,
        },
        {
            key: 'recentQueueErrors30d',
            icon: <Server className="h-4 w-4 text-danger-500" />,
            value: health.recentQueueErrors30d,
        },
    ] as const

    const alertsSummary =
        health.alertDestinationsConfigured > 0
            ? t('alertsConfigured', {
                count: health.alertDestinationsConfigured,
                channels: health.alertDestinationLabels.join(', '),
            })
            : t('alertsNotConfigured')

    return (
        <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass mb-6 rounded-3xl border border-white/20 p-6 dark:border-white/10"
            aria-label={t('aria')}
        >
            <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-bold text-theme-primary">{t('title')}</h3>
                    <p className="text-xs text-theme-muted">{t('subtitle')}</p>
                </div>
                <span
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${badgeTone.container}`}
                >
                    {badgeTone.icon}
                    {t(isHealthy ? 'status.healthy' : 'status.attention')}
                </span>
            </header>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {metrics.map((metric) => (
                    <div key={metric.key} className="rounded-2xl border border-default bg-white/50 p-3 dark:bg-slate-900/30">
                        <div className="mb-1.5 flex items-center gap-2">
                            {metric.icon}
                            <span className="text-[11px] font-semibold text-theme-secondary">
                                {t(`metrics.${metric.key}`)}
                            </span>
                        </div>
                        <p className="text-xl font-black text-theme-primary">{metric.value}</p>
                    </div>
                ))}
            </div>

            <div className="mt-4 rounded-2xl border border-default bg-white/50 p-3 dark:bg-slate-900/30">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-theme-secondary">
                    {t('trend.title')}
                </p>
                <div className="space-y-3">
                    <div>
                        <div className="mb-1 flex items-center justify-between text-[11px] text-theme-secondary">
                            <span>{t('trend.cron')}</span>
                            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${getAlertLevelTone(health.cronAlertLevel)}`}>
                                {t(`trend.level.${health.cronAlertLevel}`)}
                            </span>
                        </div>
                        <p className="mb-1.5 text-[10px] text-theme-muted">
                            {t('trend.currentVsBaseline', {
                                current: health.recentCronErrors1h,
                                baseline: health.cronHourlyBaseline24h,
                            })}
                        </p>
                        <p className="mb-1.5 text-[10px] text-theme-muted">
                            {t('trend.last24hVs7d', {
                                current: health.recentCronErrors24h,
                                baseline: health.cronDailyBaseline7d,
                            })}
                        </p>
                        <div className="h-2 rounded-full bg-theme-tertiary">
                            <div
                                className={`h-2 rounded-full ${health.cronSpike ? 'bg-warning-500' : 'bg-info-500'}`}
                                style={{ width: `${getTrendFillWidth(health.recentCronErrors1h, health.cronHourlyBaseline24h)}%` }}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="mb-1 flex items-center justify-between text-[11px] text-theme-secondary">
                            <span>{t('trend.queue')}</span>
                            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${getAlertLevelTone(health.queueAlertLevel)}`}>
                                {t(`trend.level.${health.queueAlertLevel}`)}
                            </span>
                        </div>
                        <p className="mb-1.5 text-[10px] text-theme-muted">
                            {t('trend.currentVsBaseline', {
                                current: health.recentQueueErrors1h,
                                baseline: health.queueHourlyBaseline24h,
                            })}
                        </p>
                        <p className="mb-1.5 text-[10px] text-theme-muted">
                            {t('trend.last24hVs7d', {
                                current: health.recentQueueErrors24h,
                                baseline: health.queueDailyBaseline7d,
                            })}
                        </p>
                        <div className="h-2 rounded-full bg-theme-tertiary">
                            <div
                                className={`h-2 rounded-full ${health.queueSpike ? 'bg-danger-500' : 'bg-info-500'}`}
                                style={{ width: `${getTrendFillWidth(health.recentQueueErrors1h, health.queueHourlyBaseline24h)}%` }}
                            />
                        </div>
                    </div>
                </div>
                {(health.cronSpike || health.queueSpike) && (
                    <p className="mt-3 text-[11px] font-medium text-warning-500">
                        {t('trend.spikeAlert')}
                    </p>
                )}
            </div>

            <div className="mt-4 space-y-1 text-[11px] text-theme-muted">
                <p>
                    {t('footer', {
                        queueProvider: health.queueProvider,
                        redis: health.redisConfigured ? t('redisConfigured') : t('redisNotConfigured'),
                    })}
                </p>
                <p>{t('alertsFooter', { alerts: alertsSummary })}</p>
            </div>
        </motion.section>
    )
}
