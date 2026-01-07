'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRef } from 'react'
import {
    ArrowRight, Shield, Search, BarChart3, FileText, Sparkles, Scale,
    Heart, Building2, Car, Home, Plane, Gem, Calculator
} from 'lucide-react'

// Premium components
import {
    RevealOnScroll,
    StaggerContainer,
    StaggerItem,
    ParallaxSection,
    MagicButton,
    AnimatedCounter,
    AnimatedHeading,
    GradientText,
    GlassCard,
    IconContainer,
    AnimatedBlob,
    FloatingElement,
    Magnetic,
    TiltCard,
    TextRoll
} from '@/components/premium'
import InfinityTicker from '@/components/InfinityTicker'

// Insurance categories with semantic icons
const insuranceCategories = [
    { href: '/insurance/life', icon: Heart, title: 'Life Insurance', desc: 'Term, Whole Life, ULIPs', color: 'from-red-500 to-pink-600' },
    { href: '/insurance/health', icon: Building2, title: 'Health Insurance', desc: 'Individual, Family, Critical Illness', color: 'from-emerald-500 to-teal-600' },
    { href: '/insurance/motor', icon: Car, title: 'Motor Insurance', desc: 'Car, Bike, Comprehensive', color: 'from-blue-500 to-indigo-600' },
    { href: '/insurance/home', icon: Home, title: 'Home Insurance', desc: 'Building, Contents, Fire', color: 'from-amber-500 to-orange-600' },
    { href: '/insurance/travel', icon: Plane, title: 'Travel Insurance', desc: 'Domestic, International', color: 'from-purple-500 to-violet-600' },
    { href: '/insurance/specialized', icon: Gem, title: 'Specialized', desc: 'Pet, Wedding, Gadget', color: 'from-cyan-500 to-blue-600' },
]

// Tools with semantic icons
const tools = [
    { href: '/tools/hidden-facts', icon: Search, title: 'Hidden Facts Revealer', desc: '150+ exclusions insurers don\'t tell you', badge: '150+ Facts', color: 'from-red-500 to-rose-600' },
    { href: '/tools/calculator', icon: Calculator, title: 'Premium Calculator', desc: 'Get instant premium estimates', badge: 'Free', color: 'from-emerald-500 to-green-600' },
    { href: '/tools/compare', icon: Scale, title: 'Policy Comparison', desc: 'Compare features side by side', badge: 'Popular', color: 'from-blue-500 to-indigo-600' },
    { href: '/tools/claim-cases', icon: FileText, title: 'Real Claim Cases', desc: 'Learn from real claim outcomes', badge: '30+ Cases', color: 'from-amber-500 to-yellow-600' },
]

const stats = [
    { value: 150, label: 'Hidden Facts', icon: Search, suffix: '+' },
    { value: 8, label: 'Insurance Types', icon: Shield, suffix: '' },
    { value: 4, label: 'Free Tools', icon: BarChart3, suffix: '' },
    { value: 30, label: 'Claim Cases', icon: FileText, suffix: '+' },
]

