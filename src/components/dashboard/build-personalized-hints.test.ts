import { describe, expect, it } from 'vitest'
import { buildPersonalizedHints } from './build-personalized-hints'

const t = (key: string) => key

describe('buildPersonalizedHints', () => {
    it('returns no-user hint when no user profile is available', () => {
        const hints = buildPersonalizedHints({
            hasUser: false,
            scansCount: 0,
            quotesCount: 0,
            userPlan: null,
            t,
        })

        expect(hints).toEqual([
            {
                title: 'hints.noUser.title',
                description: 'hints.noUser.description',
                ctaLabel: 'hints.noUser.cta',
                ctaHref: '/scan',
            },
        ])
    })

    it('limits personalized results to two hints in priority order', () => {
        const hints = buildPersonalizedHints({
            hasUser: true,
            scansCount: 0,
            quotesCount: 0,
            userPlan: 'FREE',
            t,
        })

        expect(hints).toHaveLength(2)
        expect(hints[0]?.title).toBe('hints.noScans.title')
        expect(hints[1]?.title).toBe('hints.noQuotes.title')
    })

    it('returns on-track hint when no intervention is needed', () => {
        const hints = buildPersonalizedHints({
            hasUser: true,
            scansCount: 4,
            quotesCount: 2,
            userPlan: 'PRO',
            t,
        })

        expect(hints).toEqual([
            {
                title: 'hints.onTrack.title',
                description: 'hints.onTrack.description',
                ctaLabel: 'hints.onTrack.cta',
                ctaHref: '/tools/ai-advisor',
            },
        ])
    })
})
