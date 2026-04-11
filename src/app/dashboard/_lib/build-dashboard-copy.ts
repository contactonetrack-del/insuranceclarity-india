import type { DashboardCopy } from '@/components/dashboard/DashboardSections'

type DashboardTranslationFn = (key: string) => string

export function buildDashboardCopy(t: DashboardTranslationFn): DashboardCopy {
    return {
        header: {
            welcomeBackPrefix: t('header.welcomeBackPrefix'),
            anonymousUser: t('header.anonymousUser'),
            subtitle: t('header.subtitle'),
            profileStatusLabel: t('header.profileStatusLabel'),
            profileStatusValue: t('header.profileStatusValue'),
        },
        stats: {
            savedQuotes: t('stats.savedQuotes'),
            aiScans: t('stats.aiScans'),
            calculations: t('stats.calculations'),
            riskScore: t('stats.riskScore'),
        },
        recommendations: {
            sectionAriaLabel: t('recommendations.sectionAriaLabel'),
            badge: t('recommendations.badge'),
        },
        mainFeed: {
            savedQuotes: {
                title: t('mainFeed.savedQuotes.title'),
                viewAll: t('mainFeed.savedQuotes.viewAll'),
                emptyTitle: t('mainFeed.savedQuotes.emptyTitle'),
                emptyDescription: t('mainFeed.savedQuotes.emptyDescription'),
                emptyAction: t('mainFeed.savedQuotes.emptyAction'),
                yearlyPremium: t('mainFeed.savedQuotes.yearlyPremium'),
                coverage: t('mainFeed.savedQuotes.coverage'),
                policyDoc: t('mainFeed.savedQuotes.policyDoc'),
            },
            scans: {
                title: t('mainFeed.scans.title'),
                viewAll: t('mainFeed.scans.viewAll'),
                emptyTitle: t('mainFeed.scans.emptyTitle'),
                emptyDescription: t('mainFeed.scans.emptyDescription'),
                emptyAction: t('mainFeed.scans.emptyAction'),
                transparencyScore: t('mainFeed.scans.transparencyScore'),
                risksFound: t('mainFeed.scans.risksFound'),
                viewScanDetailsAria: t('mainFeed.scans.viewScanDetailsAria'),
                badge: {
                    analyzing: t('mainFeed.scans.badges.analyzing'),
                    lowRisk: t('mainFeed.scans.badges.lowRisk'),
                    moderateRisk: t('mainFeed.scans.badges.moderateRisk'),
                    highRisk: t('mainFeed.scans.badges.highRisk'),
                },
            },
            calculations: {
                title: t('mainFeed.calculations.title'),
                viewAll: t('mainFeed.calculations.viewAll'),
                emptyTitle: t('mainFeed.calculations.emptyTitle'),
                emptyDescription: t('mainFeed.calculations.emptyDescription'),
                emptyAction: t('mainFeed.calculations.emptyAction'),
                savedOn: t('mainFeed.calculations.savedOn'),
                previewFallback: t('mainFeed.calculations.previewFallback'),
                previewKeys: {
                    recommendedCoverage: t('mainFeed.calculations.previewKeys.recommendedCoverage'),
                    recommendedSumInsured: t('mainFeed.calculations.previewKeys.recommendedSumInsured'),
                    taxSavings: t('mainFeed.calculations.previewKeys.taxSavings'),
                    annualPremium: t('mainFeed.calculations.previewKeys.annualPremium'),
                    hlvResult: t('mainFeed.calculations.previewKeys.hlvResult'),
                },
            },
        },
        sidebar: {
            quickActions: {
                title: t('sidebar.quickActions.title'),
                subtitle: t('sidebar.quickActions.subtitle'),
                scanPolicyPdf: t('sidebar.quickActions.scanPolicyPdf'),
                bulkScan: t('sidebar.quickActions.bulkScan'),
                hlvCalculator: t('sidebar.quickActions.hlvCalculator'),
                profileSettings: t('sidebar.quickActions.profileSettings'),
            },
            premiumSupport: {
                title: t('sidebar.premiumSupport.title'),
                description: t('sidebar.premiumSupport.description'),
                cta: t('sidebar.premiumSupport.cta'),
            },
        },
    }
}

