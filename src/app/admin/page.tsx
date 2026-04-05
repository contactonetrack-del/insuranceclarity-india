'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Shield, TrendingUp, Users, Activity, FileText, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { AnimatedHeading, GradientText } from '@/components/premium/text/animated-text';
import { getAdminDashboardStats, getAdminLeads, updateLeadStatus } from '../actions/admin-actions';
import { MagicButton } from '@/components/premium/buttons/magic-button';
import type { AdminDashboardStats, QuoteRecord, Lead, LeadStatus } from '@/types/app.types';

// ─── Admin Dashboard ─────────────────────────────────────────────────────────

export default function AdminDashboard() {
    const [loading, setLoading]   = useState(true);
    const [tab, setTab]           = useState<'overview' | 'leads'>('overview');
    const [stats, setStats]       = useState<AdminDashboardStats | null>(null);
    const [leads, setLeads]       = useState<Lead[]>([]);
    const [error, setError]       = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        const [statsResult, leadsResult] = await Promise.all([
            getAdminDashboardStats(),
            getAdminLeads(),
        ]);

        if ('error' in statsResult) {
            setError(statsResult.error);
        } else {
            setStats(statsResult);
        }

        if (Array.isArray(leadsResult)) {
            setLeads(leadsResult as Lead[]);
        }

        setLoading(false);
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ─── Error / Loading ───────────────────────────────────────────────────────
    if (loading) {
        return (
            <main className="min-h-screen bg-theme-bg flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-accent mx-auto mb-4" />
                    <p className="text-theme-muted text-sm">Loading dashboard…</p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen bg-theme-bg flex items-center justify-center p-4">
                <div className="text-center max-w-sm">
                    <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                    <h1 className="text-xl font-bold mb-2">Access Denied</h1>
                    <p className="text-theme-muted text-sm mb-6">{error}</p>
                    <MagicButton onClick={() => { window.location.href = '/'; }}>
                        Return Home
                    </MagicButton>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-theme-bg pt-28 pb-20 relative">
            <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent pointer-events-none" />

            <div className="container px-4 mx-auto max-w-6xl relative z-10">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <AnimatedHeading
                            text="Executive Dashboard"
                            as="h1"
                            className="text-3xl font-bold mb-2 tracking-tight"
                        />
                        <p className="text-theme-secondary flex items-center gap-2">
                            <Shield className="w-4 h-4 text-emerald-500" />
                            <GradientText>Live Telemetry</GradientText>
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Tab switcher */}
                        <div className="flex rounded-xl overflow-hidden border border-default">
                            {(['overview', 'leads'] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTab(t)}
                                    aria-pressed={tab === t ? "true" : "false"}
                                    className={`px-4 py-2 text-sm font-semibold capitalize transition-colors
                                        ${tab === t
                                            ? 'bg-accent text-white'
                                            : 'text-theme-muted hover:text-theme-primary'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                        <MagicButton variant="secondary" onClick={fetchData} loading={loading}>
                            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                        </MagicButton>
                    </div>
                </header>

                {tab === 'overview' && stats && <OverviewTab stats={stats} />}
                {tab === 'leads'    && <LeadsTab leads={leads} onStatusChange={fetchData} />}
            </div>
        </main>
    );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ stats }: { stats: AdminDashboardStats }) {
    return (
        <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <KpiCard
                    icon={<Users className="w-6 h-6 text-blue-500" />}
                    label="Total Generated Leads"
                    value={stats.totalQuotes.toLocaleString('en-IN')}
                    color="bg-blue-500/10"
                    badge="System Operational"
                    badgeColor="text-emerald-500"
                    delay={0.1}
                />
                <KpiCard
                    icon={<TrendingUp className="w-6 h-6 text-emerald-500" />}
                    label="ARR Pipeline Estimate"
                    value={`₹${stats.totalPremium.toLocaleString('en-IN')}`}
                    valueClass="text-transparent bg-clip-text bg-gradient-to-br from-emerald-600 to-teal-800 dark:from-emerald-400 dark:to-teal-200"
                    color="bg-emerald-500/10"
                    badge="Aggregate premium pipeline"
                    badgeColor="text-theme-muted"
                    delay={0.2}
                />
                <KpiCard
                    icon={<Shield className="w-6 h-6 text-purple-500" />}
                    label="Total Coverage Value"
                    value={
                        stats.totalCoverage > 10_000_000
                            ? `₹${(stats.totalCoverage / 10_000_000).toFixed(1)} Cr`
                            : `₹${stats.totalCoverage.toLocaleString('en-IN')}`
                    }
                    color="bg-purple-500/10"
                    badge="Underwritten risk pool valuation"
                    badgeColor="text-theme-muted"
                    delay={0.3}
                />
            </div>

            {/* Recent Quotes Table */}
            <QuotesTable quotes={stats.recentQuotes} />
        </>
    );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
    icon, label, value, valueClass, color, badge, badgeColor, delay,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    valueClass?: string;
    color: string;
    badge: string;
    badgeColor: string;
    delay: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="glass p-6 rounded-3xl border border-white/20 dark:border-white/10"
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-sm font-medium text-theme-muted mb-1">{label}</p>
                    <h3 className={`text-4xl font-black ${valueClass ?? ''}`}>{value}</h3>
                </div>
                <div className={`p-3 ${color} rounded-2xl`}>{icon}</div>
            </div>
            <div className={`text-xs font-semibold flex items-center gap-1 ${badgeColor}`}>
                <Activity className="w-3 h-3" /> {badge}
            </div>
        </motion.div>
    );
}

// ─── Quotes Table ─────────────────────────────────────────────────────────────

function QuotesTable({ quotes }: { quotes: QuoteRecord[] }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-3xl border border-white/20 dark:border-white/10 overflow-hidden"
        >
            <div className="p-6 border-b border-default bg-slate-50/50 dark:bg-slate-800/50">
                <h3 className="font-bold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-theme-secondary" /> Recent Applications
                </h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-default">
                            {['Quote ID', 'Created', 'Type', 'Coverage', 'Premium', 'Status'].map((h) => (
                                <th key={h} className="py-4 px-6 text-xs font-semibold text-theme-muted uppercase tracking-wider last:text-center">
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
                                    <td className="py-4 px-6 font-mono text-xs font-medium text-slate-500">{quote.id.split('-')[0]}…</td>
                                    <td className="py-4 px-6 text-sm whitespace-nowrap">{new Date(quote.createdAt).toLocaleDateString('en-IN')}</td>
                                    <td className="py-4 px-6 text-sm font-medium capitalize">{quote.insuranceType}</td>
                                    <td className="py-4 px-6 text-sm text-right font-medium">₹{(quote.coverageAmount ?? 0).toLocaleString('en-IN')}</td>
                                    <td className="py-4 px-6 text-sm text-right font-bold text-green-600 dark:text-green-400">₹{(quote.premiumAmount ?? 0).toLocaleString('en-IN')}</td>
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

// ─── Leads Tab ─────────────────────────────────────────────────────────────────

const LEAD_STATUS_OPTIONS: LeadStatus[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'CLOSED', 'LOST'];

function LeadsTab({ leads, onStatusChange }: { leads: Lead[]; onStatusChange: () => void }) {
    const [updating, setUpdating] = useState<string | null>(null);

    const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
        setUpdating(leadId);
        await updateLeadStatus(leadId, newStatus);
        onStatusChange();
        setUpdating(null);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl border border-white/20 dark:border-white/10 overflow-hidden"
        >
            <div className="p-6 border-b border-default bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2">
                    <Users className="w-4 h-4 text-theme-secondary" /> Lead Management
                    <span className="ml-2 text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full font-semibold">{leads.length}</span>
                </h3>
                <a
                    href="/api/admin/leads/export"
                    download="leads-export.csv"
                    className="flex items-center gap-2 text-xs font-semibold bg-white dark:bg-slate-800 border border-default px-3 py-1.5 rounded-lg hover:border-accent hover:text-accent transition-colors shadow-sm"
                >
                    <FileText className="w-3.5 h-3.5" /> Export CSV
                </a>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-default">
                            {['Name', 'Contact', 'Insurance', 'Source', 'Date', 'Status'].map((h) => (
                                <th key={h} className="py-4 px-6 text-xs font-semibold text-theme-muted uppercase tracking-wider">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {leads.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-theme-muted text-sm">
                                    No leads yet.
                                </td>
                            </tr>
                        ) : (
                            leads.map((lead) => (
                                <tr key={lead.id} className="border-b border-default hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="py-4 px-6">
                                        <p className="text-sm font-semibold text-theme-primary">{lead.name}</p>
                                    </td>
                                    <td className="py-4 px-6">
                                        <p className="text-xs text-theme-muted">{lead.email}</p>
                                        <p className="text-xs text-theme-muted">{lead.phone}</p>
                                    </td>
                                    <td className="py-4 px-6 text-sm capitalize">{lead.insuranceType}</td>
                                    <td className="py-4 px-6">
                                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-medium uppercase">
                                            {lead.source}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-xs text-theme-muted whitespace-nowrap">
                                        {new Date(lead.createdAt).toLocaleDateString('en-IN')}
                                    </td>
                                    <td className="py-4 px-6">
                                        {updating === lead.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin text-accent" />
                                        ) : (
                                            <select
                                                value={lead.status}
                                                onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                                                aria-label={`Status for ${lead.name}`}
                                                className="text-xs bg-transparent border border-default rounded-lg px-2 py-1 font-semibold cursor-pointer focus:outline-none focus:border-accent"
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
    );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        READY:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        FAILED:  'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    };
    return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold tracking-wide ${styles[status] ?? styles.PENDING}`}>
            {status}
        </span>
    );
}
