'use client';

/**
 * ScanActivityChart.tsx
 *
 * Area chart showing AI scan activity over the last 30 days.
 * Uses recharts — dynamically imported to keep SSR bundle small.
 */

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import './dashboard-chart.css';

interface ScanDataPoint {
    day: string;
    scans: number;
    risks: number;
}

interface ScanActivityChartProps {
    data: ScanDataPoint[];
}

export default function ScanActivityChart({ data }: ScanActivityChartProps) {
    if (!data.length) return null;

    return (
        <div className="dashboard-chart" role="img" aria-label="Scan activity chart over the last 30 days">
            <div className="dashboard-chart__header">
                <h3 className="dashboard-chart__title">Scan Activity</h3>
                <span className="dashboard-chart__badge">Last 30 days</span>
            </div>
            <div className="dashboard-chart__body">
                <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                        <defs>
                            <linearGradient id="gradScans" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="rgb(var(--color-accent))" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="rgb(var(--color-accent))" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="gradRisks" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(var(--color-border-default), 0.08)"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="day"
                            tick={{ fontSize: 11, fill: 'rgb(var(--color-text-muted))' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: 'rgb(var(--color-text-muted))' }}
                            axisLine={false}
                            tickLine={false}
                            allowDecimals={false}
                        />
                        <Tooltip
                            contentStyle={{
                                background: 'rgb(var(--color-card-bg))',
                                border: '1px solid rgba(var(--color-border-default), 0.15)',
                                borderRadius: '12px',
                                fontSize: '12px',
                            }}
                            labelStyle={{ color: 'rgb(var(--color-text-primary))', fontWeight: 700 }}
                            itemStyle={{ color: 'rgb(var(--color-text-secondary))' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="scans"
                            name="Scans"
                            stroke="rgb(var(--color-accent))"
                            strokeWidth={2}
                            fill="url(#gradScans)"
                            dot={false}
                            activeDot={{ r: 4, strokeWidth: 0 }}
                        />
                        <Area
                            type="monotone"
                            dataKey="risks"
                            name="Risks Found"
                            stroke="#f43f5e"
                            strokeWidth={2}
                            fill="url(#gradRisks)"
                            dot={false}
                            activeDot={{ r: 4, strokeWidth: 0 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            <div className="dashboard-chart__legend">
                <span className="dashboard-chart__legend-item dashboard-chart__legend-item--accent">Scans</span>
                <span className="dashboard-chart__legend-item dashboard-chart__legend-item--risk">Risks Found</span>
            </div>
        </div>
    );
}
