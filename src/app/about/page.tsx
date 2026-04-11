/**
 * About Page
 *
 * Phase 11 Week 2: Implements ISR for improved performance.
 * Revalidates every 4 hours since content rarely changes.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { Shield, Eye, Heart, TrendingUp } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { resolveToneSurfaceClass, type Tone } from '@/lib/theme/tone'

// Phase 11 Week 2: ISR configuration for static about content
export const revalidate = 14400 // 4 hours

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('about')

    return {
        title: t('metadata.title'),
        description: t('metadata.description'),
        alternates: { canonical: '/about' },
        openGraph: {
            title: t('metadata.openGraphTitle'),
            description: t('metadata.openGraphDescription'),
            url: 'https://insuranceclarity.in/about',
        },
    }
}

const valueIcons = [Eye, Shield, Heart, TrendingUp] as const
const valueKeys = ['transparency', 'zeroBias', 'consumerFirst', 'dataDriven'] as const
const valueTones: Tone[] = ['brand', 'success', 'danger', 'warning']

const statValues = ['500+', '19', '100%', '∞']
const statKeys = ['policiesAnalyzed', 'typesCovered', 'independent', 'freeToUse'] as const

export default async function AboutPage() {
    const t = await getTranslations('about')

    return (
        <div className="min-h-screen pt-20">
            {/* Hero */}
            <section className="px-6 py-16 text-center">
                <div className="mx-auto max-w-3xl">
                    <span
                        className="glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 
                                     text-sm font-medium text-accent"
                    >
                        <Shield className="h-4 w-4" aria-hidden="true" />
                        {t('badge')}
                    </span>
                    <h1 className="font-display mb-6 text-4xl font-bold text-theme-primary md:text-5xl">
                        {t('title')}{' '}
                        <span className="text-gradient">{t('brandName')}</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg leading-relaxed text-theme-secondary">
                        {t('heroDesc')}
                    </p>
                </div>
            </section>

            {/* Mission statement */}
            <section className="px-6 py-12" aria-label={t('missionTitle')}>
                <div className="mx-auto max-w-4xl">
                    <div className="glass rounded-3xl border border-accent/20 p-8 md:p-12">
                        <h2 className="font-display mb-6 text-center text-2xl font-bold text-theme-primary md:text-3xl">
                            {t('missionTitle')}
                        </h2>
                        <div className="space-y-4 leading-relaxed text-theme-secondary">
                            <p>{t('missionP1')}</p>
                            <p>{t('missionP2')}</p>
                            <p>{t('missionP3')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="bg-theme-tertiary/25 px-6 py-16" aria-labelledby="values-heading">
                <div className="mx-auto max-w-5xl">
                    <h2 id="values-heading" className="font-display mb-12 text-center text-3xl font-bold text-theme-primary">
                        {t('valuesTitle')}
                    </h2>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {valueKeys.map((key, i) => {
                            const Icon = valueIcons[i]
                            return (
                                <div
                                    key={key}
                                    className="glass rounded-2xl border border-default p-6 transition-all duration-300 hover:border-hover hover:shadow-lg"
                                >
                                    <div
                                        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl border ${resolveToneSurfaceClass(valueTones[i], 'gradient')}`}
                                    >
                                        <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                                    </div>
                                    <h3 className="font-display mb-2 text-lg font-bold text-theme-primary">
                                        {t(`values.${key}.title`)}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-theme-secondary">
                                        {t(`values.${key}.desc`)}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="px-6 py-16" aria-label={t('statsAriaLabel')}>
                <div className="mx-auto max-w-5xl">
                    <h2 className="font-display mb-12 text-center text-3xl font-bold text-theme-primary">
                        {t('statsTitle')}
                    </h2>
                    <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                        {statKeys.map((key, i) => (
                            <div
                                key={key}
                                className="glass rounded-2xl border border-default p-6 text-center transition-all duration-300 hover:border-hover"
                            >
                                <p className="font-display mb-2 text-3xl font-bold text-accent">
                                    {statValues[i]}
                                </p>
                                <p className="text-sm leading-relaxed text-theme-muted">
                                    {t(`stats.${key}`)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Important disclaimer */}
            <section className="bg-theme-tertiary/25 px-6 py-8" aria-labelledby="disclaimer-heading">
                <div className="mx-auto max-w-3xl">
                    <div className={`glass rounded-2xl border p-6 ${resolveToneSurfaceClass('warning', 'soft')}`}>
                        <h2 id="disclaimer-heading" className="mb-3 flex items-center gap-2 font-bold text-theme-primary">
                            <Shield className="h-5 w-5 text-warning-500" aria-hidden="true" />
                            {t('disclaimerTitle')}
                        </h2>
                        <p className="text-sm leading-relaxed text-theme-secondary">
                            {t('disclaimerText')}
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-6 py-16 text-center">
                <div className="mx-auto max-w-xl">
                    <h2 className="font-display mb-4 text-2xl font-bold text-theme-primary">
                        {t('ctaTitle')}
                    </h2>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link
                            href="/tools/hidden-facts"
                            className="rounded-xl bg-accent px-6 py-3 font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-accent/90"
                        >
                            {t('ctaRevealFacts')}
                        </Link>
                        <Link
                            href="/contact"
                            className="glass rounded-xl border border-default px-6 py-3 font-semibold text-theme-primary transition-all duration-200 hover:scale-[1.02] hover:border-hover"
                        >
                            {t('ctaContact')}
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}
