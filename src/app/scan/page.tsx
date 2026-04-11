import type { Metadata } from 'next'
import { DropZone } from '@/components/upload/DropZone'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('scan.metadata')

    return {
        title: t('title'),
        description: t('description'),
        openGraph: {
            title: t('openGraphTitle'),
            description: t('openGraphDescription'),
        },
    }
}

export default async function ScanPage() {
    const t = await getTranslations('scan')

    const policyTypes = [
        { icon: '🏥', key: 'health' as const },
        { icon: '🚗', key: 'motor' as const },
        { icon: '🛡️', key: 'termLife' as const },
        { icon: '🏠', key: 'home' as const },
        { icon: '✈️', key: 'travel' as const },
        { icon: '💼', key: 'business' as const },
    ]

    const trustItems = [
        { icon: '🔒', title: t('trust.encrypted'), description: t('trust.encryptedDesc') },
        { icon: '🗑️', title: t('trust.autoDeleted'), description: t('trust.autoDeletedDesc') },
        { icon: '⚡', title: t('trust.fastResults'), description: t('trust.fastResultsDesc') },
        { icon: '🇮🇳', title: t('trust.indiaFirst'), description: t('trust.indiaFirstDesc') },
    ]

    return (
        <section className="min-h-screen bg-[var(--gradient-bg)] px-4 pb-20 pt-12" aria-label={t('title')}>
            <div className="mx-auto flex max-w-[760px] flex-col gap-10">
                <header className="animate-[fade-in-up_var(--motion-medium)_var(--ease-out-expo)] text-center">
                    <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[rgb(var(--token-brand)_/_0.2)] bg-[rgb(var(--token-brand)_/_0.1)] px-3.5 py-1.5 text-[0.8125rem] font-semibold tracking-[0.02em] text-[rgb(var(--token-brand))] dark:border-[rgb(var(--token-brand)_/_0.3)] dark:bg-[rgb(var(--token-brand)_/_0.15)] dark:text-[rgb(var(--token-brand-soft))]">
                        <span aria-hidden>🤖</span> {t('badge')}
                    </div>
                    <h1 className="mb-3 text-[clamp(2rem,5vw,2.75rem)] font-extrabold leading-[1.15] tracking-[-0.03em] text-[rgb(var(--color-text-primary))]">
                        {t('title')}
                    </h1>
                    <p className="mx-auto max-w-[560px] text-[1.0625rem] leading-[1.65] text-[rgb(var(--color-text-secondary))]">
                        {t('subtitle')}
                    </p>
                </header>

                <section
                    aria-label={t('upload.title')}
                    className="animate-[fade-in-up_var(--motion-medium)_var(--ease-out-expo)] [animation-delay:80ms] [animation-fill-mode:both]"
                >
                    <DropZone />
                </section>

                <section
                    className="animate-[fade-in-up_var(--motion-medium)_var(--ease-out-expo)] [animation-delay:160ms] [animation-fill-mode:both]"
                    aria-label={t('aria.securityAndPrivacy')}
                >
                    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
                        {trustItems.map((item) => (
                            <div
                                key={item.title}
                                className="border-default flex flex-col items-center gap-2 rounded-md border bg-[rgba(var(--color-card-bg),0.7)] px-3 py-4 text-center backdrop-blur-[12px] transition-transform duration-200 hover:-translate-y-0.5 hover:border-[var(--border-hover)]"
                            >
                                <span className="text-2xl" aria-hidden>
                                    {item.icon}
                                </span>
                                <div>
                                    <strong className="mb-0.5 block text-xs font-bold text-[rgb(var(--color-text-primary))]">{item.title}</strong>
                                    <p className="m-0 text-[0.6875rem] leading-[1.5] text-[rgb(var(--color-text-muted))]">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section
                    className="animate-[fade-in-up_var(--motion-medium)_var(--ease-out-expo)] text-center [animation-delay:240ms] [animation-fill-mode:both]"
                    aria-label={t('policyTypes.heading')}
                >
                    <h2 className="mb-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-[rgb(var(--color-text-muted))]">{t('policyTypes.heading')}</h2>
                    <ul className="m-0 flex list-none flex-wrap justify-center gap-2 p-0" role="list">
                        {policyTypes.map((policy) => (
                            <li
                                key={policy.key}
                                className="border-default inline-flex items-center gap-1.5 rounded-full border bg-[rgba(var(--color-card-bg),0.8)] px-3.5 py-[7px] text-[0.8125rem] font-medium text-[rgb(var(--color-text-secondary))] transition-transform duration-200 hover:scale-105 hover:border-[var(--border-hover)] hover:bg-[rgba(var(--color-accent),0.05)]"
                            >
                                <span aria-hidden>{policy.icon}</span> {t(`policyTypes.${policy.key}`)}
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </section>
    )
}
