/**
 * Privacy Policy Page
 *
 * Phase 11 Week 2: Implements ISR for improved performance.
 * Revalidates every 24 hours since legal content changes infrequently.
 */

import type { Metadata } from 'next'
import { AlertTriangle, Mail, Shield } from 'lucide-react'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

// Phase 11 Week 2: ISR configuration for static legal content
export const revalidate = 86400 // 24 hours

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('privacyPolicyPage.metadata')

    return {
        title: t('title'),
        description: t('description'),
    }
}

const introductionLawKeys = ['itAct', 'dpdp', 'itRules', 'consumerAct'] as const
const principleKeys = ['purposeLimitation', 'dataMinimization', 'storageLimitation', 'accuracy', 'integrityConfidentiality'] as const
const personalDataKeys = ['ipAddress', 'deviceBrowser', 'pagesVisited', 'referrer', 'geoRegion', 'contactData'] as const
const avoidSensitiveDataKeys = ['financialData', 'healthData', 'biometricData', 'casteReligionPolitical', 'governmentIds'] as const
const lawfulBasisKeys = ['analytics', 'errorMonitoring', 'websiteFunctionality', 'grievanceRedressal'] as const
const withdrawConsentKeys = ['managePreferences', 'browserSettings', 'functionalCookiesNote'] as const
const retentionRowKeys = ['analyticsData', 'sentryLogs', 'contactEmails', 'analyticsCookies'] as const
const piiBlockingKeys = ['ageFields', 'personalIdentifiers', 'demographicFields'] as const
const sentryRedactionKeys = ['queryParams', 'requestBody', 'formBreadcrumbs', 'sensitivePatterns'] as const
const securityMeasureKeys = ['encryption', 'piiRedaction', 'accessControl', 'securityHeaders'] as const

