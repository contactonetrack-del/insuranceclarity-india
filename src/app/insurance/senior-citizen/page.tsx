'use client'

import React from 'react'
import Link from 'next/link'
import {
    Heart, ArrowRight, ShieldAlert,
    UserCircle, Stethoscope, Pill
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

export default function SeniorCitizenInsurancePage() {
    return (
        <div className="min-h-screen pt-20">
            {/* Hero Section */}
            <section className="py-20 px-6 overflow-hidden relative border-b border-default">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-emerald-500/5 pointer-events-none -z-10" />
                <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-teal-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none -z-10" />

                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="max-w-2xl text-center lg:text-left">
                            <RevealOnScroll direction="left" delay={0.1}>
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/10 text-teal-600 dark:text-teal-400
                                   text-sm rounded-full mb-6 font-bold shadow-lg shadow-teal-500/10 border border-teal-500/20">
                                    <UserCircle className="w-4 h-4" />
                                    PERSONAL INSURANCE
                                </div>
                            </RevealOnScroll>

                            <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-theme-primary leading-tight mb-6">
                                Dignified Healthcare for <br />
                                <GradientText className="from-teal-500 to-emerald-600">Senior Citizens</GradientText>
                            </h1>

                            <RevealOnScroll direction="up" delay={0.3}>
                                <p className="text-xl text-theme-secondary mb-8 leading-relaxed">
                                    Specialized health coverage designed specifically for individuals aged 60 and above, addressing age-related medical complexities and ensuring peaceful retirement years.
                                </p>

                                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                                    <Link href="/tools/calculator"
                                        className="px-8 py-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold
                                           hover:shadow-lg hover:shadow-teal-500/25 transition-all active:scale-95 flex items-center gap-2">
                                        Calculate Premium
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                    <Link href="#coverage"
                                        className="px-8 py-4 rounded-xl glass-subtle font-bold text-theme-primary
                                           hover:bg-hover transition-all border border-default">
                                        Policy Benefits
                                    </Link>
                                </div>
                            </RevealOnScroll>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section id="coverage" className="py-24 px-6 relative bg-theme-bg">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="font-display font-bold text-3xl md:text-4xl text-theme-primary mb-6">
                            Tailored Senior Coverages
                        </h2>
                        <p className="text-lg text-theme-secondary leading-relaxed">
                            Standard health policies often have strict entry age limits. Senior Citizen policies are explicitly underwritten for the realities of aging.
                        </p>
                    </div>

                    <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
                        <StaggerItem>
                            <GlassCard hover className="h-full group p-8 border-teal-500/20">
                                <IconContainer icon={Heart} className="text-teal-500 mb-6 bg-teal-500/10 group-hover:bg-teal-500 group-hover:text-white transition-colors" />
                                <h3 className="text-xl font-bold text-theme-primary mb-3">Pre-Existing Conditions</h3>
                                <p className="text-theme-secondary leading-relaxed">
                                    Often features shorter waiting periods for common senior ailments like hypertension, diabetes, and cardiovascular issues compared to standard policies.
                                </p>
                            </GlassCard>
                        </StaggerItem>

                        <StaggerItem>
                            <GlassCard hover className="h-full group p-8 border-emerald-500/20">
                                <IconContainer icon={Stethoscope} className="text-emerald-500 mb-6 bg-emerald-500/10 group-hover:bg-emerald-500 group-hover:text-white transition-colors" />
                                <h3 className="text-xl font-bold text-theme-primary mb-3">Annual Check-ups</h3>
                                <p className="text-theme-secondary leading-relaxed">
                                    Includes complimentary annual preventive health check-ups and diagnostic tests to proactively manage aging health metrics.
                                </p>
                            </GlassCard>
                        </StaggerItem>

                        <StaggerItem>
                            <GlassCard hover className="h-full group p-8 border-cyan-500/20">
                                <IconContainer icon={Pill} className="text-cyan-500 mb-6 bg-cyan-500/10 group-hover:bg-cyan-500 group-hover:text-white transition-colors" />
                                <h3 className="text-xl font-bold text-theme-primary mb-3">AYUSH Treatment</h3>
                                <p className="text-theme-secondary leading-relaxed">
                                    Coverage extended to alternative medicine treatments (Ayurveda, Yoga, Unani, Siddha, and Homeopathy) which are often preferred by seniors.
                                </p>
                            </GlassCard>
                        </StaggerItem>
                    </StaggerContainer>
                </div>
            </section>

            {/* Copay section */}
            <section className="py-24 px-6 bg-theme-bg relative border-t border-default">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <RevealOnScroll direction="left" delay={0.2}>
                            <h2 className="text-3xl font-display font-bold text-theme-primary mb-6">
                                Understanding <br />
                                <GradientText className="from-teal-500 to-emerald-600">Co-payments (Co-pay)</GradientText>
                            </h2>
                            <p className="text-lg text-theme-secondary mb-8 leading-relaxed">
                                Due to higher actuarial risk, most Senior Citizen policies include a mandatory Co-pay clause. This means the policyholder shares a percentage of the claim amount.
                            </p>

                            <ul className="space-y-4">
                                {[
                                    "Typically ranges from 10% to 30% of the total admissible claim.",
                                    "A 20% co-pay on a 1 Lakh bill means you pay 20k, insurer pays 80k.",
                                    "Some insurers offer waivers of co-pay for a higher base premium.",
                                    "Always check if the co-pay applies to all illnesses or only specific pre-existing ones."
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <ShieldAlert className="w-5 h-5 text-teal-500 flex-shrink-0 mt-1" />
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
