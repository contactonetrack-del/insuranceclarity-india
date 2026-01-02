import Link from 'next/link'
import { ArrowRight, AlertTriangle, CheckCircle, Clock, Building2, Users, HeartPulse, User, TrendingUp, Pill, Eye, Smile, Syringe, Stethoscope, Calculator, Search } from 'lucide-react'
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
    individual: User,
    'family-floater': Users,
    'critical-illness': HeartPulse,
    'senior-citizen': User,
    'super-topup': TrendingUp,
}

const exclusionIcons = {
    opd: Pill,
    dental: Smile,
    vision: Eye,
    cosmetic: Syringe,
    maternity: HeartPulse,
    preexisting: Stethoscope,
}

const healthInsuranceTypes = [
    {
        id: 'individual',
        title: 'Individual Health Insurance',
        description: 'Medical cover for a single person with pre/post hospitalization.',
        premium: '₹5,000-15,000/year for ₹5L',
        color: 'from-emerald-500 to-teal-600',
    },
    {
        id: 'family-floater',
        title: 'Family Floater',
        description: 'One policy for entire family. Shared sum insured.',
        premium: '₹15,000-40,000/year for ₹10L',
        color: 'from-blue-500 to-indigo-600',
    },
    {
        id: 'critical-illness',
        title: 'Critical Illness Cover',
        description: 'Lump sum on diagnosis of major diseases like cancer, heart attack.',
        premium: '₹3,000-10,000/year for ₹10L',
        color: 'from-red-500 to-pink-600',
    },
    {
        id: 'senior-citizen',
        title: 'Senior Citizen Health',
        description: 'Designed for individuals above 60 years with specific benefits.',
        premium: '₹25,000-60,000/year for ₹5L',
        color: 'from-purple-500 to-violet-600',
    },
    {
        id: 'super-topup',
        title: 'Super Top-up',
        description: 'High coverage at low cost. Kicks in after deductible.',
        premium: '₹3,000-8,000/year for ₹50L',
        color: 'from-amber-500 to-orange-600',
    },
]

const commonExclusions = [
    { icon: Pill, title: 'OPD Treatment', desc: 'Doctor visits without hospitalization' },
    { icon: Smile, title: 'Dental Treatment', desc: 'Unless due to accident' },
    { icon: Eye, title: 'Vision Correction', desc: 'Spectacles, LASIK surgery' },
    { icon: Syringe, title: 'Cosmetic Procedures', desc: 'Unless medically necessary' },
    { icon: HeartPulse, title: 'Maternity', desc: '2-4 year waiting period' },
    { icon: Stethoscope, title: 'Pre-existing Diseases', desc: '2-4 year waiting period' },
]

const waitingPeriods = [
    { type: 'Initial Waiting', period: '30 Days', desc: 'No coverage for first 30 days (except accidents)' },
    { type: 'Specific Diseases', period: '2 Years', desc: 'Hernia, cataract, ENT disorders, etc.' },
    { type: 'Pre-existing Diseases', period: '2-4 Years', desc: 'Diabetes, BP, thyroid, etc.' },
    { type: 'Maternity', period: '2-4 Years', desc: 'Pregnancy and delivery costs' },
]

