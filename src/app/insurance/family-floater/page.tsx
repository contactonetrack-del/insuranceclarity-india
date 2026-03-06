'use client'

import React from 'react'
import Link from 'next/link'
import {
    Users, ArrowRight, ShieldAlert,
    Baby, Activity, Stethoscope
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

export default function FamilyFloaterInsurancePage() {
    return (
        <div className="min-h-screen pt-20">
            {/* Hero Section */}
            <section className="py-20 px-6 overflow-hidden relative border-b border-default">
                <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 to-pink-500/5 pointer-events-none -z-10" />
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-fuchsia-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none -z-10" />

                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="max-w-2xl text-center lg:text-left">
                            <RevealOnScroll direction="left" delay={0.1}>
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400
                                   text-sm rounded-full mb-6 font-bold shadow-lg shadow-fuchsia-500/10 border border-fuchsia-500/20">
                                    <Users className="w-4 h-4" />
                                    PERSONAL INSURANCE
                                </div>
                            </RevealOnScroll>

                            <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-theme-primary leading-tight mb-6">
                                Protect Your Entire Family with a <br />
                                <GradientText className="from-fuchsia-500 to-pink-600">Single Floater Plan</GradientText>
                            </h1>

                            <RevealOnScroll direction="up" delay={0.3}>
                                <p className="text-xl text-theme-secondary mb-8 leading-relaxed">
                                    Instead of buying individual health policies for each family member, a Family Floater pools a larger sum insured that can be utilized by any member in need.
                                </p>

                                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                                    <Link href="/tools/calculator"
                                        className="px-8 py-4 rounded-xl bg-gradient-to-r from-fuchsia-500 to-pink-600 text-white font-bold
                                           hover:shadow-lg hover:shadow-fuchsia-500/25 transition-all active:scale-95 flex items-center gap-2">
                                        Calculate Premium
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                    <Link href="#coverage"
                                        className="px-8 py-4 rounded-xl glass-subtle font-bold text-theme-primary
                                           hover:bg-hover transition-all border border-default">
                                        Floater Advantages
                                    </Link>
                                </div>
                            </RevealOnScroll>
                        </div>
                    </div>
                </div>
            </section>

            {/* Advantages Section */}
            <section id="coverage" className="py-24 px-6 relative bg-theme-bg">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="font-display font-bold text-3xl md:text-4xl text-theme-primary mb-6">
                            Why Choose a Floater Policy?
                        </h2>
                        <p className="text-lg text-theme-secondary leading-relaxed">
                            It is the most cost-effective way to insure a nuclear family, maximizing coverage while minimizing premium waste.
                        </p>
                    </div>

                    <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
                        <StaggerItem>
                            <GlassCard hover className="h-full group p-8 border-fuchsia-500/20">
                                <IconContainer icon={Users} className="text-fuchsia-500 mb-6 bg-fuchsia-500/10 group-hover:bg-fuchsia-500 group-hover:text-white transition-colors" />
                                <h3 className="text-xl font-bold text-theme-primary mb-3">Cost Efficient</h3>
                                <p className="text-theme-secondary leading-relaxed">
                                    Cheaper than buying separate covers. It's statistically unlikely for all family members to be hospitalized simultaneously, allowing for shared risk pricing.
                                </p>
                            </GlassCard>
                        </StaggerItem>

                        <StaggerItem>
                            <GlassCard hover className="h-full group p-8 border-pink-500/20">
                                <IconContainer icon={Stethoscope} className="text-pink-500 mb-6 bg-pink-500/10 group-hover:bg-pink-500 group-hover:text-white transition-colors" />
                                <h3 className="text-xl font-bold text-theme-primary mb-3">Higher Sum Insured</h3>
                                <p className="text-theme-secondary leading-relaxed">
                                    Provides access to a much larger pool of money. If one member needs extensive treatment, they can utilize the entire floater sum.
                                </p>
                            </GlassCard>
                        </StaggerItem>

                        <StaggerItem>
                            <GlassCard hover className="h-full group p-8 border-purple-500/20">
                                <IconContainer icon={Baby} className="text-purple-500 mb-6 bg-purple-500/10 group-hover:bg-purple-500 group-hover:text-white transition-colors" />
                                <h3 className="text-xl font-bold text-theme-primary mb-3">Effortless Addition</h3>
                                <p className="text-theme-secondary leading-relaxed">
                                    Easily add a new spouse or newborn child to the existing policy upon renewal or through a simple endorsement, preserving continuity benefits.
                                </p>
                            </GlassCard>
                        </StaggerItem>
                    </StaggerContainer>
                </div>
            </section>

            {/* Risks section */}
            <section className="py-24 px-6 bg-theme-bg relative border-t border-default">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <RevealOnScroll direction="left" delay={0.2}>
                            <h2 className="text-3xl font-display font-bold text-theme-primary mb-6">
                                The Catch: <br />
                                <GradientText className="from-fuchsia-500 to-pink-600">Oldest Member Pricing</GradientText>
                            </h2>
                            <p className="text-lg text-theme-secondary mb-8 leading-relaxed">
                                While incredibly useful, floater policies have one major pricing rule that must be understood.
                            </p>

                            <ul className="space-y-4">
                                {[
                                    "The premium is calculated based on the age of the OLDEST member in the floater.",
                                    "If you add a senior citizen (parent) to your floater, your premium will skyrocket.",
                                    "Best for nuclear families (Husband, Wife, Children). Parents should ideally have separate Individual policies.",
                                    "If one person exhausts the entire sum insured, the rest of the family is left without cover for that year (unless a 'Restore' benefit is active)."
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <ShieldAlert className="w-5 h-5 text-fuchsia-500 flex-shrink-0 mt-1" />
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
