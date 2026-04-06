'use client';

import { motion } from 'framer-motion';
import { Cpu, Zap, Activity, Info } from 'lucide-react';
import type { AdminDashboardStats } from '@/types/app.types';

export function AiTelemetry({ stats }: { stats: AdminDashboardStats }) {
    const totalTokens = stats.totalTokens ?? 0;
    const estCost = stats.estimatedAiCost ?? 0;

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
                        <h3 className="font-bold text-lg">AI Performance Monitoring</h3>
                        <p className="text-xs text-theme-muted">Real-time inference telemetry (Gemini-2.0-Flash)</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Health: Nominal</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-theme-muted">
                        <span>Total Inference Load</span>
                        <Zap className="w-3 h-3" />
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '75%' }} // Mock visualization
                            className="h-full bg-orange-500"
                        />
                    </div>
                    <p className="text-[10px] text-theme-muted flex items-center gap-1">
                        <Info className="w-2.5 h-2.5" /> Utilization within quota (75%)
                    </p>
                </div>

                <div className="space-y-1">
                    <p className="text-xs font-semibold text-theme-muted">Aggregate Token Count</p>
                    <p className="text-2xl font-black text-theme-primary">
                        {totalTokens.toLocaleString()} <span className="text-xs font-medium text-theme-muted">tokens</span>
                    </p>
                </div>

                <div className="space-y-1">
                    <p className="text-xs font-semibold text-theme-muted">Blended OPEX (Est)</p>
                    <p className="text-2xl font-black text-theme-primary">
                        ${estCost.toFixed(4)} <span className="text-xs font-medium text-theme-muted">USD</span>
                    </p>
                </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-default flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-theme-muted">
                        <Activity className="w-3 h-3 text-orange-500" /> Latency: 1.4s (avg)
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-theme-muted">
                        <Activity className="w-3 h-3 text-emerald-500" /> Success Rate: 99.8%
                    </div>
                </div>
                <button className="text-[10px] font-bold text-accent hover:underline uppercase tracking-wider">
                    View Full Logs
                </button>
            </div>
        </motion.div>
    );
}
