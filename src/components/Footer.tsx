'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import {
    Briefcase,
    Camera,
    ArrowUpRight,
    CheckCircle,
    Coffee,
    Globe,
    Loader2,
    Lock,
    Mail,
    MapPin,
    Send,
    ShieldCheck,
} from 'lucide-react'
import { subscribeToNewsletter } from '@/app/actions/newsletter-actions'
import { cn } from '@/lib/utils'

const navigationSections = [
    {
        key: 'insuranceTypes',
        links: [
            { href: '/insurance/life', key: 'lifeInsurance' },
            { href: '/insurance/health', key: 'healthInsurance' },
            { href: '/insurance/motor', key: 'motorInsurance' },
            { href: '/insurance/home', key: 'homeInsurance' },
            { href: '/insurance/travel', key: 'travelInsurance' },
            { href: '/insurance/specialized', key: 'specializedInsurance' },
            { href: '/insurance/personal-accident', key: 'personalAccident' },
        ],
    },
    {
        key: 'advancedTools',
        links: [
            { href: '/tools/hidden-facts', key: 'hiddenFacts' },
            { href: '/tools/compare', key: 'comparePolicies' },
            { href: '/tools/calculator', key: 'premiumCalculator' },
            { href: '/tools/claim-cases', key: 'claimCases' },
        ],
    },
    {
        key: 'company',
        links: [
            { href: '/hubs', key: 'knowledgeHubs' },
            { href: '/resources', key: 'resourcesAndGuides' },
            { href: '/contact', key: 'contact' },
            { href: '/privacy', key: 'privacyPolicy' },
            { href: '/terms', key: 'termsOfService' },
            { href: '/cookies', key: 'cookiePolicy' },
        ],
    },
] as const

const socialLinks = [
    { href: 'https://twitter.com/insuranceclarity', key: 'twitter', icon: Send },
    { href: 'https://www.linkedin.com/company/insuranceclarity', key: 'linkedIn', icon: Briefcase },
    { href: 'https://www.instagram.com/insuranceclarity', key: 'instagram', icon: Camera },
] as const

const trustPrinciples = [
    'independentResearch',
    'noInsurerCommissions',
    'indiaFocusedPolicyIntelligence',
] as const

const officialResources = [
    { href: 'https://bimabharosa.irdai.gov.in', key: 'bimaBharosa' },
    { href: 'https://irdai.gov.in', key: 'irdaiOfficial' },
] as const

