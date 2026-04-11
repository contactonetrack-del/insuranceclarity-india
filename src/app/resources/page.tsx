'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Download, FileText, ExternalLink, HelpCircle, Search, ArrowRight } from 'lucide-react'
import {
    RevealOnScroll,
    StaggerContainer,
    StaggerItem,
    TiltCard,
    GlassCard,
    AnimatedHeading,
} from '@/components/premium'
import { Button } from '@/components/ui/Button'

interface ResourceItem {
    titleKey: string
    icon: string
    typeKey: string
    href: string
    isDownload?: boolean
    isExternal?: boolean
}

const resources: { categoryKey: string; items: ResourceItem[] }[] = [
    {
        categoryKey: 'guides',
        items: [
            { titleKey: 'items.guides.choosingTermInsurance', icon: '📋', typeKey: 'types.pdfGuide', href: '/PDFs/term-insurance-guide.pdf', isDownload: true },
            { titleKey: 'items.guides.healthInsuranceChecklist', icon: '✅', typeKey: 'types.pdfGuide', href: '/PDFs/health-buying-checklist.pdf', isDownload: true },
            { titleKey: 'items.guides.motorInsuranceClaims', icon: '🚗', typeKey: 'types.pdfGuide', href: '/PDFs/motor-claims-guide.pdf', isDownload: true },
        ],
    },
    {
        categoryKey: 'calculators',
        items: [
            { titleKey: 'items.calculators.lifeInsuranceNeed', icon: '🧮', typeKey: 'types.tool', href: '/tools/calculator' },
            { titleKey: 'items.calculators.healthPremiumEstimator', icon: '🏥', typeKey: 'types.tool', href: '/tools/calculator' },
            { titleKey: 'items.calculators.carIdv', icon: '🚙', typeKey: 'types.tool', href: '/tools/calculator' },
        ],
    },
    {
        categoryKey: 'officialExternal',
        items: [
            { titleKey: 'items.official.irdaiCsr', icon: '📊', typeKey: 'types.external', href: 'https://irdai.gov.in', isExternal: true },
            { titleKey: 'items.official.ombudsmanContacts', icon: '📞', typeKey: 'types.external', href: 'https://www.cioins.co.in/Ombudsman', isExternal: true },
            { titleKey: 'items.official.grievancePortal', icon: '🏛️', typeKey: 'types.external', href: 'https://igms.irda.gov.in', isExternal: true },
        ],
    },
]

const faqs = [
    { questionKey: 'faqs.claimSettlementRatio.question', answerKey: 'faqs.claimSettlementRatio.answer' },
    { questionKey: 'faqs.idv.question', answerKey: 'faqs.idv.answer' },
    { questionKey: 'faqs.multipleHealthPolicies.question', answerKey: 'faqs.multipleHealthPolicies.answer' },
    { questionKey: 'faqs.freeLookPeriod.question', answerKey: 'faqs.freeLookPeriod.answer' },
] as const

