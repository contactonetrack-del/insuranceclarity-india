'use client'

import Link from 'next/link'
import { ArrowRight, AlertTriangle, UserCheck, HeartOff, CircleOff, Activity, Building2, Pill, Siren, X, Search } from 'lucide-react'
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

const coverage = [
    { icon: HeartOff, title: 'Accidental Death', desc: '100% of sum assured', color: 'from-red-500 to-rose-600' },
    { icon: CircleOff, title: 'Permanent Total Disability', desc: '100% of sum assured', color: 'from-purple-500 to-violet-600' },
    { icon: Activity, title: 'Permanent Partial Disability', desc: 'Percentage based on scale', color: 'from-blue-500 to-indigo-600' },
    { icon: Building2, title: 'Temporary Total Disability', desc: 'Weekly/monthly benefit', color: 'from-amber-500 to-orange-600' },
    { icon: Pill, title: 'Medical Expenses', desc: 'Up to sub-limit', color: 'from-emerald-500 to-teal-600' },
    { icon: Siren, title: 'Emergency Transport', desc: 'Ambulance charges', color: 'from-cyan-500 to-blue-600' },
]

const disabilityScale = [
    { injury: 'Loss of both eyes', payout: '100%' },
    { injury: 'Loss of both hands/feet', payout: '100%' },
    { injury: 'Loss of one hand + one foot', payout: '100%' },
    { injury: 'Loss of one eye', payout: '50%' },
    { injury: 'Loss of one hand', payout: '50%' },
    { injury: 'Loss of thumb', payout: '25%' },
    { injury: 'Loss of index finger', payout: '10%' },
]

const exclusions = [
    'Self-inflicted injuries',
    'Suicide or attempted suicide',
    'Intoxication (alcohol/drugs)',
    'Participation in crime',
    'War and nuclear risks',
    'Pre-existing disability',
    'Pregnancy complications',
    'Hazardous sports (without add-on)',
]

export default function PersonalAccidentPage() {
    return (
        <div className="min-h-screen pt-20">
            <section className="py-16 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <RevealOnScroll direction="down" delay={0.1}>
                        <div className="flex items-center gap-2 text-sm text-theme-secondary mb-8">
                            <Link href="/" className="hover:text-accent transition-colors">Home</Link>
                            <span>/</span>
                            <span className="text-theme-primary font-medium">Personal Accident</span>
                        </div>
                    </RevealOnScroll>

                    <div className="flex flex-col md:flex-row items-start gap-8">
                        <RevealOnScroll direction="right" delay={0.2}>
                            <IconContainer
                                icon={UserCheck}
                                size="xl"
                                variant="gradient"
                                gradientFrom="from-rose-500"
                                gradientTo="to-red-600"
                                className="w-24 h-24 rounded-2xl shadow-xl"
                            />
                        </RevealOnScroll>

                        <div className="flex-1">
                            <RevealOnScroll direction="up" delay={0.3}>
                                <span className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-4 text-rose-600 dark:text-rose-400 text-sm font-medium">
                                    <UserCheck className="w-4 h-4" />
                                    PERSONAL ACCIDENT
                                </span>
                            </RevealOnScroll>

                            <RevealOnScroll direction="up" delay={0.4}>
                                <h1 className="font-display font-bold text-4xl md:text-5xl text-theme-primary mb-6 leading-tight">
                                    <AnimatedHeading
                                        text="Personal Accident Insurance"
                                        animation="letterByLetter"
                                    />
                                </h1>
                            </RevealOnScroll>

                            <RevealOnScroll direction="up" delay={0.5}>
                                <p className="text-theme-secondary text-lg max-w-2xl leading-relaxed">
                                    Protection against accidental death, disability, and injury-related expenses.
                                </p>
                            </RevealOnScroll>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <RevealOnScroll>
                        <h2 className="font-display font-bold text-2xl text-theme-primary mb-8">What's Covered</h2>
                    </RevealOnScroll>

                    <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 gap-6" staggerDelay={0.1}>
                        {coverage.map((item, i) => {
                            const IconComponent = item.icon
                            return (
                                <StaggerItem key={i}>
                                    <TiltCard>
                                        <GlassCard className="h-full hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors" padding="md">
                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 shadow-sm`}>
                                                <IconComponent className="w-6 h-6 text-white" strokeWidth={2} />
                                            </div>
                                            <h4 className="font-display font-semibold text-lg text-theme-primary mb-1">{item.title}</h4>
                                            <p className="text-theme-secondary text-sm leading-relaxed">{item.desc}</p>
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
                        <h2 className="font-display font-bold text-2xl text-theme-primary mb-8">Disability Payout Scale</h2>
                    </RevealOnScroll>

                    <RevealOnScroll direction="up" delay={0.2}>
                        <GlassCard padding="none" className="overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-default bg-accent/5">
                                            <th className="py-4 px-6 text-theme-secondary font-semibold text-sm uppercase tracking-wider">Injury Type</th>
                                            <th className="py-4 px-6 text-theme-secondary font-semibold text-sm uppercase tracking-wider text-right">Payout</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-default">
                                        {disabilityScale.map((row, i) => (
                                            <tr key={i} className="hover:bg-accent/5 transition-colors">
                                                <td className="py-4 px-6 text-theme-primary font-medium">{row.injury}</td>
                                                <td className="py-4 px-6 text-accent text-right font-bold text-lg">{row.payout}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </GlassCard>
                    </RevealOnScroll>
                </div>
            </section>

            <section className="py-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <RevealOnScroll direction="scale">
                        <GlassCard className="border-red-500/30 bg-red-500/5" padding="lg">
                            <h3 className="flex items-center gap-2 text-red-600 dark:text-red-400 font-display font-bold text-xl mb-6">
                                <AlertTriangle className="w-6 h-6" /> Exclusions
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-8">
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
                                View PA Insurance Facts
                            </MagicButton>
                        </Link>
                    </RevealOnScroll>
                </div>
            </section>
        </div>
    )
}
