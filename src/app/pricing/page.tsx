/**
 * Pricing Page
 *
 * Phase 11 Week 2: Implements ISR for improved performance.
 * Revalidates every 2 hours since pricing rarely changes.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { Check, X, Zap, Shield, Crown, ChevronRight } from 'lucide-react'
import RazorpayCheckout from '@/components/payment/RazorpayCheckout'
import { getTranslations } from 'next-intl/server'

// Phase 11 Week 2: ISR configuration for static pricing content
export const revalidate = 7200 // 2 hours

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('pricing.metadata')

    return {
        title: t('title'),
        description: t('description'),
        openGraph: {
            title: t('openGraphTitle'),
            description: t('openGraphDescription'),
        },
    }
}

export default async function PricingPage() {
    const t = await getTranslations('pricing')

    const trustKeys = ['noCreditCard', 'refundGuarantee', 'irdaiCompliant', 'policiesScanned'] as const

    const plans = [
        {
            id: 'FREE',
            name: t('plans.free.name'),
            icon: <Shield className="w-6 h-6" />,
            monthlyPrice: 0,
            annualPrice: 0,
            badge: null,
            description: t('plans.free.desc'),
            cta: t('plans.free.cta'),
            ctaHref: '/scan',
            razorpayAmount: null,
            color: 'blue',
            featureKeys: [
                { key: 'scansPerMonth', params: { count: 2 }, included: true },
                { key: 'basicRisk', included: true },
                { key: 'hiddenRisksPreview', params: { count: 3 }, included: true },
                { key: 'saveQuotes', params: { count: 3 }, included: true },
                { key: 'advisorChat', included: false },
                { key: 'fullReport', included: false },
                { key: 'pdfExport', included: false },
                { key: 'comparePolicies', included: false },
                { key: 'bulkScan', included: false },
                { key: 'prioritySupport', included: false },
            ],
        },
        {
            id: 'PRO',
            name: t('plans.pro.name'),
            icon: <Zap className="w-6 h-6" />,
            monthlyPrice: 499,
            annualPrice: 399,
            badge: t('mostPopular'),
            description: t('plans.pro.desc'),
            cta: t('plans.pro.cta'),
            ctaHref: null,
            razorpayAmount: 49900,
            color: 'accent',
            featureKeys: [
                { key: 'scansPerMonth', params: { count: 50 }, included: true },
                { key: 'fullRiskReport', included: true },
                { key: 'allHiddenRisks', included: true },
                { key: 'saveQuotes', params: { count: 100 }, included: true },
                { key: 'advisorChat', included: true },
                { key: 'fullReport', included: true },
                { key: 'pdfExport', included: true },
                { key: 'comparePolicies', included: true },
                { key: 'bulkScan', included: false },
                { key: 'prioritySupport', included: false },
            ],
        },
        {
            id: 'ENTERPRISE',
            name: t('plans.enterprise.name'),
            icon: <Crown className="w-6 h-6" />,
            monthlyPrice: 2999,
            annualPrice: 2399,
            badge: t('bestValue'),
            description: t('plans.enterprise.desc'),
            cta: t('plans.enterprise.cta'),
            ctaHref: '/contact',
            razorpayAmount: null,
            color: 'purple',
            featureKeys: [
                { key: 'unlimitedScans', included: true },
                { key: 'fullRiskReport', included: true },
                { key: 'allHiddenRisks', included: true },
                { key: 'unlimitedQuotes', included: true },
                { key: 'advisorChat', included: true },
                { key: 'fullReport', included: true },
                { key: 'pdfExport', included: true },
                { key: 'comparePolicies', included: true },
                { key: 'bulkScan', included: true },
                { key: 'dedicatedSupport', included: true },
            ],
        },
    ] as const

    const faqCount = 5

    return (
        <main id="main-content" className="pricing-page">
            <section className="pricing-hero">
                <div className="pricing-hero__inner">
                    <div className="pricing-badge">
                        <span aria-hidden="true">💎</span> {t('badge')}
                    </div>
                    <h1 className="pricing-title">{t('title')}</h1>
                    <p className="pricing-subtitle">{t('subtitle')}</p>

                    <div className="pricing-trust-row" role="list">
                        {trustKeys.map((key) => (
                            <div key={key} className="pricing-trust-item" role="listitem">
                                <Check className="w-4 h-4 text-success-500" aria-hidden="true" />
                                <span>{t(`trustItems.${key}`)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="pricing-plans" aria-label={t('aria.pricingPlans')}>
                <div className="pricing-plans__grid">
                    {plans.map((plan) => (
                        <article
                            key={plan.id}
                            className={`pricing-card ${plan.id === 'PRO' ? 'pricing-card--featured' : ''}`}
                            aria-label={t('aria.planLabel', { plan: plan.name })}
                        >
                            {plan.badge && (
                                <div className="pricing-card__badge" aria-label={t('aria.badgeLabel', { badge: plan.badge })}>
                                    {plan.badge}
                                </div>
                            )}

                            <div className="pricing-card__header">
                                <div className={`pricing-card__icon pricing-card__icon--${plan.color}`} aria-hidden="true">
                                    {plan.icon}
                                </div>
                                <h2 className="pricing-card__name">{plan.name}</h2>
                                <p className="pricing-card__desc">{plan.description}</p>
                            </div>

                            <div className="pricing-card__price">
                                {plan.monthlyPrice === 0 ? (
                                    <>
                                        <span className="pricing-card__amount">₹0</span>
                                        <span className="pricing-card__period">{t('free')}</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="pricing-card__amount">₹{plan.monthlyPrice}</span>
                                        <span className="pricing-card__period">{t('perMonth')}</span>
                                    </>
                                )}
                                {plan.annualPrice > 0 && (
                                    <p className="pricing-card__annual">
                                        {t('billed', { price: `₹${plan.annualPrice}` })}{' '}
                                        <span className="pricing-card__annual-save">
                                            {t('save', { amount: `₹${(plan.monthlyPrice - plan.annualPrice) * 12}` })}
                                        </span>
                                    </p>
                                )}
                            </div>

                            <ul className="pricing-card__features" role="list">
                                {plan.featureKeys.map((feature) => (
                                    <li
                                        key={feature.key}
                                        className={`pricing-feature ${feature.included ? 'pricing-feature--yes' : 'pricing-feature--no'}`}
                                    >
                                        {feature.included
                                            ? <Check className="w-4 h-4 shrink-0" aria-label={t('aria.included')} />
                                            : <X className="w-4 h-4 shrink-0" aria-label={t('aria.notIncluded')} />
                                        }
                                        <span>{t(`features.${feature.key}`, 'params' in feature ? feature.params : undefined)}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="pricing-card__cta">
                                {plan.razorpayAmount ? (
                                    <RazorpayCheckout
                                        planId={plan.id as 'PRO' | 'ENTERPRISE'}
                                        amount={plan.razorpayAmount}
                                        label={plan.cta}
                                        variant="hero"
                                        className="w-full"
                                        isSubscription={true}
                                    />
                                ) : (
                                    <Link
                                        href={plan.ctaHref ?? '/scan'}
                                        className={plan.ctaHref === '/scan' ? 'btn-primary w-full justify-center' : 'btn-secondary w-full justify-center'}
                                    >
                                        {plan.cta}
                                        <ChevronRight className="w-4 h-4" aria-hidden="true" />
                                    </Link>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section className="pricing-faq" aria-label={t('aria.faq')}>
                <h2 className="pricing-faq__title">{t('faq.title')}</h2>
                <div className="pricing-faq__grid">
                    {Array.from({ length: faqCount }).map((_, i) => (
                        <div key={i} className="pricing-faq__item">
                            <h3 className="pricing-faq__q">{t(`faq.items.${i}.q`)}</h3>
                            <p className="pricing-faq__a">{t(`faq.items.${i}.a`)}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="pricing-bottom-cta" aria-label={t('aria.getStarted')}>
                <div className="pricing-bottom-cta__inner">
                    <h2 className="pricing-bottom-cta__title">{t('cta.title')}</h2>
                    <p className="pricing-bottom-cta__desc">{t('cta.subtitle')}</p>
                    <Link href="/scan" className="btn-primary text-lg px-8 py-4">
                        {t('cta.button')} <ChevronRight className="w-5 h-5" aria-hidden="true" />
                    </Link>
                </div>
            </section>
        </main>
    )
}