export default async function PrivacyPage() {
    const t = await getTranslations('privacyPolicyPage')

    return (
        <div className="min-h-screen pt-20 pb-16">
            <div className="max-w-4xl mx-auto px-6">
                <header className="mb-12 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent text-sm rounded-full mb-4 font-medium">
                        <Shield className="w-4 h-4" />
                        {t('badge')}
                    </div>
                    <h1 className="font-display font-bold text-3xl md:text-4xl text-theme-primary mb-4">
                        {t('title')}
                    </h1>
                    <p className="text-theme-secondary">
                        {t('header.lastUpdatedLabel')}: {t('header.lastUpdatedDate')} | {t('header.versionLabel')}: {t('header.versionValue')}
                    </p>
                </header>

                <article className="prose prose-lg dark:prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">{t('sections.introduction.title')}</h2>
                        <p className="text-theme-secondary">{t('sections.introduction.description')}</p>
                        <ul className="list-disc pl-6 text-theme-secondary space-y-1">
                            {introductionLawKeys.map((key) => (
                                <li key={key}>{t(`sections.introduction.laws.${key}`)}</li>
                            ))}
                        </ul>
                        <p className="text-theme-secondary">{t('sections.introduction.closing')}</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">{t('sections.processingPrinciples.title')}</h2>
                        <p className="text-theme-secondary">{t('sections.processingPrinciples.description')}</p>
                        <ul className="list-disc pl-6 text-theme-secondary space-y-1">
                            {principleKeys.map((key) => (
                                <li key={key}>{t(`sections.processingPrinciples.items.${key}`)}</li>
                            ))}
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">{t('sections.dataCategories.title')}</h2>

                        <h3 className="text-lg font-medium text-theme-primary mt-4">{t('sections.dataCategories.personalData.title')}</h3>
                        <p className="text-theme-secondary">{t('sections.dataCategories.personalData.description')}</p>
                        <ul className="list-disc pl-6 text-theme-secondary space-y-1">
                            {personalDataKeys.map((key) => (
                                <li key={key}>{t(`sections.dataCategories.personalData.items.${key}`)}</li>
                            ))}
                        </ul>

                        <h3 className="text-lg font-medium text-theme-primary mt-4">{t('sections.dataCategories.sensitiveData.title')}</h3>
                        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 my-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-amber-700 dark:text-amber-300">
                                    <p className="font-medium">{t('sections.dataCategories.sensitiveData.warningTitle')}</p>
                                    <ul className="list-disc pl-4 mt-2 space-y-1">
                                        {avoidSensitiveDataKeys.map((key) => (
                                            <li key={key}>{t(`sections.dataCategories.sensitiveData.items.${key}`)}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <p className="text-theme-secondary">
                            <strong>{t('sections.dataCategories.sensitiveData.rationaleLabel')}</strong> {t('sections.dataCategories.sensitiveData.rationaleBody')}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">{t('sections.lawfulBasis.title')}</h2>
                        <ul className="list-disc pl-6 text-theme-secondary space-y-1">
                            {lawfulBasisKeys.map((key) => (
                                <li key={key}>{t(`sections.lawfulBasis.items.${key}`)}</li>
                            ))}
                        </ul>
                    </section>

                    <section className="glass rounded-xl p-6">
                        <h2 className="text-xl font-semibold text-theme-primary mb-4">{t('sections.rights.title')}</h2>

                        <h3 className="text-lg font-medium text-theme-primary mt-4">{t('sections.rights.know.title')}</h3>
                        <p className="text-theme-secondary">
                            <strong>{t('sections.rights.know.requestLabel')}</strong> {t('sections.rights.know.requestValue')}
                        </p>
                        <ul className="list-disc pl-6 text-theme-secondary space-y-1">
                            <li><strong>{t('sections.rights.know.items.responseTimeLabel')}</strong> {t('sections.rights.know.items.responseTimeValue')}</li>
                            <li><strong>{t('sections.rights.know.items.contactLabel')}</strong> {t('sections.rights.know.items.contactValue')}</li>
                            <li><strong>{t('sections.rights.know.items.providedLabel')}</strong> {t('sections.rights.know.items.providedValue')}</li>
                        </ul>

                        <h3 className="text-lg font-medium text-theme-primary mt-4">{t('sections.rights.correction.title')}</h3>
                        <p className="text-theme-secondary">
                            <strong>{t('sections.rights.correction.requestLabel')}</strong> {t('sections.rights.correction.requestValue')}
                        </p>
                        <ul className="list-disc pl-6 text-theme-secondary space-y-1">
                            <li><strong>{t('sections.rights.correction.items.correctableDataLabel')}</strong> {t('sections.rights.correction.items.correctableDataValue')}</li>
                            <li><strong>{t('sections.rights.correction.items.responseTimeLabel')}</strong> {t('sections.rights.correction.items.responseTimeValue')}</li>
                        </ul>

                        <h3 className="text-lg font-medium text-theme-primary mt-4">{t('sections.rights.erasure.title')}</h3>
                        <p className="text-theme-secondary">
                            <strong>{t('sections.rights.erasure.requestLabel')}</strong> {t('sections.rights.erasure.requestValue')}
                        </p>
                        <ul className="list-disc pl-6 text-theme-secondary space-y-1">
                            <li><strong>{t('sections.rights.erasure.items.canDeleteLabel')}</strong> {t('sections.rights.erasure.items.canDeleteValue')}</li>
                            <li><strong>{t('sections.rights.erasure.items.cannotDeleteLabel')}</strong> {t('sections.rights.erasure.items.cannotDeleteValue')}</li>
                            <li><strong>{t('sections.rights.erasure.items.responseTimeLabel')}</strong> {t('sections.rights.erasure.items.responseTimeValue')}</li>
                        </ul>

                        <h3 className="text-lg font-medium text-theme-primary mt-4">{t('sections.rights.withdrawConsent.title')}</h3>
                        <p className="text-theme-secondary">{t('sections.rights.withdrawConsent.description')}</p>
                        <ul className="list-disc pl-6 text-theme-secondary space-y-1">
                            {withdrawConsentKeys.map((key) => (
                                <li key={key}>{t(`sections.rights.withdrawConsent.items.${key}`)}</li>
                            ))}
                        </ul>
                    </section>

                    <section className="glass rounded-xl p-6">
                        <h2 className="text-xl font-semibold text-theme-primary mb-4">{t('sections.grievance.title')}</h2>

                        <h3 className="text-lg font-medium text-theme-primary">{t('sections.grievance.tier1.title')}</h3>
                        <div className="bg-theme-surface rounded-lg p-4 my-4 space-y-2">
                            <p className="flex items-center gap-2 text-theme-secondary">
                                <strong>{t('sections.grievance.tier1.nameLabel')}</strong> {t('sections.grievance.tier1.nameValue')}
                            </p>
                            <p className="flex items-center gap-2 text-theme-secondary">
                                <Mail className="w-4 h-4 text-accent" />
                                <a href="mailto:privacy@insuranceclarity.in" className="text-accent hover:underline">
                                    privacy@insuranceclarity.in
                                </a>
                            </p>
                            <p className="text-theme-secondary">
                                <strong>{t('sections.grievance.tier1.responseTimeLabel')}</strong> {t('sections.grievance.tier1.responseTimeValue')}
                            </p>
                        </div>

                        <h3 className="text-lg font-medium text-theme-primary mt-4">{t('sections.grievance.tier2.title')}</h3>
                        <p className="text-theme-secondary">{t('sections.grievance.tier2.description')}</p>
                        <ul className="list-disc pl-6 text-theme-secondary space-y-1">
                            <li><strong>{t('sections.grievance.tier2.items.contactLabel')}</strong> {t('sections.grievance.tier2.items.contactValue')}</li>
                            <li>
                                <strong>{t('sections.grievance.tier2.items.websiteLabel')}</strong>{' '}
                                <a href="https://www.dpdp.gov.in" target="_blank" className="text-accent hover:underline" rel="noreferrer">
                                    {t('sections.grievance.tier2.items.websiteValue')}
                                </a>
                            </li>
                            <li><strong>{t('sections.grievance.tier2.items.filingFeeLabel')}</strong> {t('sections.grievance.tier2.items.filingFeeValue')}</li>
                            <li><strong>{t('sections.grievance.tier2.items.timeLimitLabel')}</strong> {t('sections.grievance.tier2.items.timeLimitValue')}</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">{t('sections.retention.title')}</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border border-default rounded-lg">
                                <thead className="bg-theme-surface">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-theme-primary">{t('sections.retention.columns.dataType')}</th>
                                        <th className="px-4 py-2 text-left text-theme-primary">{t('sections.retention.columns.retentionPeriod')}</th>
                                        <th className="px-4 py-2 text-left text-theme-primary">{t('sections.retention.columns.reason')}</th>
                                    </tr>
                                </thead>
                                <tbody className="text-theme-secondary">
                                    {retentionRowKeys.map((key) => (
                                        <tr className="border-t border-default" key={key}>
                                            <td className="px-4 py-2">{t(`sections.retention.rows.${key}.dataType`)}</td>
                                            <td className="px-4 py-2">{t(`sections.retention.rows.${key}.retentionPeriod`)}</td>
                                            <td className="px-4 py-2">{t(`sections.retention.rows.${key}.reason`)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">{t('sections.technicalSafeguards.title')}</h2>

                        <h3 className="text-lg font-medium text-theme-primary mt-4">{t('sections.technicalSafeguards.analyticsBlocking.title')}</h3>
                        <p className="text-theme-secondary">{t('sections.technicalSafeguards.analyticsBlocking.description')}</p>
                        <ul className="list-disc pl-6 text-theme-secondary space-y-1">
                            {piiBlockingKeys.map((key) => (
                                <li key={key}>{t(`sections.technicalSafeguards.analyticsBlocking.items.${key}`)}</li>
                            ))}
                        </ul>
                        <p className="text-theme-secondary mt-2">
                            <strong>{t('sections.technicalSafeguards.analyticsBlocking.bucketingLabel')}</strong> {t('sections.technicalSafeguards.analyticsBlocking.bucketingValue')}
                        </p>

                        <h3 className="text-lg font-medium text-theme-primary mt-4">{t('sections.technicalSafeguards.sentryRedaction.title')}</h3>
                        <p className="text-theme-secondary">{t('sections.technicalSafeguards.sentryRedaction.description')}</p>
                        <ul className="list-disc pl-6 text-theme-secondary space-y-1">
                            {sentryRedactionKeys.map((key) => (
                                <li key={key}>{t(`sections.technicalSafeguards.sentryRedaction.items.${key}`)}</li>
                            ))}
                        </ul>

                        <h3 className="text-lg font-medium text-theme-primary mt-4">{t('sections.technicalSafeguards.ipAnonymization.title')}</h3>
                        <p className="text-theme-secondary">{t('sections.technicalSafeguards.ipAnonymization.description')}</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">{t('sections.thirdParty.title')}</h2>
                        <p className="text-theme-secondary">{t('sections.thirdParty.description')}</p>

                        <h3 className="text-lg font-medium text-theme-primary mt-4">{t('sections.thirdParty.ga4.title')}</h3>
                        <p className="text-theme-secondary">
                            {t('sections.thirdParty.ga4.description')}
                            <br />
                            <Link href="https://policies.google.com/privacy" className="text-accent hover:underline" target="_blank">
                                {t('sections.thirdParty.ga4.linkLabel')}
                            </Link>
                        </p>

                        <h3 className="text-lg font-medium text-theme-primary mt-4">{t('sections.thirdParty.posthog.title')}</h3>
                        <p className="text-theme-secondary">
                            {t('sections.thirdParty.posthog.description')}
                            <br />
                            <Link href="https://posthog.com/privacy" className="text-accent hover:underline" target="_blank">
                                {t('sections.thirdParty.posthog.linkLabel')}
                            </Link>
                        </p>

                        <h3 className="text-lg font-medium text-theme-primary mt-4">{t('sections.thirdParty.sentry.title')}</h3>
                        <p className="text-theme-secondary">
                            {t('sections.thirdParty.sentry.description')}
                            <br />
                            <Link href="https://sentry.io/privacy/" className="text-accent hover:underline" target="_blank">
                                {t('sections.thirdParty.sentry.linkLabel')}
                            </Link>
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">{t('sections.cookies.title')}</h2>
                        <p className="text-theme-secondary">
                            {t('sections.cookies.descriptionPrefix')}{' '}
                            <Link href="/cookies" className="text-accent hover:underline">
                                {t('relatedLinks.cookies')}
                            </Link>
                            {t('sections.cookies.descriptionSuffix')}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">{t('sections.securityMeasures.title')}</h2>
                        <p className="text-theme-secondary">{t('sections.securityMeasures.description')}</p>
                        <ul className="list-disc pl-6 text-theme-secondary space-y-1">
                            {securityMeasureKeys.map((key) => (
                                <li key={key}>{t(`sections.securityMeasures.items.${key}`)}</li>
                            ))}
                        </ul>
                        <h3 className="text-lg font-medium text-theme-primary mt-4">{t('sections.securityMeasures.dnt.title')}</h3>
                        <p className="text-theme-secondary">{t('sections.securityMeasures.dnt.description')}</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">{t('sections.changes.title')}</h2>
                        <p className="text-theme-secondary">{t('sections.changes.description')}</p>
                    </section>

                    <section className="glass rounded-xl p-6 mt-8">
                        <h2 className="text-xl font-semibold text-theme-primary mb-4">{t('sections.contact.title')}</h2>
                        <div className="space-y-2 text-theme-secondary">
                            <p><strong>{t('sections.contact.officerLabel')}</strong></p>
                            <p className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-accent" />
                                <a href="mailto:privacy@insuranceclarity.in" className="text-accent hover:underline">
                                    privacy@insuranceclarity.in
                                </a>
                            </p>
                            <p className="text-theme-muted text-sm">{t('sections.contact.location')}</p>
                        </div>
                        <p className="text-theme-muted text-sm mt-4">
                            <strong>{t('sections.contact.responseGuaranteeLabel')}</strong> {t('sections.contact.responseGuaranteeValue')}
                        </p>
                    </section>

                    <section className="flex gap-4 text-sm pt-4">
                        <Link href="/terms" className="text-accent hover:underline">
                            {t('relatedLinks.terms')}
                        </Link>
                        <Link href="/cookies" className="text-accent hover:underline">
                            {t('relatedLinks.cookies')}
                        </Link>
                    </section>
                </article>
            </div>
        </div>
    )
}
