'use client'

import React from 'react'
import Link from 'next/link'
import {
    Heart, ArrowRight, ShieldAlert,
    TrendingUp, ShieldCheck, Activity
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

export default function TermLifeInsurancePage() {
    return (
        <div className="min-h-screen pt-20">
            {/* Hero Section */}
            <section className="py-20 px-6 overflow-hidden relative border-b border-default">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 pointer-events-none -z-10" />
                <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none -z-10" />

                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="max-w-2xl text-center lg:text-left">
                            <RevealOnScroll direction="left" delay={0.1}>
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-600 dark:text-blue-400
                                   text-sm rounded-full mb-6 font-bold shadow-lg shadow-blue-500/10 border border-blue-500/20">
                                    <Heart className="w-4 h-4" />
                                    PERSONAL INSURANCE
                                </div>
                            </RevealOnScroll>

                            <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-theme-primary leading-tight mb-6">
                                Pure Protection with <br />
                                <GradientText className="from-blue-500 to-cyan-600">Term Life Insurance</GradientText>
                            </h1>

                            <RevealOnScroll direction="up" delay={0.3}>
                                <p className="text-xl text-theme-secondary mb-8 leading-relaxed">
                                    The simplest and most powerful form of Life Insurance. Secure massive financial protection for your dependents at an incredibly affordable premium.
                                </p>

                                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                                    <Link href="/tools/calculator"
                                        className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold
                                           hover:shadow-lg hover:shadow-blue-500/25 transition-all active:scale-95 flex items-center gap-2">
                                        Calculate Term Cover
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                    <Link href="#coverage"
                                        className="px-8 py-4 rounded-xl glass-subtle font-bold text-theme-primary
                                           hover:bg-hover transition-all border border-default">
                                        Why Choose Term?
                                    </Link>
                                </div>
                            </RevealOnScroll>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Pillars Section */}
            <section id="coverage" className="py-24 px-6 relative bg-theme-bg">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="font-display font-bold text-3xl md:text-4xl text-theme-primary mb-6">
                            The Purest Protection
                        </h2>
                        <p className="text-lg text-theme-secondary leading-relaxed">
                            Unlike Whole Life or Endowment plans, Term Life strips away expensive investment components, focusing 100% of your premium on pure death benefit coverage.
                        </p>
                    </div>

                    <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
                        <StaggerItem>
                            <GlassCard hover className="h-full group p-8 border-blue-500/20">
                                <IconContainer icon={TrendingUp} className="text-blue-500 mb-6 bg-blue-500/10 group-hover:bg-blue-500 group-hover:text-white transition-colors" />
                                <h3 className="text-xl font-bold text-theme-primary mb-3">High Cover, Low Cost</h3>
                                <p className="text-theme-secondary leading-relaxed">
                                    Because there is no maturity payout (survival benefit), you can secure a ₹1 Crore cover for a fraction of the cost of traditional life policies.
                                </p>
                            </GlassCard>
                        </StaggerItem>

                        <StaggerItem>
                            <GlassCard hover className="h-full group p-8 border-cyan-500/20">
                                <IconContainer icon={ShieldCheck} className="text-cyan-500 mb-6 bg-cyan-500/10 group-hover:bg-cyan-500 group-hover:text-white transition-colors" />
                                <h3 className="text-xl font-bold text-theme-primary mb-3">Fixed Premiums</h3>
                                <p className="text-theme-secondary leading-relaxed">
                                    Lock in your premium rate while you are young and healthy. The premium remains identical for the entire "term" (e.g., 20 or 30 years).
                                </p>
                            </GlassCard>
                        </StaggerItem>

                        <StaggerItem>
                            <GlassCard hover className="h-full group p-8 border-indigo-500/20">
                                <IconContainer icon={Activity} className="text-indigo-500 mb-6 bg-indigo-500/10 group-hover:bg-indigo-500 group-hover:text-white transition-colors" />
                                <h3 className="text-xl font-bold text-theme-primary mb-3">Rider Enhancements</h3>
                                <p className="text-theme-secondary leading-relaxed">
                                    Easily attach riders like Accidental Death Benefit, Waiver of Premium, or Critical Illness to comprehensively broaden your safety net.
                                </p>
                            </GlassCard>
                        </StaggerItem>
                    </StaggerContainer>
                </div>
            </section>

            {/* Rule of thumb section */}
            <section className="py-24 px-6 bg-theme-bg relative border-t border-default">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <RevealOnScroll direction="left" delay={0.2}>
                            <h2 className="text-3xl font-display font-bold text-theme-primary mb-6">
                                The Golden Rule: <br />
                                <GradientText className="from-blue-500 to-cyan-600">How Much Cover Do You Need?</GradientText>
                            </h2>
                            <p className="text-lg text-theme-secondary mb-8 leading-relaxed">
                                Don't guess your life's value. Use actuarial rules of thumb to ensure your family's lifestyle is preserved, debts are cleared, and future goals are met.
                            </p>

                            <ul className="space-y-4">
                                {[
                                    "Income Replacement: Aim for 10x to 15x your current annual income.",
                                    "Debt Clearance: Add the total value of your outstanding loans (Home Loan, Auto Loan).",
                                    "Future Obligations: Add projected costs for children's higher education and marriage.",
                                    "Human Life Value (HLV) calculators offer precise evaluations based on inflation and savings."
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <ShieldAlert className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
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