export default function HealthInsurancePage() {
    return (
        <div className="min-h-screen pt-20">
            {/* Hero */}
            <section className="py-16 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <RevealOnScroll direction="down" delay={0.1}>
                        <div className="flex items-center gap-2 text-sm text-theme-secondary mb-8">
                            <Link href="/" className="hover:text-accent transition-colors">Home</Link>
                            <span>/</span>
                            <span className="text-theme-primary font-medium">Health Insurance</span>
                        </div>
                    </RevealOnScroll>

                    <div className="flex flex-col md:flex-row items-start gap-8">
                        <RevealOnScroll direction="right" delay={0.2}>
                            <IconContainer
                                icon={Building2}
                                size="xl"
                                variant="gradient"
                                gradientFrom="from-emerald-500"
                                gradientTo="to-teal-600"
                                className="w-24 h-24 rounded-2xl shadow-xl"
                            />
                        </RevealOnScroll>

                        <div className="flex-1">
                            <RevealOnScroll direction="up" delay={0.3}>
                                <span className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-4 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                                    <Building2 className="w-4 h-4" />
                                    HEALTH INSURANCE
                                </span>
                            </RevealOnScroll>

                            <RevealOnScroll direction="up" delay={0.4}>
                                <h1 className="font-display font-bold text-4xl md:text-5xl text-theme-primary mb-6 leading-tight">
                                    <AnimatedHeading
                                        text="Health Insurance in India"
                                        animation="letterByLetter"
                                    />
                                </h1>
                            </RevealOnScroll>

                            <RevealOnScroll direction="up" delay={0.5}>
                                <p className="text-theme-secondary text-lg max-w-2xl leading-relaxed">
                                    Your complete guide to medical insurance. Understand individual plans, family floaters,
                                    critical illness cover, and discover the hidden exclusions that lead to claim rejections.
                                </p>
                            </RevealOnScroll>
                        </div>
                    </div>
                </div>
            </section>

            {/* Common Exclusions Alert */}
            <section className="py-8 px-6">
                <div className="max-w-7xl mx-auto">
                    <RevealOnScroll>
                        <GlassCard className="border-red-500/30 bg-red-500/5" padding="lg">
                            <h3 className="flex items-center gap-2 text-red-600 dark:text-red-400 font-display font-semibold text-lg mb-6">
                                <AlertTriangle className="w-5 h-5" />
                                Common Exclusions - What Health Insurance Does NOT Cover
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                {commonExclusions.map((item, i) => {
                                    const IconComponent = item.icon
                                    return (
                                        <div key={i} className="text-center p-4 glass rounded-xl hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors duration-300">
                                            <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-red-500/10 flex items-center justify-center">
                                                <IconComponent className="w-5 h-5 text-red-500" />
                                            </div>
                                            <div className="font-medium text-theme-primary text-sm mb-1">{item.title}</div>
                                            <div className="text-theme-muted text-xs">{item.desc}</div>
                                        </div>
                                    )
                                })}
                            </div>
                        </GlassCard>
                    </RevealOnScroll>
                </div>
            </section>

            {/* Insurance Types */}
            <section className="py-12 px-6">
                <div className="max-w-7xl mx-auto">
                    <RevealOnScroll>
                        <h2 className="font-display font-bold text-2xl text-theme-primary mb-8">Types of Health Insurance</h2>
                    </RevealOnScroll>

                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
                        {healthInsuranceTypes.map((type) => {
                            const IconComponent = typeIcons[type.id as keyof typeof typeIcons]
                            return (
                                <StaggerItem key={type.id} className="h-full">
                                    <TiltCard containerClassName="h-full" className="h-full">
                                        <GlassCard hover glowOnHover className="h-full flex flex-col group cursor-pointer">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className={`w-14 h-14 flex items-center justify-center bg-gradient-to-br ${type.color} rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                                    <IconComponent className="w-7 h-7 text-white" strokeWidth={2} />
                                                </div>
                                                <ArrowRight className="w-5 h-5 text-theme-muted opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                                            </div>

                                            <h3 className="font-display font-semibold text-xl text-theme-primary mb-2 group-hover:text-accent transition-colors">
                                                {type.title}
                                            </h3>
                                            <p className="text-theme-secondary text-sm mb-6 flex-1">{type.description}</p>

                                            <div className="pt-4 border-t border-default/10">
                                                <div className="text-xs text-theme-muted uppercase tracking-wider font-semibold mb-1">Estimated Premium</div>
                                                <div className="text-sm font-medium text-accent">
                                                    {type.premium}
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

            {/* Waiting Periods */}
            <section className="py-16 px-6 glass-subtle relative overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10">
                    <RevealOnScroll>
                        <h2 className="font-display font-bold text-2xl text-theme-primary mb-2 flex items-center gap-2">
                            <Clock className="w-7 h-7 text-amber-500" />
                            Waiting Periods You MUST Know
                        </h2>
                        <p className="text-theme-secondary mb-10 text-lg">Claims during waiting period will be rejected! <span className="font-semibold text-red-500">Don't ignore this.</span></p>
                    </RevealOnScroll>

                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.1}>
                        {waitingPeriods.map((item, i) => (
                            <StaggerItem key={i}>
                                <GlassCard padding="md" className="h-full border-l-4 border-l-amber-500/50 hover:border-l-amber-500 transition-colors">
                                    <div className="text-amber-500 font-display font-bold text-3xl mb-2">{item.period}</div>
                                    <div className="font-medium text-theme-primary text-lg">{item.type}</div>
                                    <div className="text-theme-secondary text-sm mt-3 leading-relaxed">{item.desc}</div>
                                </GlassCard>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </div>
            </section>

            {/* Pro Tip */}
            <section className="py-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <RevealOnScroll direction="scale">
                        <GlassCard className="border-accent/30 bg-accent-5 overflow-hidden relative" padding="lg">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-32 -mt-32" />
                            <div className="relative z-10">
                                <h3 className="flex items-center gap-3 text-accent font-display font-bold text-xl mb-4">
                                    <CheckCircle className="w-6 h-6" />
                                    Pro Tip: Super Top-up Strategy
                                </h3>
                                <p className="text-theme-secondary text-lg leading-relaxed">
                                    If you have a family floater of ₹10 lakhs, add a super top-up of ₹50 lakhs with ₹10L deductible.
                                    This costs only <span className="text-accent font-bold bg-accent/10 px-1 rounded">₹3,000-5,000/year extra</span> and gives you <span className="text-accent font-bold bg-accent/10 px-1 rounded">₹60L total coverage</span>.
                                </p>
                            </div>
                        </GlassCard>
                    </RevealOnScroll>
                </div>
            </section>

            {/* CTA */}
            <section className="pb-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <RevealOnScroll direction="up">
                        <GlassCard className="text-center" padding="lg">
                            <h2 className="font-display font-bold text-2xl text-theme-primary mb-8">
                                Need Help Choosing Health Insurance?
                            </h2>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Link href="/tools/calculator">
                                    <MagicButton icon={Calculator} size="lg" glow>
                                        Calculate Premium
                                    </MagicButton>
                                </Link>
                                <Link href="/tools/hidden-facts">
                                    <MagicButton variant="secondary" icon={Search} size="lg">
                                        View Hidden Facts
                                    </MagicButton>
                                </Link>
                            </div>
                        </GlassCard>
                    </RevealOnScroll>
                </div>
            </section>
        </div>
    )
}
