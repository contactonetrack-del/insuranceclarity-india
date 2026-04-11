import type { DashboardScan } from '@/components/dashboard/DashboardSections'

export interface DashboardChartPoint {
    day: string
    scans: number
    risks: number
}

export function buildDashboardChartData(
    scans: DashboardScan[],
    localeTag: string,
): DashboardChartPoint[] {
    const days: DashboardChartPoint[] = []
    const now = new Date()

    for (let i = 29; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)

        const label = date.toLocaleDateString(localeTag, { month: 'short', day: 'numeric' })
        const dayStart = new Date(date)
        dayStart.setHours(0, 0, 0, 0)
        const dayEnd = new Date(date)
        dayEnd.setHours(23, 59, 59, 999)

        const scansOnDay = scans.filter((scan) => {
            const createdAt = new Date(scan.createdAt)
            return createdAt >= dayStart && createdAt <= dayEnd
        })

        const risksOnDay = scansOnDay.reduce((sum, scan) => {
            const risks = Array.isArray(scan.report?.risks) ? scan.report.risks.length : 0
            return sum + risks
        }, 0)

        days.push({
            day: label,
            scans: scansOnDay.length,
            risks: risksOnDay,
        })
    }

    return days
}
