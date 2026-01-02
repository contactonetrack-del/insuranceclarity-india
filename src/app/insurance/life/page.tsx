'use client'

import Link from 'next/link'
import {
    ArrowRight, AlertTriangle, CheckCircle, Info, Scale, Calculator, Search, Heart,
    FileText, TrendingUp, Building, Shield
} from 'lucide-react'
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
    term: FileText,
    'whole-life': Shield,
    ulip: TrendingUp,
    endowment: Building,
}

const lifeInsuranceTypes = [
    {
        id: 'term',
        title: 'Term Life Insurance',
        description: 'Pure protection, highest coverage at lowest cost. No maturity benefit.',
        premium: '₹500-800/month for ₹1 Cr',
        pros: ['Highest coverage at lowest premium', 'Online plans 20-30% cheaper', 'Tax-free death benefit'],
        cons: ['No maturity benefit', 'Premium increases on renewal'],
        bestFor: 'Primary breadwinners, loan protection',
        color: 'from-emerald-500 to-teal-600',
    },
    {
        id: 'whole-life',
        title: 'Whole Life Insurance',
        description: 'Lifelong coverage with savings component. Builds cash value over time.',
        premium: '₹3,000-10,000/month',
        pros: ['Coverage until age 99-100', 'Builds cash value', 'Can take loans against policy'],
        cons: ['High premiums', 'Lower returns than investments', 'Surrender charges'],
        bestFor: 'Estate planning, wealth transfer',
        color: 'from-blue-500 to-indigo-600',
    },
    {
        id: 'ulip',
        title: 'ULIPs',
        description: 'Insurance + Market-linked investment. Choose equity, debt, or balanced funds.',
        premium: 'Min ₹2,500/month',
        pros: ['Insurance + investment', 'Fund switching flexibility', 'Tax benefits on gains'],
        cons: ['High charges in initial years', 'Market risk', 'Lock-in period 5 years'],
        bestFor: 'Long-term investors (10+ years)',
        color: 'from-purple-500 to-violet-600',
    },
    {
        id: 'endowment',
        title: 'Endowment Plans',
        description: 'Guaranteed returns with life cover. Conservative investment option.',
        premium: '₹5,000-20,000/month',
        pros: ['Guaranteed maturity benefit', 'Bonus additions', 'Loan facility'],
        cons: ['Low returns (4-6%)', 'High premium for low coverage', 'Surrender penalties'],
        bestFor: 'Conservative investors',
        color: 'from-amber-500 to-orange-600',
    },
]

const csrData = [
    { insurer: 'LIC of India', csr: '99.97%', rating: 'excellent' },
    { insurer: 'Max Life', csr: '99.39%', rating: 'excellent' },
    { insurer: 'ICICI Prudential', csr: '98.68%', rating: 'good' },
    { insurer: 'HDFC Life', csr: '98.54%', rating: 'good' },
    { insurer: 'SBI Life', csr: '97.84%', rating: 'good' },
]

