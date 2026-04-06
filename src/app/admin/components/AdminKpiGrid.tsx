'use client';

import { motion } from 'framer-motion';
import { Users, TrendingUp, Cpu, CreditCard, Activity } from 'lucide-react';
import type { AdminDashboardStats } from '@/types/app.types';

interface KpiCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    valueClass?: string;
    color: string;
    badge: string;
    badgeColor: string;
    delay: number;
}

function KpiCard({
    icon, label, value, valueClass, color, badge, badgeColor, delay,
}: KpiCardProps) {
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
                    <h3 className={`text-3xl font-black ${valueClass ?? 'text-theme-primary'}`}>{value}</h3>
                </div>
                <div className={`p-3 ${color} rounded-2xl`}>{icon}</div>
            </div>
            <div className={`text-[10px] font-semibold flex items-center gap-1 ${badgeColor}`}>
                <Activity className="w-3 h-3" /> {badge}
            </div>
        </motion.div>
    );
}

export function AdminKpiGrid({ stats }: { stats: AdminDashboardStats }) {
    const kpis = [
        {
            icon: <Users className="w-6 h-6 text-blue-500" />,
            label: "Gross Leads",
            value: stats.totalQuotes.toLocaleString('en-IN'),
            color: "bg-blue-500/10",
            badge: "Total engagement",
            badgeColor: "text-blue-500",
            delay: 0.1,
        },
        {
            icon: <TrendingUp className="w-6 h-6 text-emerald-500" />,
            label: "Pipeline (ARR)",
            value: `₹${stats.totalPremium.toLocaleString('en-IN')}`,
            valueClass: "text-emerald-600 dark:text-emerald-400",
            color: "bg-emerald-500/10",
            badge: "Annualized pipeline",
            badgeColor: "text-emerald-500",
            delay: 0.15,
        },
        {
            icon: <CreditCard className="w-6 h-6 text-purple-500" />,
            label: "Paid Subscriptions",
            value: (stats.activeSubscriptions ?? 0).toString(),
            color: "bg-purple-500/10",
            badge: "Active paying users",
            badgeColor: "text-purple-500",
            delay: 0.2,
        },
        {
            icon: <Cpu className="w-6 h-6 text-orange-500" />,
            label: "AI Compute",
            value: stats.totalTokens ? `${(stats.totalTokens / 1000).toFixed(1)}k` : '0',
            color: "bg-orange-500/10",
            badge: `Est. Cost: $${(stats.estimatedAiCost ?? 0).toFixed(2)}`,
            badgeColor: "text-orange-500",
            delay: 0.25,
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {kpis.map((kpi, i) => (
                <KpiCard key={i} {...kpi} />
            ))}
        </div>
    );
}
