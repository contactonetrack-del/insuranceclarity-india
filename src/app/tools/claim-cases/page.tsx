import Link from 'next/link'
import { ArrowRight, AlertTriangle, CheckCircle, Lightbulb, Search, XCircle } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import Card from '@/components/ui/Card'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { logger } from '@/lib/logger'
import { getDbFallbackErrorMessage, isExpectedDbFallbackError } from '@/lib/prisma-fallback'
import { claimsService } from '@/services/claims.service'
import type { ClaimCase } from '@/types/app.types'

export const dynamic = 'force-dynamic'

const verdictStyles = {
    approved: 'bg-success-500/10 text-success-500 border-success-500/30',
    rejected: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
    partial: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
}

export default async function ClaimCasesPage() {
    const t = await getTranslations('tools.claimCases')
    let claimCases: ClaimCase[] = []
    let isDatabaseFallback = false

    try {
        claimCases = await claimsService.listRecentClaims(100) as ClaimCase[]
    } catch (error) {
        if (isExpectedDbFallbackError(error)) {
            isDatabaseFallback = true
            if (process.env.NODE_ENV !== 'production') {
                logger.warn({
                    action: 'claim_cases.page.db_query_skipped',
                    error: getDbFallbackErrorMessage(error),
                })
            }
        } else {
            logger.error({
                action: 'claim_cases.page.db_query_failed',
                error: getDbFallbackErrorMessage(error),
            })
        }
    }

    return (
        <div className="min-h-screen pt-20">
            <section className="px-6 py-12">
                <div className="mx-auto max-w-4xl text-center">
                    <Breadcrumbs />
                    <span className="mt-4 mb-4 inline-flex items-center gap-2 rounded-full border-primary-500/30 px-4 py-2 text-sm font-medium text-primary-500 glass">
                        {t('badge')}
                    </span>
                    <h1 className="mb-4 font-display text-3xl font-bold text-theme-primary">
                        {t('title')}
                    </h1>
                    <p className="text-theme-secondary">
                        {t('subtitle')}
                    </p>
                </div>
            </section>

            <section className="px-6 py-12">
                <div className="mx-auto max-w-4xl space-y-6">
                    {claimCases.length === 0 && (
                        <Card className="border border-default">
                            <div className="space-y-3 text-center">
                                <h2 className="font-display text-xl font-semibold text-theme-primary">
                                    {isDatabaseFallback ? t('emptyTitleFallback') : t('emptyTitleNoCases')}
                                </h2>
                                <p className="text-theme-secondary">
                                    {isDatabaseFallback
                                        ? t('emptyDescriptionFallback')
                                        : t('emptyDescriptionNoCases')}
                                </p>
                            </div>
                        </Card>
                    )}

                    {claimCases.map((caseItem) => (
                        <Card
                            key={caseItem.id}
                            hover
                            className={`border-l-4 ${verdictStyles[caseItem.status as keyof typeof verdictStyles] || verdictStyles.rejected}`}
                        >
                            <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <span className="mb-2 inline-block rounded-lg px-2 py-1 text-xs uppercase text-theme-secondary glass">
                                        {caseItem.category}
                                    </span>
                                    <h3 className="font-display text-lg font-semibold text-theme-primary">{caseItem.title}</h3>
                                </div>
                                <div
                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${verdictStyles[caseItem.status as keyof typeof verdictStyles] || verdictStyles.rejected}`}
                                >
                                    {caseItem.status === 'approved' && <><CheckCircle className="h-4 w-4" /> {t('approved')}</>}
                                    {caseItem.status === 'rejected' && <><XCircle className="h-4 w-4" /> {t('rejected')}</>}
                                    {caseItem.status === 'partial' && <><AlertTriangle className="h-4 w-4" /> {t('partial')}</>}
                                </div>
                            </div>

                            <p className="mb-4 text-theme-secondary">{caseItem.issue}</p>

                            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-primary-500/10 pt-4">
                                <div>
                                    <span className="text-sm text-theme-muted">{t('claimAmount')} </span>
                                    <span className="font-medium text-theme-primary">Rs {caseItem.amount.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex items-start gap-2 text-sm">
                                    <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                                    <div>
                                        <span className="font-medium text-accent">{t('lesson')} </span>
                                        <span className="text-theme-secondary">{caseItem.lesson}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>

            <section className="px-6 py-12">
                <div className="mx-auto max-w-4xl text-center">
                    <Link
                        href="/tools/hidden-facts"
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-accent px-6 py-3 font-medium text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow"
                    >
                        <Search className="h-4 w-4" />
                        {t('viewHiddenFacts')}
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>
        </div>
    )
}
