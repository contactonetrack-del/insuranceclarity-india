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

// Phase 11 Week 2: ISR configuration for static about content
export const revalidate = 14400; // 4 hours

export const metadata: Metadata = {
    title: 'About InsuranceClarity India — Our Mission & Story',
    description: 'InsuranceClarity India is an independent, non-commission insurance education platform. We reveal hidden policy terms and help Indian buyers make informed decisions.',
    alternates: { canonical: '/about' },
    openGraph: {
        title: 'About InsuranceClarity India',
        description: 'Our mission: Make insurance transparent for every Indian. Non-commercial, IRDAI-aware education platform.',
        url: 'https://insuranceclarity.in/about',
    },
}

const valueIcons = [Eye, Shield, Heart, TrendingUp] as const
const valueKeys = ['transparency', 'zeroBias', 'consumerFirst', 'dataDriven'] as const
const valueColors = [
    'from-blue-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-600',
]

const statValues = ['500+', '19', '100%', '∞']
const statKeys = ['policiesAnalyzed', 'typesCovered', 'independent', 'freeToUse'] as const

export default async function AboutPage() {
    const t = await getTranslations('about')

    return (
        <div className="min-h-screen pt-20">
            {/* Hero */}
            <section className="py-16 px-6 text-center">
                <div className="max-w-3xl mx-auto">
                    <span className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full 
                                     text-accent text-sm font-medium mb-6">
                        <Shield className="w-4 h-4" aria-hidden="true" />
                        {t('badge')}
                    </span>
                    <h1 className="font-display font-bold text-4xl md:text-5xl text-theme-primary mb-6">
                        {t('title')}{' '}
                        <span className="text-gradient">{t('brandName')}</span>
                    </h1>
                    <p className="text-theme-secondary text-lg leading-relaxed max-w-2xl mx-auto">
                        {t('heroDesc')}
                    </p>
                </div>
            </section>

            {/* Mission statement */}
            <section className="py-12 px-6" aria-label={t('missionTitle')}>
                <div className="max-w-4xl mx-auto">
                    <div className="glass rounded-3xl p-8 md:p-12 border border-accent/20">
                        <h2 className="font-display font-bold text-2xl md:text-3xl text-theme-primary mb-6 text-center">
                            {t('missionTitle')}
                        </h2>
                        <div className="space-y-4 text-theme-secondary leading-relaxed">
                            <p>{t('missionP1')}</p>
                            <p>{t('missionP2')}</p>
                            <p>{t('missionP3')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-16 px-6 bg-theme-secondary" aria-labelledby="values-heading">
                <div className="max-w-5xl mx-auto">
                    <h2 id="values-heading"
                        className="font-display font-bold text-3xl text-theme-primary text-center mb-12">
                        {t('valuesTitle')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {valueKeys.map((key, i) => {
                            const Icon = valueIcons[i]
                            return (
                                <div key={key}
                                    className="glass rounded-2xl p-6 border border-default 
                                               hover:border-hover transition-all duration-300 hover:shadow-lg">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${valueColors[i]}
                                                     flex items-center justify-center mb-4`}>
                                        <Icon className="w-6 h-6 text-white" aria-hidden="true" />
                                    </div>
                                    <h3 className="font-display font-bold text-lg text-theme-primary mb-2">
                                        {t(`values.${key}.title`)}
                                    </h3>
                                    <p className="text-theme-secondary text-sm leading-relaxed">
                                        {t(`values.${key}.desc`)}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 px-6" aria-label="Platform statistics">
                <div className="max-w-5xl mx-auto">
                    <h2 className="font-display font-bold text-3xl text-theme-primary text-center mb-12">
                        {t('statsTitle')}
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {statKeys.map((key, i) => (
                            <div key={key}
                                className="glass rounded-2xl p-6 border border-default text-center
                                           hover:border-hover transition-all duration-300">
                                <p className="font-display font-bold text-3xl text-accent mb-2">
                                    {statValues[i]}
                                </p>
                                <p className="text-theme-muted text-sm leading-relaxed">
                                    {t(`stats.${key}`)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Important disclaimer */}
            <section className="py-8 px-6 bg-theme-secondary" aria-labelledby="disclaimer-heading">
                <div className="max-w-3xl mx-auto">
                    <div className="glass rounded-2xl p-6 border border-amber-500/20 bg-amber-500/5">
                        <h2 id="disclaimer-heading" className="font-bold text-theme-primary mb-3 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-amber-500" aria-hidden="true" />
                            {t('disclaimerTitle')}
                        </h2>
                        <p className="text-theme-secondary text-sm leading-relaxed">
                            {t('disclaimerText')}
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-6 text-center">
                <div className="max-w-xl mx-auto">
                    <h2 className="font-display font-bold text-2xl text-theme-primary mb-4">
                        {t('ctaTitle')}
                    </h2>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/tools/hidden-facts"
                            className="px-6 py-3 rounded-xl font-semibold bg-accent text-white
                                       hover:bg-accent/90 transition-all duration-200 hover:scale-[1.02]">
                            {t('ctaRevealFacts')}
                        </Link>
                        <Link href="/contact"
                            className="px-6 py-3 rounded-xl font-semibold glass border border-default
                                       text-theme-primary hover:border-hover transition-all duration-200 hover:scale-[1.02]">
                            {t('ctaContact')}
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}