export default function Footer() {
    const t = useTranslations('footerExtended')

    return (
        <footer
            className="relative mt-auto overflow-hidden border-t border-default text-theme-primary"
            style={{ backgroundImage: 'var(--footer-gradient)' }}
        >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/45 to-transparent" />
            <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[42rem] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />

            <div className="relative mx-auto max-w-[96rem] px-6 py-16 md:px-8 md:py-20">
                <div
                    className="rounded-[2.25rem] border border-default/80 p-8 backdrop-blur-xl md:p-10 xl:p-12"
                    style={{
                        background: 'var(--footer-panel-bg)',
                        boxShadow: 'var(--footer-panel-shadow)',
                    }}
                >
                    <div className="grid items-start gap-10 xl:grid-cols-[1.1fr_0.86fr_0.86fr_0.86fr_1.08fr] xl:gap-10 2xl:gap-12">
                        <section className="max-w-lg">
                            <Link href="/" className="interactive-focus inline-flex items-center gap-3 rounded-2xl">
                                <div
                                    className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-default/70"
                                    style={{ background: 'var(--footer-chip-bg)' }}
                                >
                                    <Image
                                        src="/logo.png"
                                        alt={t('brand.logoAlt')}
                                        width={48}
                                        height={48}
                                        className="object-contain"
                                    />
                                </div>
                                <span className="font-display text-2xl font-bold tracking-tight text-theme-primary">
                                    {t('brand.namePrefix')}<span className="text-accent">{t('brand.nameSuffix')}</span>
                                </span>
                            </Link>

                            <div className="mt-5 inline-flex items-center rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-accent sm:whitespace-nowrap">
                                {t('brand.badge')}
                            </div>

                            <p className="mt-5 max-w-md text-[15px] leading-8 text-theme-secondary">
                                {t('brand.description')}
                            </p>

                            <div className="mt-6 flex flex-wrap gap-2.5">
                                {trustPrinciples.map((item) => (
                                    <span
                                        key={item}
                                        className="inline-flex items-center rounded-full border border-default/80 px-3.5 py-1.5 text-xs font-medium text-theme-secondary"
                                        style={{ background: 'var(--footer-chip-bg)' }}
                                    >
                                        {t(`trustPrinciples.${item}`)}
                                    </span>
                                ))}
                            </div>

                            <address className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 not-italic text-sm text-theme-secondary">
                                <span className="inline-flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-accent" aria-hidden="true" />
                                    {t('contact.india')}
                                </span>
                                <a
                                    href="mailto:contact@insuranceclarity.in"
                                    className="interactive-focus inline-flex items-center gap-2 rounded-lg transition-colors duration-200 hover:text-accent"
                                >
                                    <Mail className="h-4 w-4 text-accent" aria-hidden="true" />
                                    {t('contact.email')}
                                </a>
                                <span className="inline-flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-accent" aria-hidden="true" />
                                    {t('contact.website')}
                                </span>
                            </address>

                            <div className="mt-8 flex items-center gap-3">
                                {socialLinks.map(({ href, key, icon: Icon }) => (
                                    <a
                                        key={href}
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={t('social.followAria', { platform: t(`social.platforms.${key}`) })}
                                        className="interactive-focus inline-flex h-11 w-11 items-center justify-center rounded-full border border-default/80 text-theme-secondary transition-[color,background-color,border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-accent/35 hover:bg-accent/10 hover:text-accent"
                                        style={{
                                            background: 'var(--footer-chip-bg)',
                                            boxShadow: 'var(--footer-card-shadow)',
                                        }}
                                    >
                                        <Icon className="h-4 w-4" aria-hidden="true" />
                                    </a>
                                ))}
                            </div>
                        </section>

                                {navigationSections.map((section) => (
                            <nav key={section.key} aria-label={t(`navigation.sections.${section.key}.title`)}>
                                <h2 className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.14em] text-theme-muted">
                                    {t(`navigation.sections.${section.key}.title`)}
                                </h2>
                                <ul className="mt-5 space-y-3">
                                    {section.links.map((link) => (
                                        <li key={link.href}>
                                            <Link
                                                href={link.href}
                                                className="interactive-focus group inline-flex items-center gap-2 rounded-lg text-sm text-theme-secondary transition-[color,transform] duration-200 hover:translate-x-0.5 hover:text-theme-primary"
                                            >
                                                <span className="h-1.5 w-1.5 rounded-full bg-accent/60 transition-colors duration-200 group-hover:bg-accent" />
                                                <span>{t(`navigation.sections.${section.key}.links.${link.key}`)}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        ))}

                        <section
                            className="rounded-[1.9rem] border border-default/80 p-6 xl:justify-self-end xl:p-7"
                            style={{
                                background: 'var(--footer-card-bg)',
                                boxShadow: 'var(--footer-card-shadow)',
                            }}
                        >
                            <div className="inline-flex items-center rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">
                                {t('newsletter.badge')}
                            </div>

                            <h2 className="mt-4 max-w-[10ch] text-balance font-display text-[1.85rem] font-bold leading-[1.02] text-theme-primary">
                                {t('newsletter.title')}
                            </h2>
                            <p className="mt-3 max-w-[28rem] text-[15px] leading-7 text-theme-secondary">
                                {t('newsletter.description')}
                            </p>

                            <div className="mt-5 grid gap-2.5 text-sm font-medium text-theme-secondary">
                                <span className="inline-flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-accent" aria-hidden="true" />
                                    {t('newsletter.benefits.noSpam')}
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-accent" aria-hidden="true" />
                                    {t('newsletter.benefits.unsubscribeAnytime')}
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-accent" aria-hidden="true" />
                                    {t('newsletter.benefits.builtForIndianPolicyholders')}
                                </span>
                            </div>

                            <div className="mt-5">
                                <NewsletterForm />
                            </div>
                        </section>
                    </div>
                </div>

                <div
                    className="mt-8 rounded-[2.25rem] border border-default/80 p-8 backdrop-blur-xl md:p-10 xl:p-12"
                    style={{
                        background: 'var(--footer-panel-bg)',
                        boxShadow: 'var(--footer-panel-shadow)',
                    }}
                >
                    <div className="grid gap-10 xl:grid-cols-[1.45fr_1fr] xl:gap-12">
                        <section>
                            <div className="inline-flex items-center rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                                {t('regulatory.badge')}
                            </div>

                            <h2 className="mt-4 text-balance font-display text-3xl font-bold text-theme-primary">
                                {t('regulatory.title')}
                            </h2>
                            <p className="mt-4 max-w-3xl text-base leading-8 text-theme-primary">
                                {t('regulatory.descriptionPrimary')}
                            </p>
                            <p className="mt-3 max-w-3xl text-base leading-8 text-theme-secondary">
                                {t('regulatory.descriptionSecondary')}
                            </p>
                        </section>

                        <section className="xl:pl-8">
                            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-theme-muted">
                                {t('verification.title')}
                            </h2>

                            <div className="mt-5 flex flex-wrap gap-3">
                                <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                                    {t('verification.badges.sslSecured')}
                                </div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                                    <Lock className="h-4 w-4" aria-hidden="true" />
                                    {t('verification.badges.dataEncrypted')}
                                </div>
                            </div>

                            <div
                                className="mt-6 rounded-[1.6rem] border border-default/80 p-5"
                                style={{
                                    background: 'var(--footer-chip-bg)',
                                    boxShadow: 'var(--footer-card-shadow)',
                                }}
                            >
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-theme-muted">
                                    {t('verification.officialResources')}
                                </p>
                                <div className="mt-4 flex flex-wrap gap-3">
                                    {officialResources.map((resource) => (
                                        <a
                                            key={resource.key}
                                            href={resource.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="interactive-focus inline-flex items-center gap-2 rounded-full border border-default/80 px-4 py-2 text-sm text-theme-secondary transition-[color,background-color,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-accent/30 hover:bg-accent/10 hover:text-theme-primary"
                                            style={{ background: 'var(--footer-panel-bg)' }}
                                        >
                                            <span>{t(`officialResources.${resource.key}`)}</span>
                                            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="mt-8 flex flex-col gap-5 border-t border-default/80 pt-6 md:flex-row md:items-center md:justify-between">
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-theme-secondary">
                            <a
                                href="mailto:contact@insuranceclarity.in"
                                className="interactive-focus inline-flex items-center gap-2 rounded-lg transition-colors duration-200 hover:text-accent"
                            >
                                <Mail className="h-4 w-4 text-accent" aria-hidden="true" />
                                {t('contact.email')}
                            </a>
                            <span className="inline-flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-accent" aria-hidden="true" />
                                {t('contact.hqIndia')}
                            </span>
                            <a
                                href="https://buymeacoffee.com/insuranceclarity"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="interactive-focus inline-flex items-center gap-2 rounded-lg transition-colors duration-200 hover:text-accent"
                            >
                                <Coffee className="h-4 w-4 text-accent" aria-hidden="true" />
                                {t('contact.supportIndependentResearch')}
                            </a>
                        </div>

                        <div className="flex flex-col items-start gap-2 text-left md:items-end">
                            <p className="text-sm font-medium text-theme-secondary">
                                {t('copyright', { year: new Date().getFullYear() })}
                            </p>
                            <p className="text-[11px] uppercase tracking-[0.16em] text-theme-muted">
                                {t('craftedForTransparency')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

function NewsletterForm() {
    const t = useTranslations('footerExtended.newsletter.form')
    const [isPending, startTransition] = useTransition()
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    async function action(formData: FormData) {
        setMessage(null)
        startTransition(async () => {
            const result = await subscribeToNewsletter(formData)
            setMessage({ type: result.success ? 'success' : 'error', text: result.message })
        })
    }

    return (
        <form action={action} className="flex flex-col gap-2.5" noValidate>
            <div className="flex flex-col gap-2.5 sm:flex-row">
                <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    spellCheck={false}
                    placeholder={t('placeholder')}
                    className="interactive-focus min-w-0 flex-1 rounded-full border border-default/80 px-5 py-3 text-sm text-theme-primary placeholder:text-theme-muted"
                    style={{
                        background: 'var(--footer-chip-bg)',
                        boxShadow: 'var(--footer-card-shadow)',
                    }}
                    required
                    disabled={isPending || message?.type === 'success'}
                    aria-label={t('emailAriaLabel')}
                />
                <button
                    type="submit"
                    disabled={isPending || message?.type === 'success'}
                    className="interactive-focus inline-flex min-w-[136px] items-center justify-center gap-2 rounded-full border border-accent/25 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(var(--token-accent-rgb),0.28)] transition-[transform,box-shadow,filter] duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_36px_rgba(var(--token-accent-rgb),0.34)] disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ background: 'var(--token-gradient-accent)' }}
                >
                    {isPending ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                            <span>{t('subscribing')}</span>
                        </>
                    ) : message?.type === 'success' ? (
                        <>
                            <CheckCircle className="h-4 w-4" aria-hidden="true" />
                            <span>{t('subscribed')}</span>
                        </>
                    ) : (
                        <span>{t('subscribe')}</span>
                    )}
                </button>
            </div>
            <p className="text-xs text-theme-muted">{t('footnote')}</p>
            <div aria-live="polite">
                {message ? (
                    <p className={cn('text-xs font-medium', message.type === 'success' ? 'text-accent' : 'text-rose-500')}>
                        {message.text}
                    </p>
                ) : null}
            </div>
        </form>
    )
}
