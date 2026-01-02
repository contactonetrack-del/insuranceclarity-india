'use client'

import Link from 'next/link'
import { ArrowRight, Car, Shield, Calculator, CheckCircle, Plus } from 'lucide-react'
import {
    RevealOnScroll,
    StaggerContainer,
    StaggerItem,
    TiltCard,
    GlassCard,
    MagicButton,
    AnimatedHeading,
    IconContainer
} from '@/components/premium'

const ncbTable = [
    { year: '1st Year', discount: '20%' },
    { year: '2nd Year', discount: '25%' },
    { year: '3rd Year', discount: '35%' },
    { year: '4th Year', discount: '45%' },
    { year: '5th Year+', discount: '50%' },
]

const addOns = [
    { name: 'Zero Depreciation', desc: 'Full claim without depreciation', mustHave: true },
    { name: 'Engine Protect', desc: 'Covers water logging damage', mustHave: true },
    { name: 'Return to Invoice', desc: 'Full invoice on total loss', mustHave: false },
    { name: 'NCB Protect', desc: 'Keep NCB after claim', mustHave: false },
]

export default function MotorInsurancePage() {
    return (
        <div className="min-h-screen pt-20">
            <section className="py-16 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <RevealOnScroll direction="down" delay={0.1}>
                        <div className="flex items-center gap-2 text-sm text-theme-secondary mb-8">
                            <Link href="/" className="hover:text-accent transition-colors">Home</Link>
                            <span>/</span>
                            <span className="text-theme-primary font-medium">Motor Insurance</span>
                        </div>
                    </RevealOnScroll>

                    <div className="flex flex-col md:flex-row items-start gap-8">
                        <RevealOnScroll direction="right" delay={0.2}>
                            <IconContainer
                                icon={Car}
                                size="xl"
                                variant="gradient"
                                gradientFrom="from-blue-500"
                                gradientTo="to-indigo-600"
                                className="w-24 h-24 rounded-2xl shadow-xl"
                            />
                        </RevealOnScroll>

                        <div className="flex-1">
                            <RevealOnScroll direction="up" delay={0.3}>
                                <span className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-4 text-blue-600 dark:text-blue-400 text-sm font-medium">
                                    <Car className="w-4 h-4" />
                                    MOTOR INSURANCE
                                </span>
                            </RevealOnScroll>

                            <RevealOnScroll direction="up" delay={0.4}>
                                <h1 className="font-display font-bold text-4xl md:text-5xl text-theme-primary mb-6 leading-tight">
                                    <AnimatedHeading
                                        text="Motor Insurance in India"
                                        animation="letterByLetter"
                                    />
                                </h1>
                            </RevealOnScroll>

                            <RevealOnScroll direction="up" delay={0.5}>
                                <p className="text-theme-secondary text-lg max-w-2xl leading-relaxed">
                                    Car and bike insurance guide with NCB, IDV, and claim tips.
                                </p>
                            </RevealOnScroll>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <RevealOnScroll>
                        <h2 className="font-display font-bold text-2xl text-theme-primary mb-8 flex items-center gap-2">
                            <Shield className="w-7 h-7 text-accent" />
                            No Claim Bonus (NCB)
                        </h2>
                    </RevealOnScroll>

                    <StaggerContainer className="grid grid-cols-2 md:grid-cols-5 gap-4" staggerDelay={0.1}>
                        {ncbTable.map((item, i) => (
                            <StaggerItem key={i}>
                                <GlassCard className="text-center h-full hover:bg-accent/5 transition-colors" padding="md">
                                    <div className="font-display font-bold text-3xl text-accent mb-2">{item.discount}</div>
                                    <div className="text-theme-secondary text-sm font-medium">{item.year}</div>
                                </GlassCard>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </div>
            </section>

            <section className="py-16 px-6 glass-subtle">
                <div className="max-w-7xl mx-auto">
                    <RevealOnScroll>
                        <h2 className="font-display font-bold text-2xl text-theme-primary mb-8 flex items-center gap-2">
                            <Plus className="w-7 h-7 text-accent" />
                            Must-Have Add-ons
                        </h2>
                    </RevealOnScroll>

                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.1}>
                        {addOns.map((addon, i) => (
                            <StaggerItem key={i}>
                                <TiltCard containerClassName="h-full">
                                    <GlassCard className={`h-full ${addon.mustHave ? 'border-accent/30 bg-accent/5' : ''}`} padding="md">
                                        {addon.mustHave && (
                                            <span className="inline-flex items-center gap-1 text-xs text-accent mb-2 font-bold uppercase tracking-wider bg-accent/10 px-2 py-0.5 rounded-full">
                                                <CheckCircle className="w-3 h-3" /> Recommended
                                            </span>
                                        )}
                                        <h4 className="font-display font-semibold text-lg text-theme-primary mb-2">{addon.name}</h4>
                                        <p className="text-theme-secondary text-sm leading-relaxed">{addon.desc}</p>
                                    </GlassCard>
                                </TiltCard>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </div>
            </section>

            <section className="py-16 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <RevealOnScroll direction="up">
                        <Link href="/tools/calculator">
                            <MagicButton icon={Calculator} size="lg" glow>
                                Calculate Premium
                            </MagicButton>
                        </Link>
                    </RevealOnScroll>
                </div>
            </section>
        </div>
    )
}
