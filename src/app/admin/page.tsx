'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, TrendingUp, Users, Activity, FileText, Lock, Loader2 } from 'lucide-react';
import { AnimatedHeading, GradientText } from '@/components/premium/text/animated-text';
import { getAdminDashboardStats } from '../actions/admin-actions';
import { MagicButton } from '@/components/premium/buttons/magic-button';

export default function AdminDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [stats, setStats] = useState<any>(null);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // A simple hardcoded lock to keep public users out of the demo dashboard
        if (password === 'admin123') {
            setIsAuthenticated(true);
            fetchStats();
        } else {
            setError('Invalid master password.');
        }
    };

    const fetchStats = async () => {
        setLoading(true);
        const data = await getAdminDashboardStats();
        if (data && !data.error) {
            setStats(data);
        }
        setLoading(false);
    };

    // --- Authentication Overlay ---
    if (!isAuthenticated) {
        return (
            <main className="min-h-screen bg-theme-bg flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full glass p-8 rounded-3xl shadow-glow relative border border-white/20 dark:border-white/10"
                >
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-accent rounded-t-3xl" />
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-default shadow-inner">
                            <Lock className="w-8 h-8 text-slate-400" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Restricted Access</h1>
                        <p className="text-sm text-theme-muted">Please enter the master credential to view business metrics.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Master Password"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-default outline-none focus:border-accent transition-colors"
                            />
                        </div>
                        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
                        <MagicButton type="submit" className="w-full" size="lg" glow>
                            Authenticate
                        </MagicButton>
                    </form>
                </motion.div>
            </main>
        );
    }

    // --- Main Dashboard view ---
    return (
        <main className="min-h-screen bg-theme-bg pt-28 pb-20 relative">
            <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent pointer-events-none" />

            <div className="container px-4 mx-auto max-w-6xl relative z-10">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <AnimatedHeading
                            text="Executive Dashboard"
                            as="h1"
                            className="text-3xl font-bold mb-2 tracking-tight"
                        />
                        <p className="text-theme-secondary flex items-center gap-2">
                            <Shield className="w-4 h-4 text-emerald-500" /> Live AI Underwriter Telemetry
                        </p>
                    </div>
                    <MagicButton variant="secondary" onClick={() => fetchStats()} loading={loading}>
                        <Activity className="w-4 h-4 mr-2" /> Refresh Data
                    </MagicButton>
                </header>

                {/* KPI Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            className="glass p-6 rounded-3xl border border-white/20 dark:border-white/10"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-sm font-medium text-theme-muted mb-1">Total Generated Leads</p>
                                    <h3 className="text-4xl font-black">{stats.totalQuotes}</h3>
                                </div>
                                <div className="p-3 bg-blue-500/10 rounded-2xl">
                                    <Users className="w-6 h-6 text-blue-500" />
                                </div>
                            </div>
                            <div className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> System Operational
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            className="glass p-6 rounded-3xl border border-white/20 dark:border-white/10 relative overflow-hidden group"
                        >
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-sm font-medium text-theme-muted mb-1">ARR Pipeline Estimate</p>
                                    <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-600 to-teal-800 dark:from-emerald-400 dark:to-teal-200">
                                        ₹{stats.totalPremium.toLocaleString('en-IN')}
                                    </h3>
                                </div>
                                <div className="p-3 bg-emerald-500/10 rounded-2xl">
                                    <TrendingUp className="w-6 h-6 text-emerald-500" />
                                </div>
                            </div>
                            <div className="text-xs font-medium text-theme-muted">
                                Aggregate across all requested policies.
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                            className="glass p-6 rounded-3xl border border-white/20 dark:border-white/10"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-sm font-medium text-theme-muted mb-1">Total Coverage Value</p>
                                    <h3 className="text-4xl font-black">
                                        ₹{stats.totalCoverage > 10000000
                                            ? `${(stats.totalCoverage / 10000000).toFixed(1)} Cr`
                                            : stats.totalCoverage.toLocaleString('en-IN')}
                                    </h3>
                                </div>
                                <div className="p-3 bg-purple-500/10 rounded-2xl">
                                    <Shield className="w-6 h-6 text-purple-500" />
                                </div>
                            </div>
                            <div className="text-xs font-medium text-theme-muted">
                                Underwritten risk pool valuation.
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Data Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="glass rounded-3xl border border-white/20 dark:border-white/10 overflow-hidden"
                >
                    <div className="p-6 border-b border-default bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                        <h3 className="font-bold flex items-center gap-2">
                            <FileText className="w-4 h-4 text-theme-secondary" /> Recent Applications
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-default">
                                    <th className="py-4 px-6 text-xs font-semibold text-theme-muted uppercase tracking-wider">Quote ID</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-theme-muted uppercase tracking-wider">Created</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-theme-muted uppercase tracking-wider">Type</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-theme-muted uppercase tracking-wider text-right">Coverage</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-theme-muted uppercase tracking-wider text-right">Premium</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-theme-muted uppercase tracking-wider text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!stats ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-theme-muted">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                            Loading latest records...
                                        </td>
                                    </tr>
                                ) : stats.recentQuotes.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-theme-muted">
                                            No quotes generated yet.
                                        </td>
                                    </tr>
                                ) : (
                                    stats.recentQuotes.map((quote: any) => (
                                        <tr key={quote.id} className="border-b border-default hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="py-4 px-6 font-mono text-xs font-medium text-slate-500">{quote.id.split('-')[0]}...</td>
                                            <td className="py-4 px-6 text-sm whitespace-nowrap">
                                                {new Date(quote.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-4 px-6 text-sm font-medium capitalize">{quote.insuranceType}</td>
                                            <td className="py-4 px-6 text-sm text-right font-medium">₹{quote.coverageAmount?.toLocaleString('en-IN') || '0'}</td>
                                            <td className="py-4 px-6 text-sm text-right font-bold text-green-600 dark:text-green-400">
                                                ₹{quote.premiumAmount?.toLocaleString('en-IN') || '0'}
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold tracking-wide ${quote.status === 'READY'
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                    }`}>
                                                    {quote.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
