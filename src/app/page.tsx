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
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                <div className="absolute inset-0 bg-accent/5 -skew-y-3 transform origin-top-left scale-110" />

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <RevealOnScroll direction="down">
                        <span className="inline-flex items-center gap-2 px-4 py-2 glass-strong rounded-full 
                             text-accent-dark dark:text-accent-light text-sm mb-8 font-medium shadow-glow-sm hover:scale-105 transition-transform duration-300 cursor-default">
                            <Shield className="w-4 h-4" />
                            India's First Brutally Honest Insurance Portal
                        </span>
                    </RevealOnScroll>

                    <RevealOnScroll direction="up" delay={0.1}>
                        <h1 className="font-display font-bold text-5xl md:text-7xl mb-8 leading-tight tracking-tight">
                            Stop Buying <br />
                            <span className="text-gradient relative inline-block">
                                Hidden Clauses
                                <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-accent opacity-50 blur-sm rounded-full"></span>
                            </span>
                        </h1>
                    </RevealOnScroll>

                    <RevealOnScroll direction="up" delay={0.2}>
                        <p className="text-theme-secondary text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-light">
                            We decode the fine print, expose rejection clauses, and calculate your <span className="text-theme-primary font-semibold">Real Claim Probability</span> before you pay a single rupee.
                        </p>
                    </RevealOnScroll>

                    <RevealOnScroll direction="up" delay={0.3}>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                            <Link href="/tools/hidden-facts" className="btn-primary text-lg px-8 py-4 w-full sm:w-auto hover-lift-lg group">
                                <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                Check Your Policy for Hidden Facts
                            </Link>
                            <Link href="/tools/calculator" className="btn-secondary text-lg px-8 py-4 w-full sm:w-auto hover-lift group">
                                <Calculator className="w-5 h-5 text-theme-muted group-hover:text-theme-primary transition-colors" />
                                Calculate Real Premium
                            </Link>
                        </div>
                    </RevealOnScroll>

                    {/* Infinity Ticker Integration */}
                    <RevealOnScroll direction="up" delay={0.4} className="max-w-5xl mx-auto">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-theme-bg-primary via-theme-bg-primary/80 to-transparent z-10 pointer-events-none" />
                            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-theme-bg-primary via-theme-bg-primary/80 to-transparent z-10 pointer-events-none" />
                            <InfinityTicker
                                speed={25}
                                direction="left"
                                items={[
                                    "LIC", "HDFC Life", "ICICI Prudential", "SBI Life", "Max Life",
                                    "Tata AIA", "Bajaj Allianz", "Star Health", "Niva Bupa", "Care Health"
                                ]}
                            />
                        </div>
                        <p className="text-theme-muted/60 text-xs font-semibold uppercase tracking-[0.2em] mt-6">
                            Analyzing Policies From Top Insurers
                        </p>
                    </RevealOnScroll>
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