export default function LifeInsurancePage() {
    return (
        <div className="min-h-screen pt-20">
            {/* Hero */}
            <section className="py-16 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    {/* Breadcrumb */}
                    <RevealOnScroll direction="down" delay={0.1}>
                        <div className="flex items-center gap-2 text-sm text-theme-secondary mb-8">
                            <Link href="/" className="hover:text-accent transition-colors">Home</Link>
                            <span>/</span>
                            <span className="text-theme-primary font-medium">Life Insurance</span>
                        </div>
                    </RevealOnScroll>

                    <div className="flex flex-col md:flex-row items-start gap-8">
                        <RevealOnScroll direction="right" delay={0.2}>
                            <IconContainer
                                icon={Heart}
                                size="xl"
                                variant="gradient"
                                gradientFrom="from-red-500"
                                gradientTo="to-pink-600"
                                className="w-24 h-24 rounded-2xl shadow-xl"
                            />
                        </RevealOnScroll>

                        <div className="flex-1">
                            <RevealOnScroll direction="up" delay={0.3}>
                                <span className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-4 text-red-500 dark:text-red-400 text-sm font-medium">
                                    <Heart className="w-4 h-4" />
                                    LIFE INSURANCE
                                </span>
                            </RevealOnScroll>

                            <RevealOnScroll direction="up" delay={0.4}>
                                <h1 className="font-display font-bold text-4xl md:text-5xl text-theme-primary mb-6 leading-tight">
                                    <AnimatedHeading
                                        text="Life Insurance in India"
                                        animation="letterByLetter"
                                    />
                                </h1>
                            </RevealOnScroll>

                            <RevealOnScroll direction="up" delay={0.5}>
                                <p className="text-theme-secondary text-lg max-w-2xl leading-relaxed">
                                    Complete guide to protecting your family's financial future. Understand term plans, ULIPs,
                                    endowment policies, and discover hidden facts that could affect your claim.
                                </p>
                            </RevealOnScroll>

                            <RevealOnScroll direction="up" delay={0.6}>
                                <div className="flex flex-wrap gap-4 mt-8">
                                    <Link href="/tools/compare">
                                        <MagicButton icon={Scale} size="lg" glow>
                                            Compare Life Insurance
                                        </MagicButton>
                                    </Link>
                                    <Link href="/tools/calculator">
                                        <MagicButton variant="secondary" icon={Calculator} size="lg">
                                            Premium Calculator
                                        </MagicButton>
                                    </Link>
                                </div>
                            </RevealOnScroll>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Stats */}
            <section className="py-8 px-6 glass-subtle border-y border-default">
                <div className="max-w-7xl mx-auto">
                    <RevealOnScroll direction="up" delay={0.2}>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <GlassCard className="text-center" padding="md">
                                <div className="font-display font-bold text-3xl text-theme-primary mb-1">6</div>
                                <div className="text-theme-secondary text-sm">Types Available</div>
                            </GlassCard>
                            <GlassCard className="text-center" padding="md">
                                <div className="font-display font-bold text-3xl text-accent mb-1">99.97%</div>
                                <div className="text-theme-secondary text-sm">Highest CSR</div>
                            </GlassCard>
                            <GlassCard className="text-center" padding="md">
                                <div className="font-display font-bold text-3xl text-theme-primary mb-1">24+</div>
                                <div className="text-theme-secondary text-sm">Insurers</div>
                            </GlassCard>
                            <GlassCard className="text-center" padding="md">
                                <div className="font-display font-bold text-3xl text-theme-primary mb-1">15-45</div>
                                <div className="text-theme-secondary text-sm">Days to Settle</div>
                            </GlassCard>
                        </div>
                    </RevealOnScroll>
                </div>
            </section>

            {/* Insurance Types */}
            <section className="py-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <RevealOnScroll>
                        <h2 className="font-display font-bold text-2xl text-theme-primary mb-8">Types of Life Insurance</h2>
                    </RevealOnScroll>

                    <StaggerContainer className="space-y-6" staggerDelay={0.1}>
                        {lifeInsuranceTypes.map((type) => {
                            const IconComponent = typeIcons[type.id as keyof typeof typeIcons]
                            return (
                                <StaggerItem key={type.id}>
                                    <TiltCard containerClassName="w-full">
                                        <GlassCard hover padding="lg" className="border-l-4 border-l-accent w-full cursor-pointer group">
                                            <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-14 h-14 flex items-center justify-center bg-gradient-to-br ${type.color} rounded-2xl shadow-md group-hover:scale-110 transition-transform duration-300`}>
                                                        <IconComponent className="w-7 h-7 text-white" strokeWidth={2} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-display font-semibold text-xl text-theme-primary group-hover:text-accent transition-colors">{type.title}</h3>
                                                        <p className="text-theme-secondary text-sm">{type.description}</p>
                                                    </div>
                                                </div>
                                                <div className="px-4 py-2 glass rounded-xl text-sm">
                                                    Avg Premium: <span className="text-accent font-medium">{type.premium}</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {/* Pros */}
                                                <div className="p-4 bg-accent-10 border border-hover rounded-xl">
                                                    <h4 className="flex items-center gap-2 text-accent font-medium mb-3">
                                                        <CheckCircle className="w-4 h-4" /> Key Benefits
                                                    </h4>
                                                    <ul className="space-y-2 text-sm text-theme-secondary">
                                                        {type.pros.map((pro, i) => (
                                                            <li key={i} className="flex items-start gap-2">
                                                                <ArrowRight className="w-3 h-3 mt-1 text-accent flex-shrink-0" /> {pro}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                {/* Cons */}
                                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                                    <h4 className="flex items-center gap-2 text-red-600 dark:text-red-400 font-medium mb-3">
                                                        <AlertTriangle className="w-4 h-4" /> Watch Out For
                                                    </h4>
                                                    <ul className="space-y-2 text-sm text-theme-secondary">
                                                        {type.cons.map((con, i) => (
                                                            <li key={i} className="flex items-start gap-2">
                                                                <AlertTriangle className="w-3 h-3 mt-1 text-red-500 flex-shrink-0" /> {con}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                {/* Best For */}
                                                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                                    <h4 className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium mb-3">
                                                        <Info className="w-4 h-4" /> Best For
                                                    </h4>
                                                    <p className="text-sm text-theme-secondary">{type.bestFor}</p>
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

            {/* CSR Section */}
            <section className="py-16 px-6 glass-subtle">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-10">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent-10 text-accent text-sm rounded-full mb-3 font-medium">
                            <Shield className="w-4 h-4" />
                            IRDAI DATA 2023-24
                        </span>
                        <h2 className="font-display font-bold text-2xl text-theme-primary">Claim Settlement Ratio</h2>
                        <p className="text-theme-secondary mt-2">Higher CSR = Better chances of your claim being paid</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {csrData.map((item, i) => (
                            <GlassCard key={i} hover className="text-center" padding="md">
                                <div className={`font-display font-bold text-2xl ${item.rating === 'excellent' ? 'text-accent' : 'text-theme-primary'}`}>
                                    {item.csr}
                                </div>
                                <div className="text-theme-primary font-medium mt-2">{item.insurer}</div>
                                <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${item.rating === 'excellent' ? 'bg-accent-10 text-accent' : 'bg-theme-secondary/10 text-theme-secondary'
                                    }`}>
                                    {item.rating === 'excellent' ? 'Excellent' : 'Very Good'}
                                </span>
                            </GlassCard>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="pb-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <RevealOnScroll direction="up">
                        <GlassCard className="text-center" padding="lg">
                            <h2 className="font-display font-bold text-2xl text-theme-primary mb-4">
                                Ready to Compare Life Insurance?
                            </h2>
                            <p className="text-theme-secondary mb-6">
                                Use our tools to find the best policy for your needs.
                            </p>
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
