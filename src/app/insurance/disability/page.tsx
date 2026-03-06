'use client'

import React from 'react'
import Link from 'next/link'
import {
    Activity, ArrowRight, ShieldAlert,
    UserX, Briefcase, Calculator, AlertTriangle
} from 'lucide-react'
import {
    RevealOnScroll,
    StaggerContainer,
    StaggerItem,
    GlassCard,
    GradientText,
    AnimatedHeading,
    IconContainer
} from '@/components/premium'

export default function DisabilityInsurancePage() {
    return (
        <div className="min-h-screen pt-20">
            {/* Hero Section */}
            <section className="py-20 px-6 overflow-hidden relative border-b border-default">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none -z-10" />
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none -z-10" />

                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="max-w-2xl text-center lg:text-left">
                            <RevealOnScroll direction="left" delay={0.1}>
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400
                                   text-sm rounded-full mb-6 font-bold shadow-lg shadow-indigo-500/10 border border-indigo-500/20">
                                    <UserX className="w-4 h-4" />
                                    PERSONAL INSURANCE
                                </div>
                            </RevealOnScroll>

                            <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-theme-primary leading-tight mb-6">
                                Protect Your Income with <br />
                                <GradientText className="from-indigo-500 to-purple-600">Disability Insurance</GradientText>
                            </h1>

                            <RevealOnScroll direction="up" delay={0.3}>
                                <p className="text-xl text-theme-secondary mb-8 leading-relaxed">
                                    Your ability to earn an income is your greatest asset. Disability insurance replaces a portion of your income if you become unable to work due to an illness or injury.
                                </p>

                                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                                    <Link href="/tools/calculator"
                                        className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold
                                           hover:shadow-lg hover:shadow-indigo-500/25 transition-all active:scale-95 flex items-center gap-2">
                                        Calculate Premium
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                    <Link href="#coverage"
                                        className="px-8 py-4 rounded-xl glass-subtle font-bold text-theme-primary
                                           hover:bg-hover transition-all border border-default">
                                        Types of Coverage
                                    </Link>
                                </div>
                            </RevealOnScroll>
                        </div>
                    </div>
                </div>
            </section>

            {/* Coverage Types Section */}
            <section id="coverage" className="py-24 px-6 relative bg-theme-bg">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="font-display font-bold text-3xl md:text-4xl text-theme-primary mb-6">
                            Types of Disability Coverage
                        </h2>
                        <p className="text-lg text-theme-secondary leading-relaxed">
                            Understanding the nuances between different disability covers is crucial for comprehensive financial planning.
                        </p>
                    </div>

                    <StaggerContainer className="grid md:grid-cols-2 gap-6" staggerDelay={0.1}>
                        <StaggerItem>
                            <GlassCard hover className="h-full group p-8 border-indigo-500/20">
                                <IconContainer icon={Activity} className="text-indigo-500 mb-6 bg-indigo-500/10 group-hover:bg-indigo-500 group-hover:text-white transition-colors" />
                                <h3 className="text-xl font-bold text-theme-primary mb-3">Short-Term Disability (STD)</h3>
                                <p className="text-theme-secondary leading-relaxed">
                                    Provides coverage immediately after an incident (usually after a 0-14 day elimination period) for up to 6 months. Ideal for temporary injuries or recovery from surgery.
                                </p>
                            </GlassCard>
                        </StaggerItem>

                        <StaggerItem>
                            <GlassCard hover className="h-full group p-8 border-purple-500/20">
                                <IconContainer icon={Briefcase} className="text-purple-500 mb-6 bg-purple-500/10 group-hover:bg-purple-500 group-hover:text-white transition-colors" />
                                <h3 className="text-xl font-bold text-theme-primary mb-3">Long-Term Disability (LTD)</h3>
                                <p className="text-theme-secondary leading-relaxed">
                                    Kicks in after STD exhausts (usually 90-180 days). Can provide income replacement for years, or even up to retirement age, in the event of severe, chronic disability.
                                </p>
                            </GlassCard>
                        </StaggerItem>
                    </StaggerContainer>
                </div>
            </section>

            {/* Key Definitions section */}
            <section className="py-24 px-6 bg-theme-bg relative border-t border-default">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <RevealOnScroll direction="left" delay={0.2}>
                            <h2 className="text-3xl font-display font-bold text-theme-primary mb-6">
                                Crucial Policy Definitions <br />
                                <GradientText className="from-indigo-500 to-purple-600">"Own" vs "Any" Occupation</GradientText>
                            </h2>
                            <p className="text-lg text-theme-secondary mb-8 leading-relaxed">
                                The definition of "disability" in your policy dictates when it pays out. This is the most critical clause to review.
                            </p>

                            <ul className="space-y-4">
                                {[
                                    "Own Occupation: Pays if you cannot perform the duties of your specific profession (e.g., a surgeon who loses fine motor skills).",
                                    "Any Occupation: Only pays if you are deemed unable to work ANY job suitable for your education and experience.",
                                    "Elimination Period: The waiting period before benefits begin (longer waiting period = lower premium).",
                                    "Benefit Period: How long the policy will pay out (2 years, 5 years, or to age 65)."
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-1" />
                                        <span className="text-theme-primary font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </RevealOnScroll>
                    </div>
                </div>
            </section>
        </div>
    )
}
