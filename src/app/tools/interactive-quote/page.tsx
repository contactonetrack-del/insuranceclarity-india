import type { Metadata } from 'next'
import { Check } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import AiChatWizard from '@/components/ui/AiChatWizard'
import Breadcrumbs from '@/components/ui/Breadcrumbs'

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('tools.interactiveQuotePage.metadata')

    return {
        title: t('title'),
        description: t('description'),
    }
}

export default async function InteractiveQuotePage() {
    const t = await getTranslations('tools.interactiveQuotePage')

    return (
        <div className="min-h-screen bg-slate-50 pb-20 pt-24 selection:bg-accent/30 dark:bg-slate-950">
            <div className="mx-auto mb-8 max-w-7xl px-6">
                <Breadcrumbs />
            </div>
            <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
                <div className="animate-fade-in-up space-y-8">
                    <div className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/70 opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent"></span>
                        </span>
                        {t('badge')}
                    </div>

                    <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-theme-primary lg:text-5xl">
                        {t('hero.titleLine1')} <br />
                        <span className="text-gradient hover-gradient">{t('hero.titleGradient')}</span>
                    </h1>

                    <p className="max-w-xl text-lg leading-relaxed text-theme-secondary">
                        {t('hero.descriptionPrefix')} <strong className="text-theme-primary">{t('hero.descriptionHighlight')}</strong>{t('hero.descriptionSuffix')}
                    </p>

                    <ul className="space-y-4 font-medium text-theme-secondary">
                        {[
                            t('benefits.dynamicQuestioning'),
                            t('benefits.serverActions'),
                            t('benefits.pdfGeneration'),
                        ].map((label) => (
                            <li key={label} className="flex items-center gap-3">
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-success-500/25 bg-success-50 text-success-500">
                                    <Check className="h-3.5 w-3.5" />
                                </div>
                                {label}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="animate-fade-in-up lg:pl-8" style={{ animationDelay: '100ms' }}>
                    <div className="relative">
                        <div className="absolute -inset-1 animate-pulse-slow rounded-[2rem] bg-gradient-accent opacity-20 blur dark:opacity-40"></div>
                        <AiChatWizard />
                    </div>
                </div>
            </div>
        </div>
    )
}
