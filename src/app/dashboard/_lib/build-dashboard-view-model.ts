import { buildDashboardChartData } from '@/components/dashboard/build-chart-data'
import { buildPersonalizedHints } from '@/components/dashboard/build-personalized-hints'
import type {
    DashboardCalculation,
    DashboardQuote,
    DashboardScan,
    PersonalizedHint,
} from '@/components/dashboard/DashboardSections'
import { buildDashboardCopy } from '@/app/dashboard/_lib/build-dashboard-copy'

type DashboardTranslationFn = (key: string) => string

type DashboardUserRecord = {
    id: string
    plan: string
    createdAt: Date
    savedQuotes: Array<{
        id: string
        type: string
        provider: string
        premium: number
        coverAmount: number
        createdAt: Date
    }>
    scans: Array<{
        id: string
        fileName: string
        createdAt: Date
        score: number | null
        report: {
            score: number
            risks: unknown
        } | null
    }>
    calculations: Array<{
        id: string
        type: string
        result: unknown
        createdAt: Date
    }>
    _count: {
        calculations: number
    }
}

export function buildDashboardViewModel(params: {
    user: DashboardUserRecord | null
    locale: string
    t: DashboardTranslationFn
}) {
    const { user, locale, t } = params

    const savedQuotes: DashboardQuote[] = (user?.savedQuotes ?? []).map((quote) => ({
        id: quote.id,
        type: quote.type,
        provider: quote.provider,
        premium: quote.premium,
        coverAmount: quote.coverAmount,
        createdAt: quote.createdAt,
    }))

    const scans: DashboardScan[] = (user?.scans ?? []).map((scan) => ({
        id: scan.id,
        fileName: scan.fileName,
        createdAt: scan.createdAt,
        score: scan.score,
        report: scan.report
            ? {
                score: scan.report.score,
                risks: scan.report.risks as unknown,
            }
            : null,
    }))

    const calculations: DashboardCalculation[] = (user?.calculations ?? []).map((calculation) => ({
        id: calculation.id,
        type: calculation.type,
        result: calculation.result,
        createdAt: calculation.createdAt,
    }))

    const completedScans = scans.filter((scan) => scan.report?.score != null)
    const latestRiskScore = completedScans[0]?.report?.score ?? null
    const riskScoreDisplay = latestRiskScore !== null ? latestRiskScore.toFixed(1) : '--'
    const calcCount = user?._count?.calculations ?? 0
    const dateLocaleTag = locale === 'hi' ? 'hi-IN' : 'en-IN'

    const personalizedHints: PersonalizedHint[] = buildPersonalizedHints({
        hasUser: Boolean(user),
        scansCount: scans.length,
        quotesCount: savedQuotes.length,
        userPlan: user?.plan ?? null,
        t,
    })

    const chartData = buildDashboardChartData(scans, dateLocaleTag)

    return {
        savedQuotes,
        scans,
        calculations,
        calcCount,
        riskScoreDisplay,
        dateLocaleTag,
        personalizedHints,
        chartData,
        dashboardCopy: buildDashboardCopy(t),
    }
}

