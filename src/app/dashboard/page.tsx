import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getLocale, getTranslations } from 'next-intl/server'
import { LazyScanActivityChart, LazyChartWrapper } from '@/components/dashboard/lazy-chart'
import { buildDashboardViewModel } from '@/app/dashboard/_lib/build-dashboard-view-model'
import { findDashboardSnapshotByEmail } from '@/services/dashboard.service'
import {
    DashboardHeaderSection,
    DashboardStatsGrid,
    PersonalizedRecommendations,
    DashboardMainFeed,
    DashboardSidebar,
} from '@/components/dashboard/DashboardSections'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const [session, t, locale] = await Promise.all([
        auth(),
        getTranslations('dashboardPage'),
        getLocale(),
    ])

    if (!session) {
        redirect('/')
    }

    const email = session.user?.email
    if (!email) {
        redirect('/')
    }

    const user = await findDashboardSnapshotByEmail(email)

    if (user) {
        const isRetained =
            user.scans.length > 0 &&
            Date.now() - new Date(user.createdAt).getTime() >= 7 * 24 * 60 * 60 * 1000

        if (isRetained) {
            const { trackFunnelStep } = await import('@/lib/analytics/funnel')
            await trackFunnelStep('retain', { userId: user.id }).catch(() => { /* non-fatal */ })
        }
    }

    const {
        savedQuotes,
        scans,
        calculations,
        calcCount,
        riskScoreDisplay,
        dateLocaleTag,
        personalizedHints,
        chartData,
        dashboardCopy,
    } = buildDashboardViewModel({ user, locale, t })

    return (
        <div className="min-h-screen pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto space-y-10">
                <DashboardHeaderSection userName={session.user?.name} copy={dashboardCopy.header} />

                <DashboardStatsGrid
                    savedQuotesCount={savedQuotes.length}
                    scansCount={scans.length}
                    calcCount={calcCount}
                    riskScoreDisplay={riskScoreDisplay}
                    copy={dashboardCopy.stats}
                />

                <LazyChartWrapper>
                    <LazyScanActivityChart data={chartData} />
                </LazyChartWrapper>

                <PersonalizedRecommendations hints={personalizedHints} copy={dashboardCopy.recommendations} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <DashboardMainFeed
                        savedQuotes={savedQuotes}
                        scans={scans}
                        calculations={calculations}
                        copy={dashboardCopy.mainFeed}
                        localeTag={dateLocaleTag}
                    />
                    <DashboardSidebar copy={dashboardCopy.sidebar} />
                </div>
            </div>
        </div>
    )
}
