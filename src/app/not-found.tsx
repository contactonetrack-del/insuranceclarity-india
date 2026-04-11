import Link from 'next/link'
import type { Metadata } from 'next'
import { Search, Home, ArrowRight, Shield } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('notFoundPage.metadata')

    return {
        title: t('title'),
        description: t('description'),
        robots: { index: false },
    }
}

const quickLinks = [
    {
        href: '/insurance/life',
        labelKey: 'quickLinks.life.label',
        descriptionKey: 'quickLinks.life.description',
    },
    {
        href: '/insurance/health',
        labelKey: 'quickLinks.health.label',
        descriptionKey: 'quickLinks.health.description',
    },
    {
        href: '/insurance/motor',
        labelKey: 'quickLinks.motor.label',
        descriptionKey: 'quickLinks.motor.description',
    },
    {
        href: '/tools/hidden-facts',
        labelKey: 'quickLinks.hiddenFacts.label',
        descriptionKey: 'quickLinks.hiddenFacts.description',
    },
    {
        href: '/tools/calculator',
        labelKey: 'quickLinks.calculator.label',
        descriptionKey: 'quickLinks.calculator.description',
    },
    {
        href: '/tools/compare',
        labelKey: 'quickLinks.compare.label',
        descriptionKey: 'quickLinks.compare.description',
    },
] as const

export default async function NotFound() {
    const t = await getTranslations('notFoundPage')

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-24">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-3xl glass-strong flex items-center justify-center shadow-premium-lift">
                            <Shield className="w-12 h-12 text-accent opacity-60" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-danger-500
                                        flex items-center justify-center text-white text-xs font-bold shadow-md">
                            404
                        </div>
                    </div>
                </div>

                <h1 className="font-display font-bold text-4xl md:text-5xl text-theme-primary mb-4">
                    {t('title')}
                </h1>
                <p className="text-theme-secondary text-lg max-w-lg mx-auto mb-8">
                    {t('description')}
                </p>

                {/* Primary actions */}
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
                                   bg-accent text-white hover:bg-accent/90 transition-all duration-200
                                   hover:scale-[1.02] active:scale-[0.98] shadow-glow-md"
                    >
                        <Home className="w-4 h-4" />
                        {t('backToHome')}
                    </Link>
                    <Link
                        href="/tools/hidden-facts"
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
                                   glass border border-default text-theme-primary
                                   hover:border-hover transition-all duration-200
                                   hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Search className="w-4 h-4" />
                        {t('exploreTools')}
                    </Link>
                </div>
            </div>

            {/* Quick links */}
            <div className="w-full max-w-3xl">
                <p className="text-center text-sm text-theme-muted mb-6 uppercase tracking-widest font-medium">
                    {t('popularPages')}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {quickLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="flex items-center justify-between p-4 glass rounded-xl
                                       border border-default hover:border-hover
                                       transition-all duration-200 hover:scale-[1.02]
                                       text-theme-primary group"
                        >
                            <div>
                                <p className="font-semibold text-sm">{t(link.labelKey)}</p>
                                <p className="text-xs text-theme-muted mt-0.5">{t(link.descriptionKey)}</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100
                                                    transition-opacity shrink-0 ml-2" />
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
