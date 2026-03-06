'use client'

import React from 'react'
import Link from 'next/link'
import {
    Activity, ArrowRight, CheckCircle, ShieldAlert,
    HeartPulse, Pill, Stethoscope, AlertTriangle, Scale
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

export default function CriticalIllnessInsurancePage() {
    return (
        <div className="min-h-screen pt-20">
            {/* Hero Section */}
            <section className="py-20 px-6 overflow-hidden relative border-b border-default">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-red-500/5 pointer-events-none -z-10" />
                <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-rose-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none -z-10" />

                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="max-w-2xl text-center lg:text-left">
                            <RevealOnScroll direction="left" delay={0.1}>
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-600 dark:text-rose-400
                                   text-sm rounded-full mb-6 font-bold shadow-lg shadow-rose-500/10 border border-rose-500/20">
                                    <Activity className="w-4 h-4" />
                                    PERSONAL INSURANCE
                                </div>
                            </RevealOnScroll>

                            <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-theme-primary leading-tight mb-6">
                                Protect Your Future <br />
                                with <GradientText className="from-rose-500 to-red-600">Critical Illness</GradientText> Cover
                            </h1>

                            <RevealOnScroll direction="up" delay={0.3}>
                                <p className="text-xl text-theme-secondary mb-8 leading-relaxed">
                                    A diagnosis shouldn't destroy your finances. Critical Illness Insurance provides a massive lump-sum payout upon diagnosis of severe life-threatening conditions.
                                </p>

                                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                                    <Link href="/tools/calculator"
                                        className="px-8 py-4 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold
                                           hover:shadow-lg hover:shadow-rose-500/25 transition-all active:scale-95 flex items-center gap-2">
                                        Calculate Premium
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                    <Link href="#coverage"
                                        className="px-8 py-4 rounded-xl glass-subtle font-bold text-theme-primary
                                           hover:bg-hover transition-all border border-default">
                                        Covered Conditions
                                    </Link>
                                </div>
                            </RevealOnScroll>
                        </div>
                    </div>
                </div>
            </section>

            {/* Covered Conditions Section */}
            <section id="coverage" className="py-24 px-6 relative bg-theme-bg">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="font-display font-bold text-3xl md:text-4xl text-theme-primary mb-6">
                            Key Medical Triggers
                        </h2>
                        <p className="text-lg text-theme-secondary leading-relaxed">
                            Unlike basic health insurance which pays hospital bills, Critical Illness pays directly to you, providing liquidity when you need it most.
                        </p>
                    </div>

                    <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
                        <StaggerItem>
                            <GlassCard hover className="h-full group p-8 border-rose-500/20">
                                <IconContainer icon={HeartPulse} className="text-rose-500 mb-6 bg-rose-500/10 group-hover:bg-rose-500 group-hover:text-white transition-colors" />
                                <h3 className="text-xl font-bold text-theme-primary mb-3">Cardiovascular</h3>
                                <p className="text-theme-secondary leading-relaxed">
                                    Immediate payout upon diagnosis of First Heart Attack, Coronary Artery Bypass Surgery, or Heart Valve Replacement.
                                </p>
                            </GlassCard>
                        </StaggerItem>

                        <StaggerItem>
                            <GlassCard hover className="h-full group p-8 border-red-500/20">
                                <IconContainer icon={Activity} className="text-red-500 mb-6 bg-red-500/10 group-hover:bg-red-500 group-hover:text-white transition-colors" />
                                <h3 className="text-xl font-bold text-theme-primary mb-3">Oncology (Cancer)</h3>
                                <p className="text-theme-secondary leading-relaxed">
                                    Full coverage for diagnosis of specified severity Cancers, aiding in experimental treatments and prolonged income loss.
                                </p>
                            </GlassCard>
                        </StaggerItem>

                        <StaggerItem>
                            <GlassCard hover className="h-full group p-8 border-orange-500/20">
                                <IconContainer icon={Stethoscope} className="text-orange-500 mb-6 bg-orange-500/10 group-hover:bg-orange-500 group-hover:text-white transition-colors" />
                                <h3 className="text-xl font-bold text-theme-primary mb-3">Neurological</h3>
                                <p className="text-theme-secondary leading-relaxed">
                                    Coverage for advanced neurological disorders including Stroke, Multiple Sclerosis, Parkinson's, and Alzheimer's Disease.
                                </p>
                            </GlassCard>
                        </StaggerItem>
                    </StaggerContainer>
                </div>
            </section>

            {/* Waiting Periods section (very very important for CI) */}
            <section className="py-24 px-6 bg-theme-bg relative border-t border-default">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <RevealOnScroll direction="left" delay={0.2}>
                            <h2 className="text-3xl font-display font-bold text-theme-primary mb-6">
                                The Rules of Engagement: <br />
                                <GradientText className="from-rose-500 to-red-600">Waiting Periods</GradientText>
                            </h2>
                            <p className="text-lg text-theme-secondary mb-8 leading-relaxed">
                                Critical Illness policies have explicit rules to prevent adverse selection. You must survive the initial diagnosis by a certain number of days to trigger the payout.
                            </p>

                            <ul className="space-y-4">
                                {[
                                    "Initial 90-Day Waiting Period on inception",
                                    "Strict 30-Day 'Survival Period' post-diagnosis",
                                    "Pre-existing condition moratoriums (usually 48 months)",
                                    "Excludes claims arising from self-inflicted injuries"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-1" />
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