export default function HomePage() {
    const heroRef = useRef<HTMLElement>(null)

    return (
        <div className="min-h-screen">
            {/* Hero Section - Original Design */}
            <section className="relative pt-32 pb-16 px-6 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <RevealOnScroll direction="down">
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-full 
                             text-emerald-700 dark:text-emerald-400 text-sm mb-6 font-medium">
                            <Sparkles className="w-4 h-4" />
                            India's Most Transparent Insurance Platform
                        </span>
                    </RevealOnScroll>

                    <RevealOnScroll direction="up" delay={0.1}>
                        <p className="text-theme-secondary text-lg mb-4">
                            Smart Protection for your <TextRoll texts={['Health', 'Life', 'Vehicle', 'Home', 'Family']} />
                        </p>
                    </RevealOnScroll>

                    <RevealOnScroll direction="up" delay={0.2}>
                        <h1 className="font-display font-bold text-4xl md:text-6xl mb-6 leading-tight tracking-tight">
                            <span className="text-theme-primary">Discover What Insurance</span><br />
                            <span className="text-gradient italic">Companies Hide From You</span>
                        </h1>
                    </RevealOnScroll>

                    <RevealOnScroll direction="up" delay={0.3}>
                        <p className="text-theme-secondary text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                            Compare policies, uncover hidden exclusions, and make informed decisions.
                            We show you the fine print that could save your claim.
                        </p>
                    </RevealOnScroll>

                    <RevealOnScroll direction="up" delay={0.4}>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                            <Link href="/tools/hidden-facts" className="btn-primary text-lg px-8 py-4 w-full sm:w-auto group">
                                <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                Explore Hidden Facts
                            </Link>
                            <Link href="/tools/calculator" className="btn-secondary text-lg px-8 py-4 w-full sm:w-auto group">
                                Calculate Premium
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </RevealOnScroll>
                </div>
            </section>

            {/* Logo Ticker Section - Separate from Hero */}
            <section className="py-4 bg-slate-100 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto">
                    <InfinityTicker
                        speed={1.5}
                        direction="left"
                        items={[
                            <Image key="lic" src="/Logos/life-insurance-corporation-logo-png_seeklogo-477287.png" alt="LIC" width={100} height={50} className="h-10 w-auto object-contain" />,
                            <Image key="hdfc" src="/Logos/HDFC-Life-Logo.png" alt="HDFC Life" width={120} height={50} className="h-8 w-auto object-contain" />,
                            <Image key="icici" src="/Logos/icici-prudential-life-insurance-logo-png_seeklogo-307031.png" alt="ICICI Prudential" width={140} height={50} className="h-8 w-auto object-contain" />,
                            <Image key="sbi" src="/Logos/sbi-life-insurance-logo-png_seeklogo-123116.png" alt="SBI Life" width={120} height={50} className="h-10 w-auto object-contain" />,
                            <Image key="max" src="/Logos/axis-max-life-insurance-logo-png_seeklogo-643158.png" alt="Max Life" width={100} height={50} className="h-8 w-auto object-contain" />,
                            <Image key="tata" src="/Logos/tata-aia-life-insurance-seeklogo.png" alt="Tata AIA" width={100} height={50} className="h-8 w-auto object-contain" />,
                            <Image key="bajaj" src="/Logos/bajaj-allianz-life-insurance-logo-png_seeklogo-307030.png" alt="Bajaj Allianz" width={120} height={50} className="h-8 w-auto object-contain" />,
                            <Image key="star" src="/Logos/star-health-insurance-logo-png_seeklogo-303863.png" alt="Star Health" width={100} height={50} className="h-10 w-auto object-contain" />,
                            <Image key="care" src="/Logos/Care_health_insurance_logo.png" alt="Care Health" width={100} height={50} className="h-8 w-auto object-contain" />,
                            <Image key="acko" src="/Logos/Acko_General_Insurance_logo.svg.png" alt="Acko" width={100} height={50} className="h-6 w-auto object-contain" />,
                        ]}
                    />
                    <p className="text-center text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-[0.2em] mt-4 pb-2">
                        Analyzing Policies From Top Insurers
                    </p>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 glass-subtle">
                <div className="max-w-7xl mx-auto px-6">
                    <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-6" staggerDelay={0.1}>
                        {stats.map((stat, i) => (
                            <StaggerItem key={i} className="text-center">
                                <div className="flex justify-center mb-3">
                                    <IconContainer
                                        icon={stat.icon}
                                        size="md"
                                        variant="glass"
                                    />
                                </div>
                                <div className="font-display font-extrabold text-4xl md:text-5xl text-gradient mb-1">
                                    <AnimatedCounter
                                        value={stat.value}
                                        suffix={stat.suffix}
                                        duration={1.5}
                                    />
                                </div>
                                <div className="text-theme-secondary">{stat.label}</div>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </div>
            </section>

            {/* Insurance Categories */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <RevealOnScroll className="text-center mb-12">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent-10 text-accent 
                           text-sm rounded-full mb-4 font-medium">
                            <Shield className="w-4 h-4" />
                            BROWSE INSURANCE
                        </span>
                        <h2 className="font-display font-bold text-3xl md:text-4xl text-theme-primary">
                            Explore Insurance Types
                        </h2>
                        <p className="text-theme-secondary mt-4 max-w-xl mx-auto">
                            Comprehensive guides for every insurance category with hidden facts and real claim cases.
                        </p>
                    </RevealOnScroll>

                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.08}>
                        {insuranceCategories.map((cat) => (
                            <StaggerItem key={cat.href}>
                                <Link href={cat.href} className="block h-full">
                                    <TiltCard containerClassName="h-full" className="h-full">
                                        <GlassCard
                                            hover
                                            glowOnHover
                                            className="cursor-pointer group h-full"
                                        >
                                            <div className="flex items-start gap-4">
                                                <IconContainer
                                                    icon={cat.icon}
                                                    size="lg"
                                                    variant="gradient"
                                                    gradientFrom={`from-${cat.color.split(' ')[0].replace('from-', '')}`}
                                                    gradientTo={`to-${cat.color.split(' ')[1].replace('to-', '')}`}
                                                />
                                                <div className="flex-1">
                                                    <h3 className="font-display font-semibold text-lg text-theme-primary mb-1 
                                                     group-hover:text-accent transition-colors duration-150">
                                                        {cat.title}
                                                    </h3>
                                                    <p className="text-theme-secondary text-sm">{cat.desc}</p>
                                                </div>
                                                <ArrowRight className="w-5 h-5 text-theme-muted opacity-0 group-hover:opacity-100 
                                                    group-hover:translate-x-1 transition-all duration-200" />
                                            </div>
                                        </GlassCard>
                                    </TiltCard>
                                </Link>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </div>
            </section>

            {/* Tools Section */}
            <section className="py-20 px-6 glass-subtle">
                <div className="max-w-7xl mx-auto">
                    <RevealOnScroll className="text-center mb-12">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent-10 text-accent 
                           text-sm rounded-full mb-4 font-medium">
                            <BarChart3 className="w-4 h-4" />
                            FREE TOOLS
                        </span>
                        <h2 className="font-display font-bold text-3xl md:text-4xl text-theme-primary">
                            Tools to Make Better Decisions
                        </h2>
                        <p className="text-theme-secondary mt-4 max-w-xl mx-auto">
                            Our unique tools help you understand policies better than any agent will tell you.
                        </p>
                    </RevealOnScroll>

                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6" staggerDelay={0.1}>
                        {tools.map((tool) => (
                            <StaggerItem key={tool.href}>
                                <Link href={tool.href}>
                                    <GlassCard
                                        hover
                                        glowOnHover
                                        className="cursor-pointer group"
                                    >
                                        <div className="flex gap-5 items-center">
                                            <IconContainer
                                                icon={tool.icon}
                                                size="xl"
                                                variant="gradient"
                                                gradientFrom={`from-${tool.color.split(' ')[0].replace('from-', '')}`}
                                                gradientTo={`to-${tool.color.split(' ')[1].replace('to-', '')}`}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="font-display font-semibold text-lg text-theme-primary 
                                                     group-hover:text-accent transition-colors duration-150">
                                                        {tool.title}
                                                    </h3>
                                                    <span className="px-2 py-0.5 bg-accent-10 text-accent text-xs rounded-full font-medium">
                                                        {tool.badge}
                                                    </span>
                                                </div>
                                                <p className="text-theme-secondary text-sm">{tool.desc}</p>
                                            </div>
                                            <ArrowRight className="w-6 h-6 text-theme-muted opacity-0 group-hover:opacity-100 
                                                  group-hover:translate-x-1 transition-all duration-200" />
                                        </div>
                                    </GlassCard>
                                </Link>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <RevealOnScroll direction="scale">
                        <GlassCard padding="lg" className="relative overflow-hidden">
                            {/* Subtle gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-accent-5 via-transparent to-transparent pointer-events-none" />

                            <div className="relative z-10">
                                <IconContainer
                                    icon={Search}
                                    size="xl"
                                    variant="gradient"
                                    className="mx-auto mb-6"
                                />

                                <h2 className="font-display font-bold text-3xl md:text-4xl text-theme-primary mb-4">
                                    Ready to Understand Your Insurance?
                                </h2>
                                <p className="text-theme-secondary text-lg mb-8 max-w-xl mx-auto">
                                    Start with the Hidden Facts tool and discover what your policy really covers.
                                </p>

                                <Link href="/tools/hidden-facts">
                                    <MagicButton icon={Search} size="lg" glow>
                                        Explore Hidden Facts
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
