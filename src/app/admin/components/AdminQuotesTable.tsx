'use client';

import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import type { QuoteRecord } from '@/types/app.types';

export function AdminQuotesTable({ quotes }: { quotes: QuoteRecord[] }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-3xl border border-white/20 dark:border-white/10 overflow-hidden"
        >
            <div className="p-6 border-b border-default bg-slate-50/50 dark:bg-slate-800/50">
                <h3 className="font-bold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-theme-secondary" /> Recent Policy Applications
                </h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-default">
                            {['Quote ID', 'Created', 'Type', 'Coverage', 'Premium', 'Status'].map((h) => (
                                <th key={h} className="py-4 px-6 text-[10px] font-bold text-theme-muted uppercase tracking-widest last:text-center">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {quotes.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-theme-muted text-sm">
                                    No quotes generated yet.
                                </td>
                            </tr>
                        ) : (
                            quotes.map((quote) => (
                                <tr key={quote.id} className="border-b border-default hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="py-4 px-6 font-mono text-[10px] font-medium text-slate-500">{quote.id.split('-')[0]}…</td>
                                    <td className="py-4 px-6 text-xs whitespace-nowrap">{new Date(quote.createdAt).toLocaleDateString('en-IN')}</td>
                                    <td className="py-4 px-6 text-sm font-medium capitalize">{quote.insuranceType}</td>
                                    <td className="py-4 px-6 text-sm text-right font-medium">₹{(quote.coverageAmount ?? 0).toLocaleString('en-IN')}</td>
                                    <td className="py-4 px-6 text-sm text-right font-bold text-emerald-600 dark:text-emerald-400">₹{(quote.premiumAmount ?? 0).toLocaleString('en-IN')}</td>
                                    <td className="py-4 px-6 text-center">
                                        <StatusBadge status={quote.status} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        READY:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        FAILED:  'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase ${styles[status] ?? styles.PENDING}`}>
            {status}
        </span>
    );
}
