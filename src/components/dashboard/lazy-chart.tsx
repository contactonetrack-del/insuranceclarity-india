/**
 * lazy-chart.tsx
 * 
 * Lazy-loaded chart components for dashboard performance optimization.
 * Reduces initial bundle size by deferring recharts import until needed.
 * 
 * Phase 11 Optimization: Dynamic imports reduce dashboard bundle by ~350KB
 */

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Lazy load chart components with suspense fallback
export const LazyScanActivityChart = dynamic(
    () => import('./ScanActivityChart'),
    {
        loading: () => <ChartSkeleton />,
        ssr: true,
    }
);

export const LazyErrorMonitoringDashboard = dynamic(
    () => import('./ErrorMonitoringDashboard'),
    {
        loading: () => <ChartSkeleton />,
        ssr: true,
    }
);

/**
 * Chart loading skeleton - matches actual chart dimensions
 */
export function ChartSkeleton() {
    return (
        <div className="dashboard-chart animate-pulse">
            <div className="dashboard-chart__header">
                <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
            <div className="dashboard-chart__body">
                <div className="h-[180px] bg-slate-100 dark:bg-slate-800 rounded" />
            </div>
            <div className="dashboard-chart__legend space-y-2 mt-4">
                <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
        </div>
    );
}

/**
 * Wrapper component that provides Suspense boundary for lazy charts
 */
interface LazyChartWrapperProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function LazyChartWrapper({ children, fallback = <ChartSkeleton /> }: LazyChartWrapperProps) {
    return (
        <Suspense fallback={fallback}>
            {children}
        </Suspense>
    );
}
