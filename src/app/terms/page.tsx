/**
 * Terms of Service Page
 *
 * Phase 11 Week 2: Implements ISR for improved performance.
 * Revalidates every 24 hours since legal content changes infrequently.
 */

import type { Metadata } from 'next'
import { AlertTriangle, FileText, Mail, Scale } from 'lucide-react'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

// Phase 11 Week 2: ISR configuration for static legal content
export const revalidate = 86400 // 24 hours

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('termsOfServicePage.metadata')

    return {
        title: t('title'),
        description: t('description'),
    }
}

const noticeWhatIsKeys = ['educationalContent', 'comparisonTool', 'informationAggregator'] as const
const noticeWhatIsNotKeys = ['licensedIntermediary', 'insuranceAdvisor', 'distributionPlatform', 'commissionEntity'] as const
const noticeWeDoNotKeys = ['advisePolicyPurchase', 'rankPolicies', 'solicitApplications', 'collectUnderwritingData', 'forwardDataToInsurers', 'earnFinancialBenefit'] as const
const noticeYouMustKeys = ['readPolicy', 'verifyExclusions', 'consultAdvisor', 'confirmEligibility', 'askPremiums'] as const
const serviceProvidesKeys = ['educationalContent', 'informationalTools', 'claimsAndExclusions'] as const
const serviceDoesNotProvideKeys = ['professionalAdvice', 'salesServices', 'personalizedRecommendations', 'claimsServicing'] as const
const professionalAdviceKeys = ['consultAdvisor', 'readPolicyDocs', 'verifyTerms', 'considerCircumstances'] as const
const accuracyKeys = ['productsChange', 'latestOfferings', 'estimatesIndicative', 'comparisonIncomplete'] as const
const liabilityNotLiableKeys = ['indirectDamages', 'directDamages', 'thirdPartyConduct'] as const
const liabilityClaimKeys = ['falseStatement', 'reasonableReliance', 'directLoss', 'causation'] as const
const liabilityCapKeys = ['baselineCap', 'unlimitedIf'] as const
const prohibitedUseKeys = ['unlawfulPurpose', 'scrapeCopy', 'unauthorizedAccess', 'malware', 'misrepresentAffiliation'] as const
const consumerRightsKeys = ['accurateInfo', 'fileComplaint', 'seekCompensation', 'timelyResponse'] as const
const tier1ResponseKeys = ['acknowledgment', 'resolution'] as const
const tier2AuthorityKeys = ['districtForum', 'filingFee', 'timeLimit', 'website'] as const

