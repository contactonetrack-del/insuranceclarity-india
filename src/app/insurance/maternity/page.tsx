'use client'

import React from 'react'
import Link from 'next/link'
import {
    Heart, ArrowRight, ShieldAlert,
    Baby, Activity, Stethoscope
} from 'lucide-react'
import {
    RevealOnScroll,
    StaggerContainer,
    StaggerItem,
    GlassCard,
    GradientText,
    IconContainer
} from '@/components/premium'

export default function MaternityInsurancePage() {
    return (
        <div className="min-h-screen pt-20">
            {/* Hero Section */}
            <section className="py-20 px-6 overflow-hidden relative border-b border-default">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-rose-500/5 pointer-events-none -z-10" />
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-pink-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none -z-10" />

                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="max-w-2xl text-center lg:text-left">
                            <RevealOnScroll direction="left" delay={0.1}>
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500/10 text-pink-600 dark:text-pink-400
                                   text-sm rounded-full mb-6 font-bold shadow-lg shadow-pink-500/10 border border-pink-500/20">
                                    <Baby className="w-4 h-4" />
                                    PERSONAL INSURANCE
                                </div>
                            </RevealOnScroll>

                            <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-theme-primary leading-tight mb-6">
                                Securing Motherhood with <br />
                                <GradientText className="from-pink-500 to-rose-600">Maternity Insurance</GradientText>
                            </h1>

                            <RevealOnScroll direction="up" delay={0.3}>
                                <p className="text-xl text-theme-secondary mb-8 leading-relaxed">
                                    Comprehensive financial protection for expecting mothers, covering pre-natal and post-natal care, delivery expenses, and newborn health complications.
                                </p>

                                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                                    <Link href="/tools/calculator"
                                        className="px-8 py-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold
                                           hover:shadow-lg hover:shadow-pink-500/25 transition-all active:scale-95 flex items-center gap-2">
                                        Calculate Premium
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                    <Link href="#coverage"
                                        className="px-8 py-4 rounded-xl glass-subtle font-bold text-theme-primary
                                           hover:bg-hover transition-all border border-default">
                                        Covered Expenses
                                    </Link>
                                </div>
                            </RevealOnScroll>
                        </div>
                    </div>
                </div>
            </section>

            {/* Coverage Section */}
            <section id="coverage" className="py-24 px-6 relative bg-theme-bg">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="font-display font-bold text-3xl md:text-4xl text-theme-primary mb-6">
                            Holistic Maternity Coverage
                        </h2>
                        <p className="text-lg text-theme-secondary leading-relaxed">
                            A dedicated maternity policy ensures that you receive premium care without the anxiety of escalating hospitalization bills during delivery.
                        </p>
                    </div>

                    <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
                        <StaggerItem>
                            <GlassCard hover className="h-full group p-8 border-pink-500/20">
                                <IconContainer icon={Heart} className="text-pink-500 mb-6 bg-pink-500/10 group-hover:bg-pink-500 group-hover:text-white transition-colors" />
                                <h3 className="text-xl font-bold text-theme-primary mb-3">Delivery Expenses</h3>
                                <p className="text-theme-secondary leading-relaxed">
                                    Comprehensive coverage for both standard (normal) and medically necessary Cesarean section (C-Section) deliveries up to the specified sum insured.
                                </p>
                            </GlassCard>
                        </StaggerItem>

                        <StaggerItem>
                            <GlassCard hover className="h-full group p-8 border-rose-500/20">
                                <IconContainer icon={Baby} className="text-rose-500 mb-6 bg-rose-500/10 group-hover:bg-rose-500 group-hover:text-white transition-colors" />
                                <h3 className="text-xl font-bold text-theme-primary mb-3">Newborn Cover</h3>
                                <p className="text-theme-secondary leading-relaxed">
                                    Inbuilt protection for the newborn baby from Day 1 to a specified period (usually 90 days), including necessary vaccinations and medical contingencies.
                                </p>
                            </GlassCard>
                        </StaggerItem>

                        <StaggerItem>
                            <GlassCard hover className="h-full group p-8 border-fuchsia-500/20">
                                <IconContainer icon={Stethoscope} className="text-fuchsia-500 mb-6 bg-fuchsia-500/10 group-hover:bg-fuchsia-500 group-hover:text-white transition-colors" />
                                <h3 className="text-xl font-bold text-theme-primary mb-3">Pre & Post Natal Care</h3>
                                <p className="text-theme-secondary leading-relaxed">
                                    Financial coverage for diagnostic tests, ultrasound scans, medications, and doctor consultations prior to and immediately following childbirth.
                                </p>
                            </GlassCard>
                        </StaggerItem>
                    </StaggerContainer>
                </div>
            </section>

            {/* Waiting Periods section */}
            <section className="py-24 px-6 bg-theme-bg relative border-t border-default">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <RevealOnScroll direction="left" delay={0.2}>
                            <h2 className="text-3xl font-display font-bold text-theme-primary mb-6">
                                The Golden Rule: <br />
                                <GradientText className="from-pink-500 to-rose-600">Waiting Periods</GradientText>
                            </h2>
                            <p className="text-lg text-theme-secondary mb-8 leading-relaxed">
                                Maternity insurance is notorious for strict waiting periods to prevent immediate claims. Advance planning is strictly required.
                            </p>

                            <ul className="space-y-4">
                                {[
                                    "Standard Waiting Period: Usually between 9 months to 48 months from policy inception.",
                                    "You CANNOT buy a policy if you are already pregnant; claims will be rejected.",
                                    "Sub-Limits: Policies explicitly cap maternity payouts (e.g., maximum ₹50k for normal, ₹75k for C-Section).",
                                    "Best Strategy: It is usually added as an optional rider to a primary Family Floater policy years in advance."
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <ShieldAlert className="w-5 h-5 text-pink-500 flex-shrink-0 mt-1" />
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
