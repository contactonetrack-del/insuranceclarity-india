'use client'

import { motion } from 'framer-motion'
import { Activity, Cpu, CreditCard, TrendingUp, Users } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import type { AdminDashboardStats } from '@/types/app.types'

interface KpiCardProps {
    icon: React.ReactNode
    label: string
    value: string
    valueClass?: string
    color: string
    badge: string
    badgeColor: string
    delay: number
}

function KpiCard({
    icon, label, value, valueClass, color, badge, badgeColor, delay,
}: KpiCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="glass rounded-3xl border border-white/20 p-6 dark:border-white/10"
        >
            <div className="mb-4 flex items-start justify-between">
                <div>
                    <p className="mb-1 text-sm font-medium text-theme-muted">{label}</p>
                    <h3 className={`text-3xl font-black ${valueClass ?? 'text-theme-primary'}`}>{value}</h3>
                </div>
                <div className={`rounded-2xl p-3 ${color}`}>{icon}</div>
            </div>
            <div className={`flex items-center gap-1 text-[10px] font-semibold ${badgeColor}`}>
                <Activity className="h-3 w-3" /> {badge}
            </div>
        </motion.div>
    )
}

export function AdminKpiGrid({ stats }: { stats: AdminDashboardStats }) {
    const t = useTranslations('adminDashboard.kpis')
    const locale = useLocale()

    const kpis = [
        {
            icon: <Users className="h-6 w-6 text-accent" />,
            label: t('grossLeads.label'),
            value: stats.totalQuotes.toLocaleString(locale),
            color: 'bg-accent/10',
            badge: t('grossLeads.badge'),
            badgeColor: 'text-accent',
            delay: 0.1,
        },
        {
            icon: <TrendingUp className="h-6 w-6 text-success-500" />,
            label: t('pipeline.label'),
            value: t('pipeline.value', { value: stats.totalPremium.toLocaleString(locale) }),
            valueClass: 'text-success-500',
            color: 'bg-success-50',
            badge: t('pipeline.badge'),
            badgeColor: 'text-success-500',
            delay: 0.15,
        },
        {
            icon: <CreditCard className="h-6 w-6 text-info-500" />,
            label: t('paidSubscriptions.label'),
            value: (stats.activeSubscriptions ?? 0).toString(),
            color: 'bg-info-500/10',
            badge: t('paidSubscriptions.badge'),
            badgeColor: 'text-info-500',
            delay: 0.2,
        },
        {
            icon: <Cpu className="h-6 w-6 text-warning-500" />,
            label: t('aiCompute.label'),
            value: stats.totalTokens ? `${(stats.totalTokens / 1000).toFixed(1)}k` : t('aiCompute.zero'),
            color: 'bg-warning-500/10',
            badge: t('aiCompute.badge', { cost: (stats.estimatedAiCost ?? 0).toFixed(2) }),
            badgeColor: 'text-warning-500',
            delay: 0.25,
        },
    ]

    return (
        <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((kpi, i) => (
                <KpiCard key={i} {...kpi} />
            ))}
        </div>
    )
}
