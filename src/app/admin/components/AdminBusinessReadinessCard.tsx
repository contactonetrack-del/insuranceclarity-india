'use client'

import { motion } from 'framer-motion'
import { BarChart3, CreditCard, ScanSearch, TrendingUp, UserPlus, Users } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import type { AdminBusinessReadiness } from '@/types/app.types'

interface AdminBusinessReadinessCardProps {
    readiness: AdminBusinessReadiness
}

function percent(value: number) {
    return `${(value * 100).toFixed(1)}%`
}

export function AdminBusinessReadinessCard({ readiness }: AdminBusinessReadinessCardProps) {
    const t = useTranslations('adminDashboard.businessReadiness')
    const locale = useLocale()

    const funnelMetrics = [
        {
            key: 'signup',
            label: t('funnel.signup'),
            value: readiness.totals.signup,
            icon: <UserPlus className="h-4 w-4 text-accent" />,
            tone: 'bg-accent/10 text-accent',
        },
        {
            key: 'scan',
            label: t('funnel.scan'),
            value: readiness.totals.scan,
            icon: <ScanSearch className="h-4 w-4 text-info-500" />,
            tone: 'bg-info-500/10 text-info-500',
        },
        {
            key: 'pay',
            label: t('funnel.pay'),
            value: readiness.totals.pay,
            icon: <CreditCard className="h-4 w-4 text-success-500" />,
            tone: 'bg-success-50 text-success-500',
        },
        {
            key: 'retain',
            label: t('funnel.retain'),
            value: readiness.totals.retain,
            icon: <Users className="h-4 w-4 text-warning-500" />,
            tone: 'bg-warning-500/10 text-warning-500',
        },
    ] as const

    const conversionMetrics = [
        {
            key: 'signupToScan',
            label: t('conversion.signupToScan'),
            value: readiness.conversion.signupToScan,
        },
        {
            key: 'scanToPay',
            label: t('conversion.scanToPay'),
            value: readiness.conversion.scanToPay,
        },
        {
            key: 'payToRetain',
            label: t('conversion.payToRetain'),
            value: readiness.conversion.payToRetain,
        },
    ] as const

    const supportingMetrics = [
        {
            key: 'totalLeads',
            label: t('supporting.totalLeads'),
            value: readiness.supporting.totalLeads,
        },
        {
            key: 'scansInWindow',
            label: t('supporting.scansInWindow', { days: readiness.days }),
            value: readiness.supporting.scansInWindow,
        },
        {
            key: 'capturedPaymentsInWindow',
            label: t('supporting.capturedPaymentsInWindow', { days: readiness.days }),
            value: readiness.supporting.capturedPaymentsInWindow,
        },
        {
            key: 'activeSubscriptions',
            label: t('supporting.activeSubscriptions'),
            value: readiness.supporting.activeSubscriptions,
        },
    ] as const

    return (
        <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl border border-white/20 p-6 dark:border-white/10"
            aria-label={t('aria')}
        >
            <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-success-500/20 bg-success-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-success-500">
                        <TrendingUp className="h-3.5 w-3.5" />
                        {t('badge')}
                    </div>
                    <h3 className="text-lg font-bold text-theme-primary">{t('title')}</h3>
                    <p className="text-xs text-theme-muted">{t('subtitle', { days: readiness.days })}</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-2xl border border-default bg-white/50 px-3 py-2 text-xs font-semibold text-theme-secondary dark:bg-slate-900/30">
                    <BarChart3 className="h-4 w-4 text-accent" />
                    {t('generatedAt')}
                    <span className="text-theme-primary">
                        {new Date(readiness.generatedAt).toLocaleString(locale)}
                    </span>
                </div>
            </header>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {funnelMetrics.map((metric) => (
                    <div key={metric.key} className="rounded-2xl border border-default bg-white/50 p-4 dark:bg-slate-900/30">
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-[11px] font-semibold uppercase tracking-wide text-theme-secondary">
                                {metric.label}
                            </span>
                            <span className={`rounded-xl p-2 ${metric.tone}`}>
                                {metric.icon}
                            </span>
                        </div>
                        <p className="text-2xl font-black text-theme-primary">
                            {metric.value.toLocaleString(locale)}
                        </p>
                    </div>
                ))}
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
                <div className="rounded-2xl border border-default bg-white/50 p-4 dark:bg-slate-900/30">
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-theme-secondary">
                        {t('conversion.title')}
                    </p>
                    <div className="grid gap-3 sm:grid-cols-3">
                        {conversionMetrics.map((metric) => (
                            <div key={metric.key} className="rounded-2xl border border-default bg-theme-bg px-3 py-4">
                                <p className="mb-1 text-[11px] font-semibold text-theme-secondary">{metric.label}</p>
                                <p className="text-xl font-black text-theme-primary">{percent(metric.value)}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl border border-default bg-white/50 p-4 dark:bg-slate-900/30">
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-theme-secondary">
                        {t('supporting.title')}
                    </p>
                    <div className="space-y-3">
                        {supportingMetrics.map((metric) => (
                            <div key={metric.key} className="flex items-center justify-between gap-3 rounded-2xl border border-default bg-theme-bg px-3 py-2.5">
                                <span className="text-xs font-medium text-theme-secondary">{metric.label}</span>
                                <span className="text-sm font-bold text-theme-primary">
                                    {metric.value.toLocaleString(locale)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.section>
    )
}
