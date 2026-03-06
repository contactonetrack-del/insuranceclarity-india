'use client'

import Link from 'next/link'
import { ArrowRight, AlertTriangle, Ship, Anchor, PackageSearch, PackageOpen, Waves } from 'lucide-react'
import {
    RevealOnScroll,
    StaggerContainer,
    StaggerItem,
    TiltCard,
    GlassCard,
    MagicButton,
    IconContainer,
    GradientText
} from '@/components/premium'

const marineInsuranceTypes = [
    {
        id: 'cargo',
        title: 'Marine Cargo Insurance',
        description: 'Covers physical damage or loss of goods in transit by sea, air, or land.',
        premium: 'Based on cargo value and route',
        color: 'from-blue-500 to-cyan-600',
    },
    {
        id: 'hull',
        title: 'Hull & Machinery (H&M)',
        description: 'Protects the physical vessel, machinery, and equipment against sea perils.',
        premium: 'Based on vessel age & tonnage',
        color: 'from-slate-500 to-slate-700',
    },
    {
        id: 'freight',
        title: 'Freight Liability',
        description: 'Covers the loss of freight expected to be earned if cargo is lost.',
        premium: 'Percentage of freight value',
        color: 'from-emerald-500 to-teal-600',
    },
]

export default function MarineInsurancePage() {
    return (
        <div className="min-h-screen pt-20">
            {/* Hero */}
            <section className="py-16 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <RevealOnScroll direction="down" delay={0.1}>
                        <div className="flex items-center gap-2 text-sm text-theme-secondary mb-8">
                            <Link href="/" className="hover:text-accent transition-colors">Home</Link>
                            <span>/</span>
                            <span className="text-theme-primary font-medium">Marine & Cargo</span>
                        </div>
                    </RevealOnScroll>

                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="relative z-10">
                            <RevealOnScroll direction="up" delay={0.2}>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 
                                   text-sm rounded-full mb-6 font-medium">
                                    <Ship className="w-4 h-4" />
                                    TRANSIT PROTECTION
                                </div>
                                <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-theme-primary leading-tight mb-6">
                                    Protect Global <GradientText className="from-blue-500 to-cyan-600">Supply Chains</GradientText>
                                </h1>
                                <p className="text-lg text-theme-secondary mb-8 max-w-xl">
                                    Whether operating a fleet or shipping high-value cargo internationally, marine insurance is the bedrock of global trade security.
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
                            Core Marine Coverages
                        </h2>
                    </RevealOnScroll>

                    <StaggerContainer className="grid md:grid-cols-3 gap-6" staggerDelay={0.1}>
                        {marineInsuranceTypes.map((type) => (
                            <StaggerItem key={type.id}>
                                <TiltCard>
                                    <GlassCard hover glowOnHover className="h-full group border-blue-500/10">
                                        <div className="flex flex-col h-full">
                                            <h3 className="text-xl font-bold text-theme-primary mb-3">
                                                {type.title}
                                            </h3>
                                            <p className="text-theme-secondary text-sm flex-1 mb-6">
                                                {type.description}
                                            </p>
                                            <div className="p-3 rounded-lg bg-hover/5 border border-default text-sm text-theme-primary font-medium">
                                                Rating: <span className="text-theme-secondary font-normal">{type.premium}</span>
                                            </div>
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
