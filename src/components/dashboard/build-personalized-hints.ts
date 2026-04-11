import type { PersonalizedHint } from '@/components/dashboard/DashboardSections'

export function buildPersonalizedHints({
    hasUser,
    scansCount,
    quotesCount,
    userPlan,
    t,
}: {
    hasUser: boolean
    scansCount: number
    quotesCount: number
    userPlan: string | null
    t: (key: string) => string
}): PersonalizedHint[] {
    if (!hasUser) {
        return [
            {
                title: t('hints.noUser.title'),
                description: t('hints.noUser.description'),
                ctaLabel: t('hints.noUser.cta'),
                ctaHref: '/scan',
            },
        ]
    }

    const hints: PersonalizedHint[] = []

    if (scansCount === 0) {
        hints.push({
            title: t('hints.noScans.title'),
            description: t('hints.noScans.description'),
            ctaLabel: t('hints.noScans.cta'),
            ctaHref: '/scan',
        })
    } else if (scansCount < 3) {
        hints.push({
            title: t('hints.lowScans.title'),
            description: t('hints.lowScans.description'),
            ctaLabel: t('hints.lowScans.cta'),
            ctaHref: '/tools/compare',
        })
    }

    if (quotesCount === 0) {
        hints.push({
            title: t('hints.noQuotes.title'),
            description: t('hints.noQuotes.description'),
            ctaLabel: t('hints.noQuotes.cta'),
            ctaHref: '/tools/interactive-quote',
        })
    }

    if ((userPlan ?? 'FREE') === 'FREE') {
        hints.push({
            title: t('hints.freePlan.title'),
            description: t('hints.freePlan.description'),
            ctaLabel: t('hints.freePlan.cta'),
            ctaHref: '/pricing',
        })
    }

    if (hints.length === 0) {
        hints.push({
            title: t('hints.onTrack.title'),
            description: t('hints.onTrack.description'),
            ctaLabel: t('hints.onTrack.cta'),
            ctaHref: '/tools/ai-advisor',
        })
    }

    return hints.slice(0, 2)
}
