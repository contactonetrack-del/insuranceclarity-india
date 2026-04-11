import type { Metadata } from 'next'
import { Cookie, Settings, BarChart3, Shield } from 'lucide-react'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('cookiePolicyPage.metadata')

    return {
        title: t('title'),
        description: t('description'),
    }
}

export default async function CookiePolicyPage() {
    const t = await getTranslations('cookiePolicyPage')

    const essentialRows = [
        {
            key: 'theme_preference',
            purpose: t('sections.cookiesUse.essential.table.rows.themePreference.purpose'),
            lifespan: t('sections.cookiesUse.essential.table.rows.themePreference.lifespan'),
            consent: t('sections.cookiesUse.essential.table.rows.themePreference.consent'),
        },
        {
            key: 'cookie_consent',
            purpose: t('sections.cookiesUse.essential.table.rows.cookieConsent.purpose'),
            lifespan: t('sections.cookiesUse.essential.table.rows.cookieConsent.lifespan'),
            consent: t('sections.cookiesUse.essential.table.rows.cookieConsent.consent'),
        },
    ]

    const analyticsRows = [
        {
            key: '_ga',
            provider: t('sections.cookiesUse.analytics.table.rows.ga.provider'),
            purpose: t('sections.cookiesUse.analytics.table.rows.ga.purpose'),
            lifespan: t('sections.cookiesUse.analytics.table.rows.ga.lifespan'),
        },
        {
            key: '_ga_*',
            provider: t('sections.cookiesUse.analytics.table.rows.gaWildcard.provider'),
            purpose: t('sections.cookiesUse.analytics.table.rows.gaWildcard.purpose'),
            lifespan: t('sections.cookiesUse.analytics.table.rows.gaWildcard.lifespan'),
        },
        {
            key: '_gat',
            provider: t('sections.cookiesUse.analytics.table.rows.gat.provider'),
            purpose: t('sections.cookiesUse.analytics.table.rows.gat.purpose'),
            lifespan: t('sections.cookiesUse.analytics.table.rows.gat.lifespan'),
        },
    ]

    const browserOptions = [
        t('sections.managingPreferences.browserSettings.options.chrome'),
        t('sections.managingPreferences.browserSettings.options.safari'),
        t('sections.managingPreferences.browserSettings.options.firefox'),
        t('sections.managingPreferences.browserSettings.options.edge'),
    ]

    const notEmbedded = [
        t('sections.thirdPartyDisclosure.notEmbedded.socialPixels'),
        t('sections.thirdPartyDisclosure.notEmbedded.adNetworks'),
        t('sections.thirdPartyDisclosure.notEmbedded.crmTracking'),
    ]

    const onlyTrackers = [
        t('sections.thirdPartyDisclosure.onlyTrackers.ga4'),
        t('sections.thirdPartyDisclosure.onlyTrackers.posthog'),
        t('sections.thirdPartyDisclosure.onlyTrackers.sentry'),
    ]

    const protections = [
        t('sections.dataProtection.items.piiBlocking'),
        t('sections.dataProtection.items.ipAnonymization'),
        t('sections.dataProtection.items.dataMinimization'),
        t('sections.dataProtection.items.secureTransmission'),
    ]

    return (
        <div className="min-h-screen pb-16 pt-20">
            <div className="mx-auto max-w-4xl px-6">
                <header className="mb-12 text-center">
                    <div
                        className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-sm
                                   font-medium text-accent"
                    >
                        <Cookie className="h-4 w-4" aria-hidden="true" />
                        {t('badge')}
                    </div>
                    <h1 className="font-display mb-4 text-3xl font-bold text-theme-primary md:text-4xl">
                        {t('title')}
                    </h1>
                    <p className="text-theme-secondary">
                        {t('lastUpdatedLabel')}: {t('lastUpdatedDate')}
                    </p>
                </header>

                <article className="prose prose-lg max-w-none space-y-8 dark:prose-invert">
                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">{t('sections.whatAreCookies.title')}</h2>
                        <p className="text-theme-secondary">{t('sections.whatAreCookies.description')}</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">{t('sections.cookiesUse.title')}</h2>

                        <h3 className="mt-6 flex items-center gap-2 text-lg font-medium text-theme-primary">
                            <Shield className="h-5 w-5 text-success-500" aria-hidden="true" />
                            {t('sections.cookiesUse.essential.title')}
                        </h3>
                        <p className="text-theme-secondary">{t('sections.cookiesUse.essential.description')}</p>
                        <div className="overflow-x-auto">
                            <table className="w-full rounded-lg border border-default text-sm">
                                <thead className="bg-theme-surface">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-theme-primary">
                                            {t('sections.cookiesUse.essential.table.headers.cookieName')}
                                        </th>
                                        <th className="px-4 py-2 text-left text-theme-primary">
                                            {t('sections.cookiesUse.essential.table.headers.purpose')}
                                        </th>
                                        <th className="px-4 py-2 text-left text-theme-primary">
                                            {t('sections.cookiesUse.essential.table.headers.lifespan')}
                                        </th>
                                        <th className="px-4 py-2 text-left text-theme-primary">
                                            {t('sections.cookiesUse.essential.table.headers.consent')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="text-theme-secondary">
                                    {essentialRows.map((row) => (
                                        <tr key={row.key} className="border-t border-default">
                                            <td className="px-4 py-2 font-mono text-xs">{row.key}</td>
                                            <td className="px-4 py-2">{row.purpose}</td>
                                            <td className="px-4 py-2">{row.lifespan}</td>
                                            <td className="px-4 py-2">{row.consent}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <h3 className="mt-6 flex items-center gap-2 text-lg font-medium text-theme-primary">
                            <BarChart3 className="h-5 w-5 text-info-500" aria-hidden="true" />
                            {t('sections.cookiesUse.analytics.title')}
                        </h3>
                        <p className="text-theme-secondary">{t('sections.cookiesUse.analytics.description')}</p>
                        <div className="overflow-x-auto">
                            <table className="w-full rounded-lg border border-default text-sm">
                                <thead className="bg-theme-surface">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-theme-primary">
                                            {t('sections.cookiesUse.analytics.table.headers.cookieName')}
                                        </th>
                                        <th className="px-4 py-2 text-left text-theme-primary">
                                            {t('sections.cookiesUse.analytics.table.headers.provider')}
                                        </th>
                                        <th className="px-4 py-2 text-left text-theme-primary">
                                            {t('sections.cookiesUse.analytics.table.headers.purpose')}
                                        </th>
                                        <th className="px-4 py-2 text-left text-theme-primary">
                                            {t('sections.cookiesUse.analytics.table.headers.lifespan')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="text-theme-secondary">
                                    {analyticsRows.map((row) => (
                                        <tr key={row.key} className="border-t border-default">
                                            <td className="px-4 py-2 font-mono text-xs">{row.key}</td>
                                            <td className="px-4 py-2">{row.provider}</td>
                                            <td className="px-4 py-2">{row.purpose}</td>
                                            <td className="px-4 py-2">{row.lifespan}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <h3 className="mt-6 text-lg font-medium text-theme-primary">
                            {t('sections.cookiesUse.advertising.title')}
                        </h3>
                        <p className="text-theme-secondary">
                            <strong>{t('sections.cookiesUse.advertising.boldLead')}</strong>{' '}
                            {t('sections.cookiesUse.advertising.description')}
                        </p>
                    </section>

                    <section className="glass rounded-xl p-6">
                        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-theme-primary">
                            <Settings className="h-5 w-5 text-accent" aria-hidden="true" />
                            {t('sections.managingPreferences.title')}
                        </h2>

                        <h3 className="mt-4 text-lg font-medium text-theme-primary">
                            {t('sections.managingPreferences.bannerOption.title')}
                        </h3>
                        <p className="text-theme-secondary">{t('sections.managingPreferences.bannerOption.description')}</p>
                        <ul className="list-disc space-y-1 pl-6 text-theme-secondary">
                            <li>
                                <strong>{t('sections.managingPreferences.bannerOption.items.acceptAllLabel')}</strong>{' '}
                                {t('sections.managingPreferences.bannerOption.items.acceptAllDescription')}
                            </li>
                            <li>
                                <strong>{t('sections.managingPreferences.bannerOption.items.rejectLabel')}</strong>{' '}
                                {t('sections.managingPreferences.bannerOption.items.rejectDescription')}
                            </li>
                            <li>
                                <strong>{t('sections.managingPreferences.bannerOption.items.manageLabel')}</strong>{' '}
                                {t('sections.managingPreferences.bannerOption.items.manageDescription')}
                            </li>
                        </ul>

                        <h3 className="mt-4 text-lg font-medium text-theme-primary">
                            {t('sections.managingPreferences.browserSettings.title')}
                        </h3>
                        <p className="text-theme-secondary">{t('sections.managingPreferences.browserSettings.description')}</p>
                        <ul className="list-disc space-y-1 pl-6 text-theme-secondary">
                            {browserOptions.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                        <p className="mt-2 text-sm text-theme-muted">
                            {t('sections.managingPreferences.browserSettings.note')}
                        </p>

                        <h3 className="mt-4 text-lg font-medium text-theme-primary">
                            {t('sections.managingPreferences.optOut.title')}
                        </h3>
                        <p className="text-theme-secondary">
                            {t('sections.managingPreferences.optOut.descriptionPrefix')}{' '}
                            <a
                                href="https://tools.google.com/dlpage/gaoptout"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-accent hover:underline"
                            >
                                {t('sections.managingPreferences.optOut.linkLabel')}
                            </a>
                            .
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">{t('sections.thirdPartyDisclosure.title')}</h2>
                        <p className="text-theme-secondary">{t('sections.thirdPartyDisclosure.notEmbeddedLead')}</p>
                        <ul className="list-disc space-y-1 pl-6 text-theme-secondary">
                            {notEmbedded.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                        <p className="mt-4 text-theme-secondary">
                            <strong>{t('sections.thirdPartyDisclosure.onlyTrackersLead')}</strong>
                        </p>
                        <ul className="list-disc space-y-1 pl-6 text-theme-secondary">
                            {onlyTrackers.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">{t('sections.dataProtection.title')}</h2>
                        <ul className="list-disc space-y-1 pl-6 text-theme-secondary">
                            {protections.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">{t('sections.changes.title')}</h2>
                        <p className="text-theme-secondary">{t('sections.changes.description')}</p>
                    </section>

                    <section className="glass rounded-xl p-6">
                        <h2 className="mb-4 text-xl font-semibold text-theme-primary">{t('sections.contact.title')}</h2>
                        <p className="text-theme-secondary">{t('sections.contact.description')}</p>
                        <p className="mt-2 text-theme-secondary">
                            {t('sections.contact.emailLabel')}{' '}
                            <a href="mailto:privacy@insuranceclarity.in" className="text-accent hover:underline">
                                privacy@insuranceclarity.in
                            </a>
                        </p>
                        <p className="mt-2 text-sm text-theme-muted">{t('sections.contact.responseTime')}</p>
                    </section>

                    <section className="flex gap-4 pt-4 text-sm">
                        <Link href="/privacy" className="text-accent hover:underline">
                            {t('relatedLinks.privacy')}
                        </Link>
                        <Link href="/terms" className="text-accent hover:underline">
                            {t('relatedLinks.terms')}
                        </Link>
                    </section>
                </article>
            </div>
        </div>
    )
}
