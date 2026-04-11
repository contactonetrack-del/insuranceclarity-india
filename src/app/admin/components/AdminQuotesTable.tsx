'use client'

import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import type { QuoteRecord } from '@/types/app.types'

export function AdminQuotesTable({ quotes }: { quotes: QuoteRecord[] }) {
    const t = useTranslations('adminDashboard.quotes')
    const locale = useLocale()
    const headers = ['quoteId', 'created', 'type', 'coverage', 'premium', 'status'] as const

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass overflow-hidden rounded-3xl border border-white/20 dark:border-white/10"
        >
            <div className="border-b border-default bg-slate-50/50 p-6 dark:bg-slate-800/50">
                <h3 className="flex items-center gap-2 font-bold">
                    <FileText className="h-4 w-4 text-theme-secondary" /> {t('title')}
                </h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b border-default">
                            {headers.map((headerKey) => (
                                <th key={headerKey} className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-theme-muted last:text-center">
                                    {t(`headers.${headerKey}`)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {quotes.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-sm text-theme-muted">
                                    {t('empty')}
                                </td>
                            </tr>
                        ) : (
                            quotes.map((quote) => (
                                <tr key={quote.id} className="border-b border-default transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                    <td className="px-6 py-4 font-mono text-[10px] font-medium text-slate-500">
                                        {quote.id.split('-')[0]}...
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-xs">
                                        {new Date(quote.createdAt).toLocaleDateString(locale)}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium capitalize">{quote.insuranceType}</td>
                                    <td className="px-6 py-4 text-right text-sm font-medium">
                                        {t('currencyValue', { value: (quote.coverageAmount ?? 0).toLocaleString(locale) })}
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm font-bold text-success-500">
                                        {t('currencyValue', { value: (quote.premiumAmount ?? 0).toLocaleString(locale) })}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <StatusBadge status={quote.status} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </motion.div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        READY: 'border border-success-500/20 bg-success-50 text-success-500',
        PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        FAILED: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    }

    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${styles[status] ?? styles.PENDING}`}>
            {status}
        </span>
    )
}
