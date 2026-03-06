'use client'

import Link from 'next/link'
import { ArrowRight, AlertTriangle, Zap, BatteryCharging, Cpu, Bot, Rocket } from 'lucide-react'
import {
    RevealOnScroll,
    StaggerContainer,
    StaggerItem,
    TiltCard,
    GlassCard,
    GradientText
} from '@/components/premium'

const evInsuranceTypes = [
    {
        id: 'ev',
        title: 'Comprehensive EV Auto',
        description: 'Specialized motor cover focusing on costly battery replacement, charging infrastructure liability, and software issues.',
        color: 'from-fuchsia-500 to-purple-600',
    },
    {
        id: 'parametric',
        title: 'Parametric Insurance',
        description: 'Smart-contract enabled auto-payout policies triggered by specific data parameters (e.g. flight delay, earthquake magnitude).',
        color: 'from-blue-500 to-indigo-600',
    },
    {
        id: 'ai',
        title: 'Algorithmic/AI Liability',
        description: 'New-age coverage protecting against discriminatory outputs or errors made by corporate AI models.',
        color: 'from-teal-500 to-emerald-600',
    },
]

export default function EVInsurancePage() {
    return (
        <div className="min-h-screen pt-20">
            {/* Hero */}
            <section className="py-16 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <RevealOnScroll direction="down" delay={0.1}>
                        <div className="flex items-center gap-2 text-sm text-theme-secondary mb-8">
                            <Link href="/" className="hover:text-accent transition-colors">Home</Link>
                            <span>/</span>
                            <span className="text-theme-primary font-medium">EV & Emerging Tech</span>
                        </div>
                    </RevealOnScroll>

                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="relative z-10">
                            <RevealOnScroll direction="up" delay={0.2}>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 
                                   text-sm rounded-full mb-6 font-medium">
                                    <Zap className="w-4 h-4" />
                                    NEXT-GEN COVER
                                </div>
                                <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-theme-primary leading-tight mb-6">
                                    Insuring the <GradientText className="from-fuchsia-500 to-purple-600">Future</GradientText>
                                </h1>
                                <p className="text-lg text-theme-secondary mb-8 max-w-xl">
                                    Traditional insurance models can't price electric vehicle batteries, autonomous driving AI, or blockchain risk. Explore the frontier of modern underwriting.
                                </p>
                            </RevealOnScroll>
                        </div>
                    </div>
                </div>
            </section>

            {/* Types of Coverage */}
            <section className="py-20 px-6 glass-subtle">
                <div className="max-w-7xl mx-auto">
                    <RevealOnScroll className="mb-12">
                        <h2 className="font-display font-bold text-3xl text-theme-primary mb-4">
                            Frontier Insurance Products
                        </h2>
                    </RevealOnScroll>

                    <StaggerContainer className="grid md:grid-cols-3 gap-6" staggerDelay={0.1}>
                        {evInsuranceTypes.map((type) => (
                            <StaggerItem key={type.id}>
                                <TiltCard>
                                    <GlassCard hover glowOnHover className="h-full group border-fuchsia-500/10">
                                        <div className="flex flex-col h-full">
                                            <h3 className="text-xl font-bold text-theme-primary mb-3">
                                                {type.title}
                                            </h3>
                                            <p className="text-theme-secondary text-sm flex-1 mb-6">
                                                {type.description}
                                            </p>
                                        </div>
                                    </GlassCard>
                                </TiltCard>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </div>
            </section>
        </div>
    )
}
