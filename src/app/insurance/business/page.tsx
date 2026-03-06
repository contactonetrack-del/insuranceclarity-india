'use client'

import Link from 'next/link'
import { ArrowRight, AlertTriangle, CheckCircle, Clock, Building2, Shield, Factory, Users, Store, Scale, Calculator, Search, Flame, Zap } from 'lucide-react'
import {
    RevealOnScroll,
    StaggerContainer,
    StaggerItem,
    TiltCard,
    GlassCard,
    MagicButton,
    AnimatedHeading,
    IconContainer,
    GradientText
} from '@/components/premium'

// SVG icons for each type
const typeIcons = {
    sme: Store,
    property: Building2,
    interruption: Clock,
    factory: Factory,
    employee: Users,
}

const businessInsuranceTypes = [
    {
        id: 'sme',
        title: 'SME Package Policy',
        description: 'Comprehensive policy for small shops and offices (Shopkeeper/Office Package).',
        premium: 'Flexible based on sum insured',
        color: 'from-emerald-500 to-teal-600',
    },
    {
        id: 'property',
        title: 'Commercial Property (Fire)',
        description: 'Standard Fire & Special Perils policy protecting physical assets.',
        premium: 'Varies by property value & risk class',
        color: 'from-blue-500 to-indigo-600',
    },
    {
        id: 'interruption',
        title: 'Business Interruption',
        description: 'Loss of Profit cover replacing lost revenue during forced closure after a peril.',
        premium: 'Percentage of projected gross profit',
        color: 'from-amber-500 to-orange-600',
    },
    {
        id: 'factory',
        title: 'Industrial All Risk (IAR)',
        description: 'Comprehensive cover for large manufacturing plants and heavy industry.',
        premium: 'Custom underwriting',
        color: 'from-slate-500 to-slate-700',
    },
    {
        id: 'employee',
        title: 'Group Mediclaim / Employee Benefits',
        description: 'Corporate health and term life coverage for staff retention.',
        premium: 'Per employee basis',
        color: 'from-purple-500 to-violet-600',
    },
]

const commonExclusions = [
    { icon: AlertTriangle, title: 'War & Nuclear', desc: 'Damages from war, invasion, or nuclear events' },
    { icon: AlertTriangle, title: 'Wear & Tear', desc: 'Gradual deterioration, depreciation, or inherent vice' },
    { icon: Flame, title: 'Unreported Alterations', desc: 'Major structural changes without notifying insurer' },
    { icon: AlertTriangle, title: 'Willful Negligence', desc: 'Losses caused by intentional acts of the insured' },
    { icon: Zap, title: 'Electrical Breakdown', desc: 'Unless resulting in fire (requires separate machinery cover)' },
    { icon: Scale, title: 'Fines & Penalties', desc: 'Regulatory fines are generally not covered' },
]

