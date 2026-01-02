'use client'

import Link from 'next/link'
import { ArrowRight, AlertTriangle, Gem, Dog, Heart, Sparkles, Wheat, Smartphone, Plane as Drone, Search } from 'lucide-react'
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

const specializedTypes = [
    { id: 'pet', title: 'Pet Insurance', icon: Dog, desc: 'Medical and liability for pets', color: 'from-amber-500 to-orange-600' },
    { id: 'wedding', title: 'Wedding Insurance', icon: Heart, desc: 'Cancellation and event coverage', color: 'from-pink-500 to-rose-600' },
    { id: 'jewellery', title: 'Jewellery Insurance', icon: Sparkles, desc: 'Precious items protection', color: 'from-purple-500 to-violet-600' },
    { id: 'crop', title: 'Crop Insurance', icon: Wheat, desc: 'Agricultural protection', color: 'from-green-500 to-emerald-600' },
    { id: 'gadget', title: 'Gadget Insurance', icon: Smartphone, desc: 'Phones, laptops, cameras', color: 'from-blue-500 to-indigo-600' },
    { id: 'drone', title: 'Drone Insurance', icon: Drone, desc: 'Liability and damage', color: 'from-cyan-500 to-teal-600' },
]

const hiddenTraps = [
    { type: 'Pet', trap: 'Age limits - most policies expire at 8 years' },
    { type: 'Wedding', trap: 'Change of mind not covered - only unforeseen events' },
    { type: 'Crop', trap: 'Weather station data used, not actual farm conditions' },
    { type: 'Jewellery', trap: 'Must be valued by approved valuer before claim' },
    { type: 'Gadget', trap: 'Devices over 1-2 years may not be insurable' },
]

export default function SpecializedInsurancePage() {
    return (
        <div className="min-h-screen pt-20">
            <section className="py-16 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <RevealOnScroll direction="down" delay={0.1}>
                        <div className="flex items-center gap-2 text-sm text-theme-secondary mb-8">
                            <Link href="/" className="hover:text-accent transition-colors">Home</Link>
                            <span>/</span>
                            <span className="text-theme-primary font-medium">Specialized Insurance</span>
                        </div>
                    </RevealOnScroll>

                    <div className="flex flex-col md:flex-row items-start gap-8">
                        <RevealOnScroll direction="right" delay={0.2}>
                            <IconContainer
                                icon={Gem}
                                size="xl"
                                variant="gradient"
                                gradientFrom="from-cyan-500"
                                gradientTo="to-blue-600"
                                className="w-24 h-24 rounded-2xl shadow-xl"
                            />
                        </RevealOnScroll>

                        <div className="flex-1">
                            <RevealOnScroll direction="up" delay={0.3}>
                                <span className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-4 text-cyan-600 dark:text-cyan-400 text-sm font-medium">
                                    <Gem className="w-4 h-4" />
                                    SPECIALIZED INSURANCE
                                </span>
                            </RevealOnScroll>

                            <RevealOnScroll direction="up" delay={0.4}>
                                <h1 className="font-display font-bold text-4xl md:text-5xl text-theme-primary mb-6 leading-tight">
                                    <AnimatedHeading
                                        text="Specialized Insurance"
                                        animation="letterByLetter"
                                    />
                                </h1>
                            </RevealOnScroll>

                            <RevealOnScroll direction="up" delay={0.5}>
                                <p className="text-theme-secondary text-lg max-w-2xl leading-relaxed">
                                    Unique insurance products for pets, weddings, jewellery, crops, gadgets, and more.
                                </p>
                            </RevealOnScroll>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <RevealOnScroll>
                        <h2 className="font-display font-bold text-2xl text-theme-primary mb-8">Types of Specialized Insurance</h2>
                    </RevealOnScroll>

                    <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 gap-6" staggerDelay={0.1}>
                        {specializedTypes.map((type) => {
                            const IconComponent = type.icon
                            return (
                                <StaggerItem key={type.id}>
                                    <TiltCard>
                                        <GlassCard hover className="h-full hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors" padding="md">
                                            <div className={`w-14 h-14 flex items-center justify-center bg-gradient-to-br ${type.color} rounded-xl mb-4 shadow-sm`}>
                                                <IconComponent className="w-7 h-7 text-white" strokeWidth={2} />
                                            </div>
                                            <h3 className="font-display font-semibold text-lg text-theme-primary">{type.title}</h3>
                                            <p className="text-theme-secondary text-sm mt-2 leading-relaxed">{type.desc}</p>
                                        </GlassCard>
                                    </TiltCard>
                                </StaggerItem>
                            )
                        })}
                    </StaggerContainer>
                </div>
            </section>

            <section className="py-16 px-6 glass-subtle">
                <div className="max-w-7xl mx-auto">
                    <RevealOnScroll>
                        <h2 className="font-display font-bold text-2xl text-theme-primary mb-8 flex items-center gap-2">
                            <AlertTriangle className="w-7 h-7 text-amber-500" /> Hidden Traps to Watch
                        </h2>
                    </RevealOnScroll>

                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6" staggerDelay={0.1}>
                        {hiddenTraps.map((item, i) => (
                            <StaggerItem key={i}>
                                <GlassCard className="border-amber-500/30 bg-amber-500/5 h-full" padding="md">
                                    <span className="text-amber-600 dark:text-amber-400 font-bold text-lg block mb-2">{item.type}</span>
                                    <p className="text-theme-secondary text-base">{item.trap}</p>
                                </GlassCard>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </div>
            </section>

            <section className="py-16 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <RevealOnScroll direction="up">
                        <Link href="/tools/hidden-facts">
                            <MagicButton variant="secondary" icon={Search} size="lg">
                                View All Specialized Facts
                            </MagicButton>
                        </Link>
                    </RevealOnScroll>
                </div>
            </section>
        </div>
    )
}
