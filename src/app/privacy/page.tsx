'use client'

import { Shield, Lock, Eye, FileText } from 'lucide-react'
import { RevealOnScroll, GlassCard } from '@/components/premium'
import LawCitation from '@/components/ui/LawCitation'

export default function PrivacyPage() {
    return (
        <div className="min-h-screen pt-24 pb-20 px-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="font-display font-bold text-4xl md:text-5xl text-theme-primary mb-6">
                        Privacy Policy
                    </h1>
                    <p className="text-theme-secondary text-lg max-w-2xl mx-auto">
                        We believe in brutal honesty, not just about insurance, but about your data too.
                    </p>
                </div>

                {/* Core Privacy Principles */}
                <div className="grid md:grid-cols-3 gap-6 mb-16">
                    <GlassCard padding="md" className="text-center">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-6 h-6 text-emerald-500" />
                        </div>
                        <h3 className="font-bold text-theme-primary mb-2">No Spam Promise</h3>
                        <p className="text-sm text-theme-secondary">We never sell your phone number to insurance agents.</p>
                    </GlassCard>
                    <GlassCard padding="md" className="text-center">
                        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                            <Lock className="w-6 h-6 text-blue-500" />
                        </div>
                        <h3 className="font-bold text-theme-primary mb-2">Encryption First</h3>
                        <p className="text-sm text-theme-secondary">All data is encrypted at rest and in transit.</p>
                    </GlassCard>
                    <GlassCard padding="md" className="text-center">
                        <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                            <Eye className="w-6 h-6 text-purple-500" />
                        </div>
                        <h3 className="font-bold text-theme-primary mb-2">Zero Tracking</h3>
                        <p className="text-sm text-theme-secondary">We don't use invasive trackers or fingerprinting.</p>
                    </GlassCard>
                </div>

                {/* Detailed Sections */}
                <div className="space-y-12">
                    <section>
                        <h2 className="font-display font-bold text-2xl text-theme-primary mb-4 flex items-center gap-3">
                            1. Data Collection
                        </h2>
                        <div className="prose prose-slate dark:prose-invert max-w-none text-theme-secondary leading-relaxed space-y-4">
                            <p>
                                Unlike other portals, we do not force you to enter your phone number just to see a price.
                                We collect minimal data necessary for functionality:
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Input Data:</strong> Age, gender, and preferences you enter in our calculators.</li>
                                <li><strong>Usage Data:</strong> Anonymous analytics to understand which tools are most useful.</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="font-display font-bold text-2xl text-theme-primary mb-4 flex items-center gap-3">
                            2. Data Protection Laws
                        </h2>
                        <div className="prose prose-slate dark:prose-invert max-w-none text-theme-secondary leading-relaxed">
                            <p className="mb-4">
                                We comply with the Digital Personal Data Protection Act, 2023 (DPDP Act).
                            </p>
                            <LawCitation
                                act="Digital Personal Data Protection Act"
                                section="Section 8"
                                year="2023"
                                description="Mandates reasonable security safeguards to prevent personal data breach."
                            />
                        </div>
                    </section>

                    <section>
                        <h2 className="font-display font-bold text-2xl text-theme-primary mb-4 flex items-center gap-3">
                            3. Third-Party Sharing
                        </h2>
                        <p className="text-theme-secondary leading-relaxed">
                            We do not share your data with insurers unless you explicitly request a callback or purchase intent.
                            We retain your data only for the duration of your session in most cases.
                        </p>
                    </section>
                </div>

                <div className="mt-16 pt-8 border-t border-theme-border text-center text-sm text-theme-muted">
                    Last Updated: January 2026
                </div>
            </div>
        </div>
    )
}
