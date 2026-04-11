import { describe, expect, it } from 'vitest'
import { buildDashboardChartData } from './build-chart-data'
import type { DashboardScan } from './DashboardSections'

describe('buildDashboardChartData', () => {
    it('builds a 30-day series and aggregates scans/risks for matching day', () => {
        const now = new Date()
        const scans: DashboardScan[] = [
            {
                id: 'scan-1',
                fileName: 'policy-1.pdf',
                createdAt: now,
                report: { risks: [{}, {}] },
            },
            {
                id: 'scan-2',
                fileName: 'policy-2.pdf',
                createdAt: now,
                report: { risks: [{}] },
            },
        ]

        const chart = buildDashboardChartData(scans, 'en-IN')

        expect(chart).toHaveLength(30)
        const last = chart[chart.length - 1]
        expect(last.scans).toBe(2)
        expect(last.risks).toBe(3)
    })
})
