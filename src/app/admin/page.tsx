'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, Loader2, RefreshCw, AlertTriangle, LayoutDashboard, Users } from 'lucide-react';
import { AnimatedHeading, GradientText } from '@/components/premium/text/animated-text';
import { getAdminDashboardStats, getAdminLeads } from '../actions/admin-actions';
import { MagicButton } from '@/components/premium/buttons/magic-button';
import type { AdminDashboardStats, Lead } from '@/types/app.types';

// Modular Components
import { AdminKpiGrid } from './components/AdminKpiGrid';
import { AiTelemetry } from './components/AiTelemetry';
import { AdminQuotesTable } from './components/AdminQuotesTable';
import { AdminLeadsTable } from './components/AdminLeadsTable';

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

        if (statsResult && 'error' in statsResult) {
            setError(statsResult.error);
        } else if (statsResult) {
            setStats(statsResult as AdminDashboardStats);
        }

        if (Array.isArray(leadsResult)) {
            setLeads(leadsResult as Lead[]);
        }

        setLoading(false);
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    if (loading && !stats) {
        return (
            <main className="min-h-screen bg-theme-bg flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-accent mx-auto mb-4" />
                    <p className="text-theme-muted text-sm font-medium">Synchronizing telemetry data…</p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen bg-theme-bg flex items-center justify-center p-4">
                <div className="glass p-8 rounded-3xl border border-rose-500/20 text-center max-w-sm">
                    <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                    <h1 className="text-xl font-bold mb-2">Access Denied</h1>
                    <p className="text-theme-muted text-sm mb-6 leading-relaxed">{error}</p>
                    <MagicButton onClick={() => { window.location.href = '/'; }}>
                        Return to Platform
                    </MagicButton>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-theme-bg pt-28 pb-20 relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="container px-4 mx-auto max-w-6xl relative z-10">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-accent/10 text-accent text-[10px] font-bold rounded uppercase tracking-wider">Internal Admin</span>
                        </div>
                        <AnimatedHeading
                            text="Executive Core"
                            as="h1"
                            className="text-4xl font-black mb-2 tracking-tighter"
                        />
                        <p className="text-theme-secondary flex items-center gap-2 text-sm font-medium">
                            <Shield className="w-4 h-4 text-emerald-500" />
                            <GradientText>Real-time ecosystem health</GradientText>
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="flex p-1 bg-white dark:bg-slate-900 rounded-2xl border border-default shadow-sm w-full md:w-auto">
                            <button
                                onClick={() => setTab('overview')}
                                className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${tab === 'overview' ? 'bg-accent text-white shadow-lg' : 'text-theme-muted hover:text-theme-primary'}`}
                            >
                                <LayoutDashboard className="w-3.5 h-3.5" /> Overview
                            </button>
                            <button
                                onClick={() => setTab('leads')}
                                className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${tab === 'leads' ? 'bg-accent text-white shadow-lg' : 'text-theme-muted hover:text-theme-primary'}`}
                            >
                                <Users className="w-3.5 h-3.5" /> CRM
                            </button>
                        </div>
                        <MagicButton variant="secondary" onClick={fetchData} loading={loading} className="shrink-0">
                            <RefreshCw className="w-4 h-4" />
                        </MagicButton>
                    </div>
                </header>

                {/* Dashboard Tabs Content */}
                <div className="min-h-[400px]">
                    {tab === 'overview' && stats && (
                        <div className="space-y-6">
                            <AdminKpiGrid stats={stats} />
                            <AiTelemetry stats={stats} />
                            <AdminQuotesTable quotes={stats.recentQuotes} />
                        </div>
                    )}

                    {tab === 'leads' && (
                        <AdminLeadsTable leads={leads} onStatusChange={fetchData} />
                    )}
                </div>
            </div>
        </main>
    );
}
