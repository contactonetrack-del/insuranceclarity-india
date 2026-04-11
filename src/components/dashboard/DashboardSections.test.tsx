/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DashboardMainFeed, DashboardStatsGrid, type DashboardCopy } from './DashboardSections'

const dashboardCopy: DashboardCopy = {
    header: {
        welcomeBackPrefix: 'Welcome Back,',
        anonymousUser: 'User',
        subtitle: 'Your insurance intelligence hub.',
        profileStatusLabel: 'Profile Status',
        profileStatusValue: 'Fully Protected',
    },
    stats: {
        savedQuotes: 'Saved Quotes',
        aiScans: 'AI Scans',
        calculations: 'Calculations',
        riskScore: 'Risk Score',
    },
    recommendations: {
        sectionAriaLabel: 'Personalized recommendations',
        badge: 'Personalized Recommendation',
    },
    mainFeed: {
        savedQuotes: {
            title: 'Saved Insurance Quotes',
            viewAll: 'View All',
            emptyTitle: 'No quotes saved yet',
            emptyDescription: 'Generate an interactive quote to see customized pricing and policy details.',
            emptyAction: 'Get a Quote',
            yearlyPremium: 'Yearly Premium',
            coverage: 'Coverage',
            policyDoc: 'Policy Doc',
        },
        scans: {
            title: 'Recent Policy Scans',
            viewAll: 'View All',
            emptyTitle: 'No policies scanned yet',
            emptyDescription: 'Upload your insurance brochure to unveil hidden exclusions using AI.',
            emptyAction: 'Scan Policy',
            transparencyScore: 'Transparency Score',
            risksFound: 'Risks Found',
            viewScanDetailsAria: 'View scan details',
            badge: {
                analyzing: 'Analyzing',
                lowRisk: 'Low Risk',
                moderateRisk: 'Moderate Risk',
                highRisk: 'High Risk',
            },
        },
        calculations: {
            title: 'Saved Calculations',
            viewAll: 'View All',
            emptyTitle: 'No calculations yet',
            emptyDescription: 'Use our calculators to find your HLV or Tax savings.',
            emptyAction: 'Explore Tools',
            savedOn: 'Saved on',
            previewFallback: 'Calculation saved successfully.',
            previewKeys: {
                recommendedCoverage: 'Recommended Coverage',
                recommendedSumInsured: 'Recommended Sum Insured',
                taxSavings: 'Tax Savings',
                annualPremium: 'Annual Premium',
                hlvResult: 'HLV Result',
            },
        },
    },
    sidebar: {
        quickActions: {
            title: 'Quick Actions',
            subtitle: 'Shortcuts to essential tools.',
            scanPolicyPdf: 'Scan Policy PDF',
            bulkScan: 'Bulk Scan (Enterprise)',
            hlvCalculator: 'HLV Calculator',
            profileSettings: 'Profile Settings',
        },
        premiumSupport: {
            title: 'Premium Support',
            description: 'Talk to our neutral insurance advisors today.',
            cta: 'Talk to an Advisor',
        },
    },
}

describe('DashboardStatsGrid', () => {
    it('renders localized stat labels and values from props', () => {
        const localizedCopy = {
            ...dashboardCopy.stats,
            savedQuotes: 'Localized Saved Quotes',
            aiScans: 'Localized AI Scans',
            calculations: 'Localized Calculations',
            riskScore: 'Localized Risk Score',
        }

        render(
            <DashboardStatsGrid
                savedQuotesCount={2}
                scansCount={3}
                calcCount={4}
                riskScoreDisplay="81.2"
                copy={localizedCopy}
            />,
        )

        expect(screen.getByText('Localized Saved Quotes')).toBeInTheDocument()
        expect(screen.getByText('Localized AI Scans')).toBeInTheDocument()
        expect(screen.getByText('Localized Calculations')).toBeInTheDocument()
        expect(screen.getByText('Localized Risk Score')).toBeInTheDocument()
        expect(screen.getByText('2')).toBeInTheDocument()
        expect(screen.getByText('3')).toBeInTheDocument()
        expect(screen.getByText('4')).toBeInTheDocument()
        expect(screen.getByText('81.2')).toBeInTheDocument()
    })

    it('renders localized calculation preview labels and fallback text', () => {
        render(
            <DashboardMainFeed
                savedQuotes={[]}
                scans={[]}
                calculations={[
                    {
                        id: 'calc_1',
                        type: 'HLV',
                        result: { recommendedCoverage: 5500000 },
                        createdAt: new Date('2026-04-10T00:00:00.000Z'),
                    },
                    {
                        id: 'calc_2',
                        type: 'TAX',
                        result: null,
                        createdAt: new Date('2026-04-10T00:00:00.000Z'),
                    },
                ]}
                localeTag="en-IN"
                copy={{
                    ...dashboardCopy.mainFeed,
                    calculations: {
                        ...dashboardCopy.mainFeed.calculations,
                        previewFallback: 'Localized calculation fallback',
                        previewKeys: {
                            ...dashboardCopy.mainFeed.calculations.previewKeys,
                            recommendedCoverage: 'Localized Recommended Coverage',
                        },
                    },
                }}
            />,
        )

        expect(screen.getByText('Localized Recommended Coverage: 55,00,000')).toBeInTheDocument()
        expect(screen.getByText('Localized calculation fallback')).toBeInTheDocument()
    })
})
