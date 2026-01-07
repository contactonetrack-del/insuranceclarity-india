'use client'

import { FileText, AlertCircle, Gavel } from 'lucide-react'
import { GlassCard } from '@/components/premium'
import LawCitation from '@/components/ui/LawCitation'

export default function TermsPage() {
    return (
        <div className="min-h-screen pt-24 pb-20 px-6">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="font-display font-bold text-4xl md:text-5xl text-theme-primary mb-6">
                        Terms of Service
                    </h1>
                    <p className="text-theme-secondary text-lg max-w-2xl mx-auto">
                        Please read these terms carefully before using InsuranceClarity.
                    </p>
                </div>

                <div className="space-y-12">
                    <section>
                        <h2 className="font-display font-bold text-2xl text-theme-primary mb-4">
                            1. Platform Nature
                        </h2>
                        <div className="text-theme-secondary leading-relaxed">
                            <p className="mb-4">
                                InsuranceClarity is an information aggregator and education platform. We are not an insurance broker or agent.
                            </p>
                            <GlassCard padding="sm" className="bg-amber-500/5 border-amber-500/20 text-sm flex gap-3 items-start">
                                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                                <span className="text-amber-800 dark:text-amber-200">
                                    We do not guarantee the issuance of any policy. The final decision rests solely with the Insurance Company.
                                </span>
                            </GlassCard>
                        </div>
                    </section>

                    <section>
                        <h2 className="font-display font-bold text-2xl text-theme-primary mb-4">
                            2. Regulatory Compliance
                        </h2>
                        <div className="text-theme-secondary leading-relaxed">
                            <p className="mb-4">
                                All content is designed to adhere to IRDAI (Protection of Policyholders' Interests) Regulations.
                            </p>
                            <LawCitation
                                act="IRDAI Act"
                                section="Section 14(2)"
                                year="1999"
                                description="Empowers IRDAI to regulate, promote and ensure orderly growth of the insurance and re-insurance business."
                            />
                        </div>
                    </section>

                    <section>
                        <h2 className="font-display font-bold text-2xl text-theme-primary mb-4">
                            3. Limitation of Liability
                        </h2>
                        <p className="text-theme-secondary leading-relaxed">
                            We obtain information from public disclosures and policy wordings. While we strive for accuracy,
                            insurance companies may update their terms without notice. We are not liable for any discrepancies
                            between our analysis and the final policy contract.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}
