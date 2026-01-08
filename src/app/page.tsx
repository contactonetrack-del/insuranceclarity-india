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
    InfiniteSlider,
    TextRoll
} from '@/components/premium'

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
            <section
                ref={heroRef}
                className="relative pt-48 pb-24 px-6 -mt-20 overflow-hidden"
            >
                {/* Hero Background Image with Parallax Effect */}
                <ParallaxSection className="absolute inset-0 z-0" speed={0.3}>
                    <div className="absolute inset-0 scale-110">
                        <Image
                            src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&q=80"
                            alt="Insurance protection background"
                            fill
                            priority
                            className="object-cover"
                        />
                    </div>
                </ParallaxSection>
                <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/50 to-white/90 
                              dark:from-slate-950/60 dark:via-slate-950/40 dark:to-slate-950/80 z-[1]" />

                {/* Animated decorative blobs */}
                <FloatingElement className="absolute top-1/4 left-10 z-[2]" range={20} duration={6}>
                    <AnimatedBlob
                        className="w-64 h-64"
                        opacity={0.25}
                        duration={10}
                    />
                </FloatingElement>
                <FloatingElement className="absolute bottom-1/4 right-10 z-[2]" range={25} duration={8} delay={2}>
                    <AnimatedBlob
                        className="w-80 h-80"
                        opacity={0.2}
                        duration={12}
                    />
                </FloatingElement>

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <RevealOnScroll direction="up" delay={0.1}>
                        <div className="flex flex-col items-center mb-6">
                            <span className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full 
                                 text-accent text-sm font-medium mb-4">
                                <Sparkles className="w-4 h-4" />
                                India's Most Transparent Insurance Platform
                            </span>

                            <div className="h-8 flex items-center gap-2 text-theme-secondary font-medium">
                                <span>Smart Protection for your</span>
                                <TextRoll
                                    words={["Family", "Assets", "Health", "Future", "Life"]}
                                    className="text-accent font-bold"
                                />
                            </div>
                        </div>
                    </RevealOnScroll>

                    <RevealOnScroll direction="up" delay={0.2}>
                        <h1 className="font-display font-extrabold text-4xl md:text-5xl lg:text-6xl text-theme-primary 
                           leading-tight mb-6 drop-shadow-lg">
                            <AnimatedHeading
                                text="Discover What Insurance"
                                animation="wordByWord"
                                staggerDelay={0.08}
                                className="justify-center"
                            />
                            <br />
                            <GradientText className="drop-shadow-lg">
                                <AnimatedHeading
                                    text="Companies Hide From You"
                                    animation="letterByLetter"
                                    staggerDelay={0.08}
                                    delay={0.5}
                                    className="justify-center"
                                />
                            </GradientText>
                        </h1>
                    </RevealOnScroll>

                    <RevealOnScroll direction="up" delay={0.3}>
                        <p className="text-theme-secondary text-lg md:text-xl max-w-2xl mx-auto mb-10 drop-shadow-md">
                            Compare policies, uncover hidden exclusions, and make informed decisions.
                            We show you the fine print that could save your claim.
                        </p>
                    </RevealOnScroll>

                    <RevealOnScroll direction="up" delay={0.4}>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link href="/tools/hidden-facts">
                                <Magnetic strength={0.2} className="inline-block">
                                    <MagicButton icon={Search} size="lg" glow>
                                        Explore Hidden Facts
                                    </MagicButton>
                                </Magnetic>
                            </Link>
                            <Link href="/tools/calculator">
                                <Magnetic strength={0.2} className="inline-block">
                                    <MagicButton variant="secondary" icon={ArrowRight} iconPosition="right" size="lg">
                                        Calculate Premium
                                    </MagicButton>
                                </Magnetic>
                            </Link>
                        </div>
                    </RevealOnScroll>

                    {/* Infinite Logo Slider */}
                    <RevealOnScroll delay={0.6} className="mt-16 pt-8 border-t border-default/10">
                        <p className="text-sm text-theme-muted uppercase tracking-wider font-semibold mb-6">
                            Decoding policies from top insurers
                        </p>
                        <InfiniteSlider gap={60} duration={80}>
                            {[
                                { name: "LIC", url: "/Logos/life-insurance-corporation-logo-png_seeklogo-477287.png", w: 160, h: 50 },
                                { name: "HDFC Life", url: "/Logos/HDFC-Life-Logo.png", w: 160, h: 50 },
                                { name: "Aditya Birla", url: "/Logos/Aditya Birla Insurace.png", w: 160, h: 50 },
                                { name: "ICICI Prudential", url: "/Logos/icici-prudential-life-insurance-logo-png_seeklogo-307031.png", w: 160, h: 50 },
                                { name: "SBI Life", url: "/Logos/sbi-life-insurance-logo-png_seeklogo-123116.png", w: 160, h: 50 },
                                { name: "Kotak Life", url: "/Logos/kotak-life-insurance-logo-png_seeklogo-212711.png", w: 160, h: 50 },
                                { name: "Tata AIA", url: "/Logos/tata-aia-life-insurance-seeklogo.png", w: 160, h: 50 },
                                { name: "Bajaj Allianz", url: "/Logos/bajaj-allianz-life-insurance-logo-png_seeklogo-307030.png", w: 160, h: 50 },
                                { name: "Max Life", url: "/Logos/axis-max-life-insurance-logo-png_seeklogo-643158.png", w: 160, h: 50 },
                                { name: "Star Health", url: "/Logos/star-health-insurance-logo-png_seeklogo-303863.png", w: 160, h: 50 },
                                { name: "Care Health", url: "/Logos/Care_health_insurance_logo.png", w: 160, h: 50 },
                                { name: "Digit Insurance", url: "/Logos/digit-insurance-logo-png_seeklogo-465810.png", w: 160, h: 50 },
                                { name: "Acko", url: "/Logos/Acko_General_Insurance_logo.svg.png", w: 160, h: 50 },
                                { name: "Reliance Life", url: "/Logos/Reliance_Life_Insurance_Logo.png", w: 160, h: 50 },
                                { name: "Reliance General", url: "/Logos/reliance-general-insurance-logo-png_seeklogo-503447.png", w: 160, h: 50 },
                                { name: "HDFC Ergo", url: "/Logos/ifli-logo-new.png", w: 160, h: 50 },
                                { name: "Nippon Life", url: "/Logos/nippon-life-insurance-logo-png_seeklogo-99705.png", w: 160, h: 50 },
                                { name: "Ageas Federal", url: "/Logos/AgeasFederal-_Logo_Color.png", w: 160, h: 50 },
                                { name: "Bharti AXA", url: "/Logos/BhartiAXALifeInsurance.png", w: 160, h: 50 },
                                { name: "Future Generali", url: "/Logos/Future Generali insurance.png", w: 160, h: 50 },
                                { name: "IDBI Federal", url: "/Logos/IDBIFederalLifeInsurancesvg.png", w: 160, h: 50 },
                                { name: "IFFCO Tokio", url: "/Logos/IFFCO_TOKIO_Logo.png", w: 160, h: 50 },
                                { name: "National Insurance", url: "/Logos/National_Insurance_Company.png", w: 160, h: 50 },
                                { name: "Oriental Insurance", url: "/Logos/The_Oriental_Insurance_Company_Logo.png", w: 160, h: 50 },
                                { name: "United India", url: "/Logos/United_India_Insurance.png", w: 160, h: 50 },
                                { name: "Aviva", url: "/Logos/avivi.png", w: 160, h: 50 },
                                { name: "Edelweiss", url: "/Logos/edelweisslogo.png", w: 160, h: 50 },
                                { name: "Manipal Cigna", url: "/Logos/hi-logo-Manipal.png", w: 200, h: 60 },
                                { name: "MetLife", url: "/Logos/met-life-india-logo-png_seeklogo-91366.png", w: 160, h: 50 },
                                { name: "Star Union Dai-ichi", url: "/Logos/Star unini dai.png", w: 160, h: 50 },
                                { name: "Niva Bupa", url: "/Logos/bupa Insurance.png", w: 160, h: 50 },
                                { name: "ICICI Lombard", url: "/Logos/ICICI-Lombard.png", w: 160, h: 50 },
                                { name: "New India Assurance", url: "/Logos/New India Assurance.png", w: 160, h: 50 },
                                { name: "Cholamandalam MS", url: "/Logos/Cholamandalam MS.png", w: 160, h: 50 },
                                { name: "Kotak General", url: "/Logos/Kotak General Insurance.png", w: 160, h: 50 },
                            ].map((logo) => (
                                <div key={logo.name} className="relative h-14 w-auto flex items-center justify-center px-4 transition-all duration-300 opacity-80 hover:opacity-100 hover:scale-110 hover:drop-shadow-lg">
                                    <Image
                                        src={logo.url}
                                        alt={`${logo.name} logo`}
                                        width={logo.w}
                                        height={logo.h}
                                        className="h-full w-auto object-contain"
                                    />
                                </div>
                            ))}
                        </InfiniteSlider>
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
