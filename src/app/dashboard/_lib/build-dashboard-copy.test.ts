import { describe, expect, it } from 'vitest'
import { buildDashboardCopy } from '@/app/dashboard/_lib/build-dashboard-copy'

describe('buildDashboardCopy', () => {
    it('maps translation keys into dashboard copy structure', () => {
        const t = (key: string) => `translated:${key}`
        const copy = buildDashboardCopy(t)

        expect(copy.header.welcomeBackPrefix).toBe('translated:header.welcomeBackPrefix')
        expect(copy.stats.riskScore).toBe('translated:stats.riskScore')
        expect(copy.mainFeed.scans.badge.highRisk).toBe('translated:mainFeed.scans.badges.highRisk')
        expect(copy.sidebar.premiumSupport.cta).toBe('translated:sidebar.premiumSupport.cta')
    })
})