export default function BusinessInsurancePage() {
    return (
        <div className="min-h-screen pt-20">
            {/* Hero */}
            <section className="py-16 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <RevealOnScroll direction="down" delay={0.1}>
                        <div className="flex items-center gap-2 text-sm text-theme-secondary mb-8">
                            <Link href="/" className="hover:text-accent transition-colors">Home</Link>
                            <span>/</span>
                            <span className="text-theme-primary font-medium">Commercial Package</span>
                        </div>
                    </RevealOnScroll>

                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="relative z-10">
                            <RevealOnScroll direction="up" delay={0.2}>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-500/10 text-slate-600 dark:text-slate-400 
                                   text-sm rounded-full mb-6 font-medium">
                                    <Building2 className="w-4 h-4" />
                                    COMMERCIAL COVER
                                </div>
                                <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-theme-primary leading-tight mb-6">
                                    Protect Your <GradientText className="from-slate-600 to-gray-800">Business</GradientText> Against Core Risks
                                </h1>
                                <p className="text-lg text-theme-secondary mb-8 max-w-xl">
                                    From physical property damage to revenue interruption, commercial insurance ensures your enterprise can survive and recover from catastrophic events.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <MagicButton icon={ArrowRight} iconPosition="right">
                                        Get Expert Advisory
                                    </MagicButton>
                                    <MagicButton variant="secondary" icon={AlertTriangle}>
                                        View Business Claim Rejections
                                    </MagicButton>
                                </div>
                            </RevealOnScroll>
                        </div>

                        {/* Interactive Widget/Graphic area */}
                        <RevealOnScroll direction="left" delay={0.3} className="relative h-full min-h-[400px]">
                            <div className="absolute inset-0 bg-gradient-to-tr from-slate-500/20 via-primary/5 to-transparent rounded-3xl -z-10" />
                            <GlassCard className="h-full flex flex-col justify-center relative overflow-hidden">
                                <IconContainer icon={Shield} size="xl" className="absolute -right-12 -top-12 opacity-5 scale-[2]" />
                                <h3 className="text-xl font-bold text-theme-primary mb-6">Why Businesses Fail After a Disaster</h3>
                                <ul className="space-y-4">
                                    {[
                                        { title: 'Underinsurance', desc: 'Property insured for depreciated value, not replacement cost.' },
                                        { title: 'Missing Loss of Profit Cover', desc: 'No income replacement while factory is being rebuilt.' },
                                        { title: 'Outdated Risk Profile', desc: 'Business expanded but policy wasn\'t updated.' },
                                    ].map((item, i) => (
                                        <li key={i} className="flex gap-4">
                                            <div className="mt-1">
                                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-theme-primary">{item.title}</div>
                                                <div className="text-sm text-theme-secondary">{item.desc}</div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </GlassCard>
                        </RevealOnScroll>
                    </div>
                </div>
            </section>

            {/* Types of Coverage */}
            <section className="py-20 px-6 glass-subtle">
                <div className="max-w-7xl mx-auto">
                    <RevealOnScroll className="mb-12">
                        <h2 className="font-display font-bold text-3xl text-theme-primary mb-4">
                            Types of Commercial Insurance
                        </h2>
                        <p className="text-theme-secondary max-w-2xl">
                            Core products to build your corporate risk management portfolio.
                        </p>
                    </RevealOnScroll>

                    <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
                        {businessInsuranceTypes.map((type) => {
                            const Icon = typeIcons[type.id as keyof typeof typeIcons] || Shield
                            return (
                                <StaggerItem key={type.id}>
                                    <TiltCard>
                                        <GlassCard hover glowOnHover className="h-full group">
                                            <div className="flex flex-col h-full">
                                                <IconContainer
                                                    icon={Icon}
                                                    variant="gradient"
                                                    gradientFrom={`from-${type.color.split(' ')[0].replace('from-', '')}`}
                                                    gradientTo={`to-${type.color.split(' ')[1].replace('to-', '')}`}
                                                    className="mb-6 group-hover:scale-110 transition-transform duration-300"
                                                />
                                                <h3 className="text-xl font-bold text-theme-primary mb-3">
                                                    {type.title}
                                                </h3>
                                                <p className="text-theme-secondary text-sm flex-1 mb-6">
                                                    {type.description}
                                                </p>
                                                <div className="p-3 rounded-lg bg-hover/5 border border-default text-sm text-theme-primary font-medium">
                                                    Cost: <span className="text-theme-secondary font-normal">{type.premium}</span>
                                                </div>
                                            </div>
                                        </GlassCard>
                                    </TiltCard>
                                </StaggerItem>
                            )
                        })}
                    </StaggerContainer>
                </div>
            </section>

            {/* General Exclusions */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <RevealOnScroll className="mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 text-rose-600 
                           text-sm rounded-full mb-4 font-medium">
                            <AlertTriangle className="w-4 h-4" />
                            CRITICAL EXCLUSIONS
                        </div>
                        <h2 className="font-display font-bold text-3xl text-theme-primary mb-4">
                            What Business Insurance Usually Doesn't Cover
                        </h2>
                        <p className="text-theme-secondary max-w-2xl">
                            Standard property and package policies come with strict exclusions. Understanding these is vital for avoiding rejected claims.
                        </p>
                    </RevealOnScroll>

                    <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.05}>
                        {commonExclusions.map((exclusion, index) => (
                            <StaggerItem key={index}>
                                <GlassCard className="h-full border-rose-500/20 hover:border-rose-500/40 transition-colors">
                                    <div className="flex gap-4">
                                        <div className="p-2 rounded-lg bg-rose-500/10 h-fit">
                                            <exclusion.icon className="w-5 h-5 text-rose-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-theme-primary mb-1">{exclusion.title}</h3>
                                            <p className="text-sm text-theme-secondary">{exclusion.desc}</p>
                                        </div>
                                    </div>
                                </GlassCard>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </div>
            </section>
        </div>
    )
}