export default function ResourcesPage() {
    const t = useTranslations('resourcesPage')

    return (
        <div className="min-h-screen pt-20">
            <section className="relative overflow-hidden px-6 py-16">
                <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary-500/5 to-transparent" />
                <div className="mx-auto max-w-4xl text-center">
                    <RevealOnScroll direction="down">
                        <span className="mb-6 inline-block rounded-full bg-primary-500/10 px-4 py-1.5 text-sm font-semibold text-primary-500">
                            {t('hero.badge')}
                        </span>
                    </RevealOnScroll>

                    <RevealOnScroll direction="up" delay={0.1}>
                        <h1 className="mb-6 font-display text-4xl font-bold text-theme-primary md:text-5xl">
                            <AnimatedHeading text={t('hero.title')} />
                        </h1>
                    </RevealOnScroll>

                    <RevealOnScroll direction="up" delay={0.2}>
                        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-theme-secondary">
                            {t('hero.description')}
                        </p>
                    </RevealOnScroll>
                </div>
            </section>

            <section className="px-6 py-12">
                <div className="mx-auto max-w-6xl">
                    {resources.map((section) => (
                        <div key={section.categoryKey} className="mb-12">
                            <RevealOnScroll>
                                <h2 className="mb-6 flex items-center gap-2 font-display text-2xl font-bold text-theme-primary">
                                    <span className="h-1 w-8 rounded-full bg-gradient-accent" />
                                    {t(`sections.${section.categoryKey}.title`)}
                                </h2>
                            </RevealOnScroll>

                            <StaggerContainer className="grid grid-cols-1 gap-6 md:grid-cols-3" staggerDelay={0.1}>
                                {section.items.map((item, index) => (
                                    <StaggerItem key={`${section.categoryKey}-${index}`} className="h-full">
                                        <TiltCard containerClassName="h-full" className="h-full">
                                            {item.isExternal || item.isDownload ? (
                                                <a
                                                    href={item.href}
                                                    target={item.isExternal ? '_blank' : undefined}
                                                    download={item.isDownload}
                                                    rel={item.isExternal ? 'noopener noreferrer' : undefined}
                                                    className="block h-full"
                                                >
                                                    <GlassCard hover className="group relative h-full cursor-pointer overflow-hidden" padding="md">
                                                        <div className="absolute right-0 top-0 p-4 opacity-50">
                                                            {item.isDownload ? (
                                                                <Download className="h-5 w-5 text-theme-muted transition-colors group-hover:text-accent" />
                                                            ) : (
                                                                <ExternalLink className="h-5 w-5 text-theme-muted transition-colors group-hover:text-accent" />
                                                            )}
                                                        </div>
                                                        <span className="mb-4 block text-4xl drop-shadow-sm">{item.icon}</span>
                                                        <h3 className="mb-2 font-display text-lg font-semibold text-theme-primary transition-colors group-hover:text-accent">
                                                            {t(item.titleKey)}
                                                        </h3>
                                                        <span className="inline-flex items-center gap-1.5 rounded-md bg-accent/5 px-2 py-1 text-sm font-medium text-theme-secondary">
                                                            <FileText className="h-3 w-3" /> {t(item.typeKey)}
                                                        </span>
                                                    </GlassCard>
                                                </a>
                                            ) : (
                                                <Link href={item.href} className="block h-full">
                                                    <GlassCard hover className="group relative h-full cursor-pointer overflow-hidden" padding="md">
                                                        <div className="absolute right-0 top-0 p-4 opacity-50">
                                                            <ArrowRight className="h-5 w-5 text-theme-muted transition-colors group-hover:text-accent" />
                                                        </div>
                                                        <span className="mb-4 block text-4xl drop-shadow-sm">{item.icon}</span>
                                                        <h3 className="mb-2 font-display text-lg font-semibold text-theme-primary transition-colors group-hover:text-accent">
                                                            {t(item.titleKey)}
                                                        </h3>
                                                        <span className="inline-flex items-center gap-1.5 rounded-md bg-accent/5 px-2 py-1 text-sm font-medium text-theme-secondary">
                                                            <FileText className="h-3 w-3" /> {t(item.typeKey)}
                                                        </span>
                                                    </GlassCard>
                                                </Link>
                                            )}
                                        </TiltCard>
                                    </StaggerItem>
                                ))}
                            </StaggerContainer>
                        </div>
                    ))}
                </div>
            </section>

            <section className="glass-subtle px-6 py-16">
                <div className="mx-auto max-w-4xl">
                    <RevealOnScroll>
                        <h2 className="mb-8 flex items-center gap-3 font-display text-2xl font-bold text-theme-primary">
                            <HelpCircle className="h-7 w-7 text-accent" /> {t('faq.title')}
                        </h2>
                    </RevealOnScroll>

                    <StaggerContainer className="space-y-4" staggerDelay={0.1}>
                        {faqs.map((faq) => (
                            <StaggerItem key={faq.questionKey}>
                                <GlassCard className="transition-colors hover:border-accent/30" padding="md">
                                    <h3 className="mb-2 flex items-start gap-3 font-bold text-theme-primary">
                                        <span className="text-lg text-accent">{t('faq.questionPrefix')}</span> {t(faq.questionKey)}
                                    </h3>
                                    <p className="pl-7 text-sm leading-relaxed text-theme-secondary">
                                        {t(faq.answerKey)}
                                    </p>
                                </GlassCard>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </div>
            </section>

            <section className="px-6 py-16">
                <div className="mx-auto max-w-4xl text-center">
                    <RevealOnScroll>
                        <div className="glass rounded-3xl border border-accent/20 p-8">
                            <h2 className="mb-4 font-display text-2xl font-bold text-theme-primary">{t('cta.title')}</h2>
                            <p className="mx-auto mb-8 max-w-2xl text-theme-secondary">
                                {t('cta.description')}
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <a href="https://igms.irda.gov.in" target="_blank" rel="noopener noreferrer">
                                    <Button variant="secondary" icon={ExternalLink}>
                                        {t('cta.irdaiPortal')}
                                    </Button>
                                </a>
                                <Link href="/tools/hidden-facts">
                                    <Button icon={Search} glow>
                                        {t('cta.hiddenFacts')}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </RevealOnScroll>
                </div>
            </section>
        </div>
    )
}
