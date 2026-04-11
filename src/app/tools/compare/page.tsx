import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { logger } from '@/lib/logger'
import { isExpectedDbFallbackError } from '@/lib/prisma-fallback'
import { getComparePageData } from '@/services/compare.service'
import CompareClient, { Policy } from './CompareClient'

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('auditI18n.comparePage')

    return {
        title: t('metadataTitle'),
        description: t('metadataDescription'),
    }
}
export const dynamic = 'force-dynamic'

export default async function ComparePage() {
    let policies: Policy[] = []
    let categories: Array<{ id: string; name: string }> = []

    try {
        const data = await getComparePageData()
        policies = data.policies
        categories = data.categories
    } catch (error) {
        if (isExpectedDbFallbackError(error)) {
            if (process.env.NODE_ENV !== 'production') {
                logger.warn(
                    {
                        action: 'compare.page.db_query_skipped',
                        error: error instanceof Error ? error.message : String(error),
                    },
                    'Skipping compare page DB data; using empty fallback'
                )
            }
            return <CompareClient policies={policies} categories={categories} />
        }

        logger.error(
            {
                action: 'compare.page.db_query_failed',
                error: error instanceof Error ? error.message : String(error),
            },
            'Failed to load policy comparison data; using empty fallback'
        )
    }

    return <CompareClient policies={policies} categories={categories} />
}
