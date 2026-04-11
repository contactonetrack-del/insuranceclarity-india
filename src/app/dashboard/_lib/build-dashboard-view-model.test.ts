import { describe, expect, it } from 'vitest'
import { buildDashboardViewModel } from '@/app/dashboard/_lib/build-dashboard-view-model'

describe('buildDashboardViewModel', () => {
    const t = (key: string) => key

    it('builds derived dashboard metrics and copy for a user', () => {
        const user = {
            id: 'user_1',
            plan: 'PRO',
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            savedQuotes: [
                {
                    id: 'q_1',
                    type: 'health',
                    provider: 'ABC',
                    premium: 1000,
                    coverAmount: 200000,
                    createdAt: new Date('2026-02-01T00:00:00.000Z'),
                },
            ],
            scans: [
                {
                    id: 's_1',
                    fileName: 'policy-1.pdf',
                    createdAt: new Date('2026-03-01T00:00:00.000Z'),
                    score: 82,
                    report: {
                        score: 82,
                        risks: [{ id: 'r_1' }],
                    },
                },
                {
                    id: 's_2',
                    fileName: 'policy-2.pdf',
                    createdAt: new Date('2026-03-02T00:00:00.000Z'),
                    score: null,
                    report: null,
                },
            ],
            calculations: [
                {
                    id: 'c_1',
                    type: 'hlv',
                    result: { recommendedCoverage: 1000000 },
                    createdAt: new Date('2026-03-03T00:00:00.000Z'),
                },
            ],
            _count: {
                calculations: 1,
            },
        }

        const model = buildDashboardViewModel({ user, locale: 'hi', t })

        expect(model.savedQuotes).toHaveLength(1)
        expect(model.scans).toHaveLength(2)
        expect(model.calculations).toHaveLength(1)
        expect(model.riskScoreDisplay).toBe('82.0')
        expect(model.calcCount).toBe(1)
        expect(model.dateLocaleTag).toBe('hi-IN')
        expect(model.personalizedHints.length).toBeGreaterThan(0)
        expect(model.chartData.length).toBeGreaterThan(0)
        expect(model.dashboardCopy.header.welcomeBackPrefix).toBe('header.welcomeBackPrefix')
    })

    it('returns safe defaults when user is missing', () => {
        const model = buildDashboardViewModel({ user: null, locale: 'en', t })

        expect(model.savedQuotes).toEqual([])
        expect(model.scans).toEqual([])
        expect(model.calculations).toEqual([])
        expect(model.riskScoreDisplay).toBe('--')
        expect(model.calcCount).toBe(0)
        expect(model.dateLocaleTag).toBe('en-IN')
        expect(model.dashboardCopy.stats.aiScans).toBe('stats.aiScans')
    })
})

