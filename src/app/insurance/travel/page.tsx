'use client'

import Link from 'next/link'
import { ArrowRight, Plane, AlertTriangle, Train, GraduationCap, User, Building2, Briefcase, XCircle, Clock, FileText, Siren, X, Search } from 'lucide-react'
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

const travelTypes = [
    { id: 'domestic', title: 'Domestic Travel', icon: Train, desc: 'Coverage within India for medical and trip issues', color: 'from-blue-500 to-indigo-600' },
    { id: 'international', title: 'International Travel', icon: Plane, desc: 'Medical, baggage, trip cancellation abroad', color: 'from-purple-500 to-violet-600' },
    { id: 'student', title: 'Student Travel', icon: GraduationCap, desc: 'Long-term cover for students abroad', color: 'from-emerald-500 to-teal-600' },
    { id: 'senior', title: 'Senior Citizen', icon: User, desc: 'Higher medical limits for elderly', color: 'from-amber-500 to-orange-600' },
]

const coverage = [
    { icon: Building2, title: 'Medical Expenses', desc: 'Hospital & treatment abroad', color: 'from-red-500 to-pink-600' },
    { icon: Briefcase, title: 'Baggage Loss', desc: 'Checked baggage compensation', color: 'from-blue-500 to-indigo-600' },
    { icon: XCircle, title: 'Trip Cancellation', desc: 'Non-refundable bookings', color: 'from-amber-500 to-orange-600' },
    { icon: Clock, title: 'Flight Delay', desc: 'Delay beyond 6-12 hours', color: 'from-purple-500 to-violet-600' },
    { icon: FileText, title: 'Passport Loss', desc: 'Emergency document help', color: 'from-slate-500 to-gray-600' },
    { icon: Siren, title: 'Evacuation', desc: 'Emergency repatriation', color: 'from-emerald-500 to-teal-600' },
]

const exclusions = [
    'Pre-existing medical conditions',
    'Adventure sports (without add-on)',
    'War zones and conflict areas',
    'Intoxication-related incidents',
    'Pregnancy beyond 24-28 weeks',
    'Routine check-ups and OPD',
]

export default function TravelInsurancePage() {
    return (
        <div className="min-h-screen pt-20">
            <section className="py-16 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <RevealOnScroll direction="down" delay={0.1}>
                        <div className="flex items-center gap-2 text-sm text-theme-secondary mb-8">
                            <Link href="/" className="hover:text-accent transition-colors">Home</Link>
                            <span>/</span>
                            <span className="text-theme-primary font-medium">Travel Insurance</span>
                        </div>
                    </RevealOnScroll>

                    <div className="flex flex-col md:flex-row items-start gap-8">
                        <RevealOnScroll direction="right" delay={0.2}>
                            <IconContainer
                                icon={Plane}
                                size="xl"
                                variant="gradient"
                                gradientFrom="from-purple-500"
                                gradientTo="to-violet-600"
                                className="w-24 h-24 rounded-2xl shadow-xl"
                            />
                        </RevealOnScroll>

                        <div className="flex-1">
                            <RevealOnScroll direction="up" delay={0.3}>
                                <span className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-4 text-purple-600 dark:text-purple-400 text-sm font-medium">
                                    <Plane className="w-4 h-4" />
                                    TRAVEL INSURANCE
                                </span>
                            </RevealOnScroll>

                            <RevealOnScroll direction="up" delay={0.4}>
                                <h1 className="font-display font-bold text-4xl md:text-5xl text-theme-primary mb-6 leading-tight">
                                    <AnimatedHeading
                                        text="Travel Insurance in India"
                                        animation="letterByLetter"
                                    />
                                </h1>
                            </RevealOnScroll>

                            <RevealOnScroll direction="up" delay={0.5}>
                                <p className="text-theme-secondary text-lg max-w-2xl leading-relaxed">
                                    Protect your trips with medical coverage, baggage protection, and trip cancellation benefits.
                                </p>
                            </RevealOnScroll>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <RevealOnScroll>
                        <h2 className="font-display font-bold text-2xl text-theme-primary mb-8">Types of Travel Insurance</h2>
                    </RevealOnScroll>

                    <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-6" staggerDelay={0.1}>
                        {travelTypes.map((type) => {
                            const IconComponent = type.icon
                            return (
                                <StaggerItem key={type.id} className="h-full">
                                    <TiltCard containerClassName="h-full">
                                        <GlassCard hover className="text-center h-full flex flex-col items-center justify-center" padding="lg">
                                            <div className={`w-14 h-14 mb-4 rounded-2xl bg-gradient-to-br ${type.color} flex items-center justify-center shadow-lg`}>
                                                <IconComponent className="w-7 h-7 text-white" strokeWidth={2} />
                                            </div>
                                            <h3 className="font-display font-semibold text-lg text-theme-primary mb-2">{type.title}</h3>
                                            <p className="text-theme-secondary text-sm leading-relaxed">{type.desc}</p>
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
                        <h2 className="font-display font-bold text-2xl text-theme-primary mb-8">What's Covered</h2>
                    </RevealOnScroll>

                    <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" staggerDelay={0.05}>
                        {coverage.map((item, i) => {
                            const IconComponent = item.icon
                            return (
                                <StaggerItem key={i}>
                                    <GlassCard className="text-center h-full hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors" padding="md">
                                        <div className={`w-10 h-10 mx-auto mb-3 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center shadow-sm`}>
                                            <IconComponent className="w-5 h-5 text-white" strokeWidth={2} />
                                        </div>
                                        <h4 className="font-medium text-theme-primary text-sm mb-1">{item.title}</h4>
                                        <p className="text-theme-muted text-xs leading-snug">{item.desc}</p>
                                    </GlassCard>
                                </StaggerItem>
                            )
                        })}
                    </StaggerContainer>
                </div>
            </section>

            <section className="py-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <RevealOnScroll direction="scale">
                        <GlassCard className="border-red-500/30 bg-red-500/5" padding="lg">
                            <h3 className="flex items-center gap-2 text-red-600 dark:text-red-400 font-display font-bold text-xl mb-6">
                                <AlertTriangle className="w-6 h-6" /> Common Exclusions
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
                                {exclusions.map((ex, i) => (
                                    <div key={i} className="flex items-start gap-3 text-theme-secondary text-base">
                                        <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                        <span>{ex}</span>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    </RevealOnScroll>
                </div>
            </section>

            <section className="py-16 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <RevealOnScroll direction="up">
                        <Link href="/tools/hidden-facts">
                            <MagicButton variant="secondary" icon={Search} size="lg">
                                View Travel Insurance Facts
                            </MagicButton>
                        </Link>
                    </RevealOnScroll>
                </div>
            </section>
        </div>
    )
}
