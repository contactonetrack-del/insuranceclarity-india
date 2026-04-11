'use client'

import { motion } from 'framer-motion'
import { Activity, Cpu, Info, Zap } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import type { AdminDashboardStats } from '@/types/app.types'

export function AiTelemetry({ stats }: { stats: AdminDashboardStats }) {
    const t = useTranslations('adminDashboard.aiTelemetry')
    const locale = useLocale()
    const totalTokens = stats.totalTokens ?? 0
    const estCost = stats.estimatedAiCost ?? 0

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl border border-white/20 dark:border-white/10 p-6 mb-10"
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-500/10 rounded-2xl">
                        <Cpu className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">{t('title')}</h3>
                        <p className="text-xs text-theme-muted">{t('subtitle')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-success-500 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-success-500">{t('healthNominal')}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-theme-muted">
                        <span>{t('totalInferenceLoad')}</span>
                        <Zap className="w-3 h-3" />
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '75%' }}
                            className="h-full bg-orange-500"
                        />
                    </div>
                    <p className="text-[10px] text-theme-muted flex items-center gap-1">
                        <Info className="w-2.5 h-2.5" /> {t('utilizationWithinQuota')}
                    </p>
                </div>

                <div className="space-y-1">
                    <p className="text-xs font-semibold text-theme-muted">{t('aggregateTokenCount')}</p>
                    <p className="text-2xl font-black text-theme-primary">
                        {totalTokens.toLocaleString(locale)} <span className="text-xs font-medium text-theme-muted">{t('tokensSuffix')}</span>
                    </p>
                </div>

                <div className="space-y-1">
                    <p className="text-xs font-semibold text-theme-muted">{t('blendedOpex')}</p>
                    <p className="text-2xl font-black text-theme-primary">
                        ${estCost.toFixed(4)} <span className="text-xs font-medium text-theme-muted">{t('usdSuffix')}</span>
                    </p>
                </div>
            </div>

            <div className="mt-6 pt-6 border-t border-default flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-theme-muted">
                        <Activity className="w-3 h-3 text-orange-500" /> {t('latency')}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-theme-muted">
                        <Activity className="w-3 h-3 text-success-500" /> {t('successRate')}
                    </div>
                </div>
                <button className="text-[10px] font-bold text-accent hover:underline uppercase tracking-wider">
                    {t('viewFullLogs')}
                </button>
            </div>
        </motion.div>
    )
}