export default async function TermsPage() {
    const t = await getTranslations('termsOfServicePage')

    return (
        <div className="min-h-screen pt-20 pb-16">
            <div className="max-w-4xl mx-auto px-6">
                <header className="mb-12 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent text-sm rounded-full mb-4 font-medium">
                        <FileText className="w-4 h-4" />
                        {t('badge')}
                    </div>
                    <h1 className="font-display font-bold text-3xl md:text-4xl text-theme-primary mb-4">
                        {t('title')}
                    </h1>
                    <p className="text-theme-secondary">
                        {t('header.lastUpdatedLabel')}: {t('header.lastUpdatedDate')} | {t('header.versionLabel')}: {t('header.versionValue')}
                    </p>
                </header>

                <section className="rounded-xl border-2 border-amber-500/50 bg-amber-500/5 p-6 mb-8">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <div className="text-amber-700 dark:text-amber-300">
                            <h2 className="font-bold text-lg mb-3">{t('notice.title')}</h2>

                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="font-semibold mb-2">{t('notice.whatIs.title')}</p>
                                    <ul className="list-disc pl-4 space-y-1">
                                        {noticeWhatIsKeys.map((key) => (
                                            <li key={key}>{t(`notice.whatIs.items.${key}`)}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <p className="font-semibold mb-2">{t('notice.whatIsNot.title')}</p>
                                    <ul className="list-disc pl-4 space-y-1">
                                        {noticeWhatIsNotKeys.map((key) => (
                                            <li key={key}>{t(`notice.whatIsNot.items.${key}`)}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-amber-500/30">
                                <p className="font-semibold mb-2">{t('notice.weDoNot.title')}</p>
                                <ul className="list-disc pl-4 space-y-1 text-sm">
                                    {noticeWeDoNotKeys.map((key) => (
                                        <li key={key}>{t(`notice.weDoNot.items.${key}`)}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mt-4 pt-4 border-t border-amber-500/30 text-sm">
                                <p className="font-semibold">{t('notice.youMust.title')}</p>
                                <ol className="list-decimal pl-4 space-y-1 mt-2">
                                    {noticeYouMustKeys.map((key) => (
                                        <li key={key}>{t(`notice.youMust.items.${key}`)}</li>
                                    ))}
                                </ol>
                            </div>

                            <div className="mt-4 pt-4 border-t border-amber-500/30 text-sm">
                                <p><strong>{t('notice.complaints.title')}</strong> {t('notice.complaints.description')}</p>
                                <ul className="list-disc pl-4 mt-1">
                                    <li>
                                        {t('notice.complaints.websiteLabel')}{' '}
                                        <a href="https://bimabharosa.irdai.gov.in" target="_blank" className="underline" rel="noreferrer">
                                            {t('notice.complaints.portalLabel')}
                                        </a>{' '}
                                        |{' '}
                                        <a href="https://www.irdai.gov.in" target="_blank" className="underline" rel="noreferrer">
                                            {t('notice.complaints.irdaiLabel')}
                                        </a>
                                    </li>
                                    <li>{t('notice.complaints.emailLine')}</li>
                                    <li>{t('notice.complaints.phoneLine')}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <article className="prose prose-lg dark:prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">{t('sections.acceptance.title')}</h2>
                        <p className="text-theme-secondary">{t('sections.acceptance.description')}</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">{t('sections.natureOfService.title')}</h2>
                        <p className="text-theme-secondary">{t('sections.natureOfService.providesLabel')}</p>
                        <ul className="list-disc pl-6 text-theme-secondary space-y-1">
                            {serviceProvidesKeys.map((key) => (
                                <li key={key}>{t(`sections.natureOfService.provides.${key}`)}</li>
                            ))}
                        </ul>
                        <p className="text-theme-secondary mt-4 font-medium">{t('sections.natureOfService.notProvideLabel')}</p>
                        <ul className="list-disc pl-6 text-theme-secondary space-y-1">
                            {serviceDoesNotProvideKeys.map((key) => (
                                <li key={key}>{t(`sections.natureOfService.notProvide.${key}`)}</li>
                            ))}
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">{t('sections.noProfessionalAdvice.title')}</h2>
                        <p className="text-theme-secondary">{t('sections.noProfessionalAdvice.description')}</p>
                        <p className="text-theme-secondary">{t('sections.noProfessionalAdvice.beforeDecisionLabel')}</p>
                        <ul className="list-disc pl-6 text-theme-secondary space-y-1">
                            {professionalAdviceKeys.map((key) => (
                                <li key={key}>{t(`sections.noProfessionalAdvice.items.${key}`)}</li>
                            ))}
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">{t('sections.accuracy.title')}</h2>
                        <p className="text-theme-secondary">{t('sections.accuracy.description')}</p>
                        <ul className="list-disc pl-6 text-theme-secondary space-y-1">
                            {accuracyKeys.map((key) => (
                                <li key={key}>{t(`sections.accuracy.items.${key}`)}</li>
                            ))}
                        </ul>
                        <p className="text-theme-secondary mt-2">{t('sections.accuracy.disclaimer')}</p>
                    </section>

                    <section className="glass rounded-xl p-6">
                        <h2 className="text-xl font-semibold text-theme-primary mb-4">{t('sections.liability.title')}</h2>

                        <h3 className="text-lg font-medium text-theme-primary">{t('sections.liability.notLiableTitle')}</h3>
                        <p className="text-theme-secondary">{t('sections.liability.notLiableDescription')}</p>
                        <ul className="list-disc pl-6 text-theme-secondary space-y-1">
                            {liabilityNotLiableKeys.map((key) => (
                                <li key={key}>{t(`sections.liability.notLiableItems.${key}`)}</li>
                            ))}
                        </ul>

                        <h3 className="text-lg font-medium text-theme-primary mt-4">{t('sections.liability.claimTitle')}</h3>
                        <p className="text-theme-secondary">{t('sections.liability.claimDescription')}</p>
                        <ol className="list-decimal pl-6 text-theme-secondary space-y-1">
                            {liabilityClaimKeys.map((key) => (
                                <li key={key}>{t(`sections.liability.claimItems.${key}`)}</li>
                            ))}
                        </ol>

                        <h3 className="text-lg font-medium text-theme-primary mt-4">{t('sections.liability.capTitle')}</h3>
                        <p className="text-theme-secondary">{t('sections.liability.capDescription')}</p>
                        <ul className="list-disc pl-6 text-theme-secondary space-y-1">
                            {liabilityCapKeys.map((key) => (
                                <li key={key}>{t(`sections.liability.capItems.${key}`)}</li>
                            ))}
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">{t('sections.intellectualProperty.title')}</h2>
                        <p className="text-theme-secondary">{t('sections.intellectualProperty.description')}</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">{t('sections.prohibitedUses.title')}</h2>
                        <p className="text-theme-secondary">{t('sections.prohibitedUses.description')}</p>
                        <ul className="list-disc pl-6 text-theme-secondary space-y-1">
                            {prohibitedUseKeys.map((key) => (
                                <li key={key}>{t(`sections.prohibitedUses.items.${key}`)}</li>
                            ))}
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">{t('sections.thirdPartyLinks.title')}</h2>
                        <p className="text-theme-secondary">{t('sections.thirdPartyLinks.description')}</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">{t('sections.monetization.title')}</h2>
                        <p className="text-theme-secondary">{t('sections.monetization.currentState')}</p>
                        <p className="text-theme-secondary">{t('sections.monetization.futureDisclosure')}</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">{t('sections.indemnification.title')}</h2>

                        <h3 className="text-lg font-medium text-theme-primary mt-4">{t('sections.indemnification.userTitle')}</h3>
                        <p className="text-theme-secondary">{t('sections.indemnification.userDescription')}</p>
                        <p className="text-theme-secondary">{t('sections.indemnification.userException')}</p>

                        <h3 className="text-lg font-medium text-theme-primary mt-4">{t('sections.indemnification.companyTitle')}</h3>
                        <p className="text-theme-secondary">{t('sections.indemnification.companyDescription')}</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">{t('sections.governingLaw.title')}</h2>
                        <p className="text-theme-secondary">{t('sections.governingLaw.description')}</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-theme-primary">{t('sections.changes.title')}</h2>
                        <p className="text-theme-secondary">{t('sections.changes.description')}</p>
                    </section>

                    <section className="glass rounded-xl p-6">
                        <h2 className="text-xl font-semibold text-theme-primary mb-4 flex items-center gap-2">
                            <Scale className="w-5 h-5 text-accent" />
                            {t('sections.consumerProtection.title')}
                        </h2>

                        <h3 className="text-lg font-medium text-theme-primary">{t('sections.consumerProtection.rightsTitle')}</h3>
                        <p className="text-theme-secondary">{t('sections.consumerProtection.rightsDescription')}</p>
                        <ul className="list-disc pl-6 text-theme-secondary space-y-1">
                            {consumerRightsKeys.map((key) => (
                                <li key={key}>{t(`sections.consumerProtection.rightsItems.${key}`)}</li>
                            ))}
                        </ul>

                        <h3 className="text-lg font-medium text-theme-primary mt-6">{t('sections.consumerProtection.grievanceOfficerTitle')}</h3>
                        <div className="bg-theme-surface rounded-lg p-4 my-4">
                            <p className="font-semibold text-theme-primary mb-3">{t('sections.consumerProtection.tier1.title')}</p>
                            <div className="space-y-2 text-theme-secondary text-sm">
                                <p><strong>{t('sections.consumerProtection.tier1.nameLabel')}</strong> {t('sections.consumerProtection.tier1.nameValue')}</p>
                                <p className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-accent" />
                                    <a href="mailto:grievance@insuranceclarity.in" className="text-accent hover:underline">
                                        grievance@insuranceclarity.in
                                    </a>
                                </p>
                                <p className="text-theme-muted text-sm">{t('sections.consumerProtection.tier1.location')}</p>
                                <div className="mt-3 pt-3 border-t border-default">
                                    <p><strong>{t('sections.consumerProtection.tier1.responseTimeLabel')}</strong></p>
                                    <ul className="list-disc pl-4 mt-1">
                                        {tier1ResponseKeys.map((key) => (
                                            <li key={key}>{t(`sections.consumerProtection.tier1.responseTimes.${key}`)}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="bg-theme-surface rounded-lg p-4 my-4">
                            <p className="font-semibold text-theme-primary mb-3">{t('sections.consumerProtection.tier2.title')}</p>
                            <p className="text-theme-secondary text-sm">{t('sections.consumerProtection.tier2.description')}</p>
                            <ul className="list-disc pl-6 text-theme-secondary space-y-1 text-sm mt-2">
                                {tier2AuthorityKeys.map((key) => (
                                    <li key={key}>{t(`sections.consumerProtection.tier2.items.${key}`)}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-theme-surface rounded-lg p-4 my-4">
                            <p className="font-semibold text-theme-primary mb-3">{t('sections.consumerProtection.tier3.title')}</p>
                            <p className="text-theme-secondary text-sm">{t('sections.consumerProtection.tier3.description')}</p>
                        </div>

                        <h3 className="text-lg font-medium text-theme-primary mt-6">{t('sections.consumerProtection.complaintProcess.title')}</h3>
                        <div className="text-theme-secondary text-sm space-y-3">
                            <p><strong>{t('sections.consumerProtection.complaintProcess.step1Title')}</strong><br />{t('sections.consumerProtection.complaintProcess.step1Body')}</p>
                            <p><strong>{t('sections.consumerProtection.complaintProcess.step2Title')}</strong><br />{t('sections.consumerProtection.complaintProcess.step2Body')}</p>
                            <p><strong>{t('sections.consumerProtection.complaintProcess.step3Title')}</strong><br />{t('sections.consumerProtection.complaintProcess.step3Body')}</p>
                            <p><strong>{t('sections.consumerProtection.complaintProcess.step4Title')}</strong><br />{t('sections.consumerProtection.complaintProcess.step4Body')}</p>
                        </div>

                        <h3 className="text-lg font-medium text-theme-primary mt-6">{t('sections.consumerProtection.refundPolicy.title')}</h3>
                        <p className="text-theme-secondary text-sm">{t('sections.consumerProtection.refundPolicy.description')}</p>
                    </section>

                    <section className="glass rounded-xl p-6 mt-8">
                        <h2 className="text-xl font-semibold text-theme-primary mb-4">{t('sections.contact.title')}</h2>
                        <div className="space-y-2 text-theme-secondary">
                            <p>{t('sections.contact.description')}</p>
                            <p className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-accent" />
                                <a href="mailto:legal@insuranceclarity.in" className="text-accent hover:underline">
                                    legal@insuranceclarity.in
                                </a>
                            </p>
                        </div>
                    </section>

                    <section className="flex gap-4 text-sm pt-4">
                        <Link href="/privacy" className="text-accent hover:underline">
                            {t('relatedLinks.privacy')}
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
