'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Loader2, Users } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { updateLeadStatus } from '@/app/actions/admin-actions'
import type { Lead, LeadStatus } from '@/types/app.types'

const LEAD_STATUS_OPTIONS: LeadStatus[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'CLOSED', 'LOST']

export function AdminLeadsTable({ leads, onStatusChange }: { leads: Lead[]; onStatusChange: () => void }) {
    const t = useTranslations('adminDashboard.leads')
    const locale = useLocale()
    const [updating, setUpdating] = useState<string | null>(null)
    const headers = ['name', 'contactInfo', 'policyType', 'source', 'acquired', 'status'] as const

    const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
        setUpdating(leadId)
        await updateLeadStatus(leadId, newStatus)
        onStatusChange()
        setUpdating(null)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl border border-white/20 dark:border-white/10 overflow-hidden"
        >
            <div className="p-6 border-b border-default bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2">
                    <Users className="w-4 h-4 text-theme-secondary" /> {t('title')}
                    <span className="ml-2 text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-bold">{leads.length}</span>
                </h3>
                <a
                    href="/api/admin/leads/export"
                    download="leads-export.csv"
                    className="flex items-center gap-2 text-[10px] font-bold bg-white dark:bg-slate-800 border border-default px-3 py-1.5 rounded-lg hover:border-accent hover:text-accent transition-colors shadow-sm uppercase tracking-widest"
                >
                    <FileText className="w-3 h-3" /> {t('exportCsv')}
                </a>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-default">
                            {headers.map((headerKey) => (
                                <th key={headerKey} className="py-4 px-6 text-[10px] font-bold text-theme-muted uppercase tracking-widest">
                                    {t(`headers.${headerKey}`)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {leads.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-theme-muted text-sm">
                                    {t('empty')}
                                </td>
                            </tr>
                        ) : (
                            leads.map((lead) => (
                                <tr key={lead.id} className="border-b border-default hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="py-4 px-6">
                                        <p className="text-sm font-bold text-theme-primary">{lead.name}</p>
                                    </td>
                                    <td className="py-4 px-6">
                                        <p className="text-[11px] text-theme-muted font-medium">{lead.email}</p>
                                        <p className="text-[11px] text-theme-muted font-medium">{lead.phone}</p>
                                    </td>
                                    <td className="py-4 px-6 text-xs font-semibold capitalize text-theme-secondary">{lead.insuranceType}</td>
                                    <td className="py-4 px-6">
                                        <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md font-bold uppercase tracking-wider text-theme-muted border border-default">
                                            {lead.source}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-xs text-theme-muted whitespace-nowrap font-medium">
                                        {new Date(lead.createdAt).toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="py-4 px-6">
                                        {updating === lead.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin text-accent" />
                                        ) : (
                                            <select
                                                value={lead.status}
                                                onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                                                aria-label={t('statusAria', { name: lead.name })}
                                                className="text-[11px] bg-white dark:bg-slate-900 border border-default rounded-lg px-2 py-1.5 font-bold cursor-pointer focus:outline-none focus:border-accent transition-all hover:border-theme-secondary"
                                            >
                                                {LEAD_STATUS_OPTIONS.map((s) => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        )}
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
