'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRef } from 'react'
import {
    ArrowRight, Shield, Search, BarChart3, FileText, Sparkles, Scale,
    Heart, Building2, Car, Home, Plane, Gem, Calculator, UserCheck,
    Briefcase, Network, Ship, Zap, HeartPulse, Users, UserCircle, Activity, Baby, UserX,
    Database, Bot
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
import RegulatoryDisclaimer from '@/components/RegulatoryDisclaimer'

// Insurance categories with semantic icons
const insuranceCategories = [
    { href: '/insurance/life', icon: Heart, title: 'Life Insurance', desc: 'Term, Whole Life, ULIPs', color: 'from-red-500 to-pink-600' },
    { href: '/insurance/term-life', icon: HeartPulse, title: 'Term Life', desc: 'Pure Protection, High Cover', color: 'from-blue-500 to-cyan-600' },
    { href: '/insurance/health', icon: Building2, title: 'Health Insurance', desc: 'Individual, Family, Critical Illness', color: 'from-emerald-500 to-teal-600' },
    { href: '/insurance/family-floater', icon: Users, title: 'Family Floater', desc: 'One Policy, Entire Family', color: 'from-fuchsia-500 to-pink-600' },
    { href: '/insurance/senior-citizen', icon: UserCircle, title: 'Senior Citizen', desc: 'Care for your Parents', color: 'from-teal-500 to-emerald-600' },
    { href: '/insurance/critical-illness', icon: Activity, title: 'Critical Illness', desc: 'Life-Changing Illness Cover', color: 'from-rose-500 to-red-600' },
    { href: '/insurance/maternity', icon: Baby, title: 'Maternity Insurance', desc: 'Welcoming New Life Safely', color: 'from-pink-500 to-rose-600' },
    { href: '/insurance/motor', icon: Car, title: 'Motor Insurance', desc: 'Car, Bike, Comprehensive', color: 'from-blue-500 to-indigo-600' },
    { href: '/insurance/home', icon: Home, title: 'Home Insurance', desc: 'Building, Contents, Fire', color: 'from-amber-500 to-orange-600' },
    { href: '/insurance/travel', icon: Plane, title: 'Travel Insurance', desc: 'Domestic, International', color: 'from-purple-500 to-violet-600' },
    { href: '/insurance/disability', icon: UserX, title: 'Disability Cover', desc: 'Income Protection for Injuries', color: 'from-indigo-500 to-purple-600' },
    { href: '/insurance/specialized', icon: Gem, title: 'Specialized', desc: 'Pet, Wedding, Gadget', color: 'from-cyan-500 to-blue-600' },
    { href: '/insurance/personal-accident', icon: UserCheck, title: 'Personal Accident', desc: 'Disability, Death, Medical', color: 'from-rose-500 to-red-600' },
]

const businessCategories = [
    { href: '/insurance/business', icon: Briefcase, title: 'Commercial Package', desc: 'SME, Corporate Property, Interruption', color: 'from-slate-600 to-gray-800' },
    { href: '/insurance/cyber', icon: Network, title: 'Cyber Security Cover', desc: 'Data Breach, Ransomware, Liability', color: 'from-teal-500 to-emerald-600' },
    { href: '/insurance/liability', icon: Scale, title: 'Liability Insurance', desc: 'Public, Product, D&O, Professional', color: 'from-amber-500 to-orange-600' },
    { href: '/insurance/marine', icon: Ship, title: 'Marine & Aviation', desc: 'Cargo, Hull, Freight Liability', color: 'from-blue-500 to-cyan-600' },
    { href: '/insurance/ev', icon: Zap, title: 'EV & Emerging Tech', desc: 'Electric Vehicles, AI, Parametric', color: 'from-fuchsia-500 to-purple-600' },
    { href: '/insurance/directory', icon: Database, title: 'Insurance Directory', desc: 'Verified Directory of Indian Insurers', color: 'from-indigo-600 to-blue-700' },
]

// Tools with semantic icons and rich data
const tools = [
    {
        href: '/tools/hidden-facts',
        icon: Search,
        title: 'Hidden Facts Revealer',
        desc: 'Uncover hidden exclusions, sub-limits, and waiting periods that insurance companies bury in fine print.',
        badge: '150+ Facts',
        stat: '150+',
        statLabel: 'Exclusions Exposed',
        color: 'from-red-500 to-rose-600',
        gradient: 'from-red-500/20 via-rose-500/10 to-transparent',
    },
    {
        href: '/tools/calculator',
        icon: Calculator,
        title: 'Premium Calculator',
        desc: 'Get instant indicative premium estimates for Life, Health, and Motor insurance based on your profile.',
        badge: 'Free',
        stat: '3',
        statLabel: 'Insurance Types',
        color: 'from-emerald-500 to-green-600',
        gradient: 'from-emerald-500/20 via-green-500/10 to-transparent',
    },
    {
        href: '/tools/compare',
        icon: Scale,
        title: 'Policy Comparison',
        desc: 'Compare coverage, premiums, and benefits of different policies side by side to find the best fit.',
        badge: 'Popular',
        stat: '6',
        statLabel: 'Categories',
        color: 'from-blue-500 to-indigo-600',
        gradient: 'from-blue-500/20 via-indigo-500/10 to-transparent',
    },
    {
        href: '/tools/ai-advisor',
        icon: Bot,
        title: 'AI Risk Advisor',
        desc: 'Chat with our intelligent assistant to discover potential risks and suitable insurance categories.',
        badge: 'AI Powered',
        stat: 'Smart',
        statLabel: 'Dynamic AI',
        color: 'from-indigo-500 to-purple-600',
        gradient: 'from-indigo-500/20 via-purple-500/10 to-transparent',
    },
    {
        href: '/tools/interactive-quote',
        icon: Zap,
        title: 'Interactive Quote Wizard',
        desc: 'Escape the forms. Talk to our AI assistant to get an instant, binding insurance quote via conversation.',
        badge: 'New',
        stat: '1 Min',
        statLabel: 'Quick Quote',
        color: 'from-amber-400 to-orange-500',
        gradient: 'from-amber-400/20 via-orange-500/10 to-transparent',
    },
    {
        href: '/tools/claim-cases',
        icon: FileText,
        title: 'Real Claim Cases',
        desc: 'Learn from documented claim outcomes — what got approved, what got rejected, and why.',
        badge: '30+ Cases',
        stat: '30+',
        statLabel: 'Real Cases',
        color: 'from-amber-500 to-yellow-600',
        gradient: 'from-amber-500/20 via-yellow-500/10 to-transparent',
    },
]

const stats = [
    { value: 150, label: 'Hidden Facts', icon: Search, suffix: '+' },
    { value: 13, label: 'Insurance Types', icon: Shield, suffix: '' },
    { value: 6, label: 'Free Tools', icon: BarChart3, suffix: '' },
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
                        <div className="flex flex-wrap justify-center gap-4 mb-8">
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
                                        Estimate Premium
                                    </MagicButton>
                                </Magnetic>
                            </Link>
                        </div>
                    </RevealOnScroll>

                    {/* Inline Disclaimer */}
                    <RevealOnScroll direction="up" delay={0.5}>
                        <p className="text-xs text-theme-muted text-center max-w-lg mx-auto mb-8">
                            <strong>Note:</strong> InsuranceClarity is an educational platform, not an IRDAI-licensed intermediary.
                            We do not sell insurance. <Link href="/terms" className="underline hover:text-accent">Learn more</Link>
                        </p>
                    </RevealOnScroll>

                    {/* Infinite Logo Slider - Full Bleed Edge-to-Edge */}
                    <RevealOnScroll delay={0.6} className="relative group/ticker w-screen -ml-[calc(50vw-50%)] mt-12">
                        <div className="text-center mb-6">
                            <span className="text-[10px] font-bold tracking-[0.4em] text-accent/50 uppercase">
                                Decoding policies from top insurers
                            </span>
                        </div>

                        {/* Premium Ticker Container - Full Bleed */}
                        <div className="glass-strong p-0 py-3 shadow-lg border-y border-hover/5 relative overflow-visible w-full">
                            {/* Decorative background glow */}
                            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-32 bg-accent/5 blur-[100px] pointer-events-none" />
                            <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-64 h-32 bg-emerald-500/5 blur-[100px] pointer-events-none" />

                            <InfiniteSlider gap={60} duration={120} className="py-6">
                                {[
                                    { name: "LIC", url: "/Logos/life-insurance-corporation-logo-png_seeklogo-477287.png", w: 160, h: 60 },
                                    { name: "HDFC Life", url: "/Logos/HDFC-Life-Logo.png", w: 120, h: 40 },
                                    { name: "Aditya Birla", url: "/Logos/Aditya Birla Insurace.png", w: 160, h: 60 },
                                    { name: "ICICI Prudential", url: "/Logos/icici-prudential-life-insurance-logo-png_seeklogo-307031.png", w: 160, h: 60 },
                                    { name: "SBI Life", url: "/Logos/sbi-life-insurance-logo-png_seeklogo-123116.png", w: 160, h: 60 },
                                    { name: "Kotak Life", url: "/Logos/kotak-life-insurance-logo-png_seeklogo-212711.png", w: 160, h: 60 },
                                    { name: "Tata AIA", url: "/Logos/tata-aia-life-insurance-seeklogo.png", w: 160, h: 60 },
                                    { name: "Bajaj Allianz", url: "/Logos/bajaj-allianz-life-insurance-logo-png_seeklogo-307030.png", w: 160, h: 60 },
                                    { name: "Max Life", url: "/Logos/axis-max-life-insurance-logo-png_seeklogo-643158.png", w: 160, h: 60 },
                                    { name: "Star Health", url: "/Logos/star-health-insurance-logo-png_seeklogo-303863.png", w: 160, h: 60 },
                                    { name: "Care Health", url: "/Logos/Care_health_insurance_logo.png", w: 160, h: 60 },
                                    { name: "Digit Insurance", url: "/Logos/digit-insurance-logo-png_seeklogo-465810.png", w: 160, h: 60 },
                                    { name: "Acko", url: "/Logos/Acko_General_Insurance_logo.svg.png", w: 160, h: 60 },
                                    { name: "IndusInd Nippon Life", url: "/Logos/Reliance_Life_Insurance_Logo.png", w: 160, h: 60 },
                                    { name: "Reliance General", url: "/Logos/reliance-general-insurance-logo-png_seeklogo-503447.png", w: 160, h: 60 },
                                    { name: "IndiaFirst Life", url: "/Logos/ifli-logo-new.png", w: 160, h: 60 },
                                    { name: "HDFC Ergo", url: "/Logos/HDFC-Ergo-Logo.png", w: 160, h: 60 },
                                    { name: "Nippon Life India", url: "/Logos/nippon-life-insurance-logo-png_seeklogo-99705.png", w: 120, h: 40 },
                                    { name: "Ageas Federal", url: "/Logos/AgeasFederal-_Logo_Color.png", w: 160, h: 60 },
                                    { name: "Bharti AXA", url: "/Logos/BhartiAXALifeInsurance.png", w: 160, h: 60 },
                                    { name: "Generali Central", url: "/Logos/Future Generali insurance.png", w: 160, h: 60 },
                                    { name: "IFFCO Tokio", url: "/Logos/IFFCO_TOKIO_Logo.png", w: 160, h: 60 },
                                    { name: "National Insurance", url: "/Logos/National_Insurance_Company.png", w: 160, h: 60 },
                                    { name: "Oriental Insurance", url: "/Logos/The_Oriental_Insurance_Company_Logo.png", w: 160, h: 60 },
                                    { name: "United India", url: "/Logos/United_India_Insurance.png", w: 120, h: 40 },
                                    { name: "Aviva", url: "/Logos/avivi.png", w: 160, h: 60 },
                                    { name: "Edelweiss", url: "/Logos/edelweisslogo.png", w: 160, h: 60 },
                                    { name: "Manipal Cigna", url: "/Logos/hi-logo-Manipal.png", w: 200, h: 60 },
                                    { name: "MetLife", url: "/Logos/met-life-india-logo-png_seeklogo-91366.png", w: 160, h: 60 },
                                    { name: "Star Union Dai-ichi", url: "/Logos/Star unini dai.png", w: 160, h: 60 },
                                    { name: "Niva Bupa", url: "/Logos/bupa Insurance.png", w: 160, h: 60 },
                                    { name: "ICICI Lombard", url: "/Logos/ICICI-Lombard.png", w: 160, h: 60 },
                                    { name: "New India Assurance", url: "/Logos/New India Assurance.png", w: 160, h: 60 },
                                    { name: "Cholamandalam MS", url: "/Logos/Cholamandalam MS.png", w: 160, h: 60 },
                                    { name: "Kotak General", url: "/Logos/Kotak General Insurance.png", w: 160, h: 60 },
                                ].map((logo) => (
                                    <div
                                        key={logo.name}
                                        className="relative flex items-center justify-center px-6 py-2 transition-all duration-500 opacity-60 hover:opacity-100 group/logo"
                                        style={{ perspective: '1000px', height: '48px', minWidth: '120px' }}
                                    >
                                        <div className="transition-transform duration-500 group-hover/logo:[transform:rotateX(10deg)_rotateY(10deg)_scale(1.25)] group-hover/logo:drop-shadow-[0_20px_25px_rgba(var(--color-accent-rgb),0.2)]">
                                            <Image
                                                src={logo.url}
                                                alt={`${logo.name} logo`}
                                                width={logo.w}
                                                height={logo.h}
                                                className="object-contain"
                                                style={{ maxHeight: '40px', width: 'auto', height: 'auto', maxWidth: `${logo.w}px` }}
                                                priority={false}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </InfiniteSlider>
                        </div>
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
                            <StaggerItem key={cat.href} className="h-full">
                                <Link href={cat.href} className="block h-full">
                                    <TiltCard containerClassName="h-full" className="h-full">
                                        <GlassCard
                                            hover
                                            glowOnHover
                                            className="cursor-pointer group h-full min-h-[100px]"
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

            {/* Business & Emerging Insurance Categories */}
            <section className="pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <RevealOnScroll className="text-center mb-12">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent-10 text-accent 
                           text-sm rounded-full mb-4 font-medium">
                            <Briefcase className="w-4 h-4" />
                            COMMERCIAL & EMERGING
                        </span>
                        <h2 className="font-display font-bold text-3xl md:text-4xl text-theme-primary">
                            Business & Advanced Insurance
                        </h2>
                        <p className="text-theme-secondary mt-4 max-w-xl mx-auto">
                            Protect your enterprise with comprehensive coverage for modern risks, liabilities, and emerging technologies.
                        </p>
                    </RevealOnScroll>

                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center" staggerDelay={0.08}>
                        {businessCategories.map((cat) => (
                            <StaggerItem key={cat.href} className="h-full">
                                <Link href={cat.href} className="block h-full">
                                    <TiltCard containerClassName="h-full" className="h-full">
                                        <GlassCard
                                            hover
                                            glowOnHover
                                            className="cursor-pointer group h-full min-h-[100px]"
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
                            Explore policy details and common exclusions with our educational tools.
                        </p>
                    </RevealOnScroll>

                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6" staggerDelay={0.1}>
                        {tools.map((tool) => (
                            <StaggerItem key={tool.href}>
                                <Link href={tool.href} className="block h-full">
                                    <GlassCard
                                        hover
                                        glowOnHover
                                        padding="none"
                                        className="cursor-pointer group h-full overflow-hidden"
                                    >
                                        {/* Gradient accent strip at top */}
                                        <div className={`h-1.5 w-full bg-gradient-to-r ${tool.color}`} />

                                        {/* Subtle gradient background */}
                                        <div className={`absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l ${tool.gradient} pointer-events-none opacity-60`} />

                                        <div className="relative p-6">
                                            <div className="flex gap-5">
                                                {/* Icon + stat */}
                                                <div className="flex flex-col items-center gap-2">
                                                    <IconContainer
                                                        icon={tool.icon}
                                                        size="xl"
                                                        variant="gradient"
                                                        gradientFrom={`from-${tool.color.split(' ')[0].replace('from-', '')}`}
                                                        gradientTo={`to-${tool.color.split(' ')[1].replace('to-', '')}`}
                                                    />
                                                    <div className="text-center">
                                                        <div className="text-xl font-bold text-gradient leading-none">{tool.stat}</div>
                                                        <div className="text-[10px] text-theme-muted font-medium uppercase tracking-wide mt-0.5">{tool.statLabel}</div>
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="font-display font-semibold text-lg text-theme-primary 
                                                         group-hover:text-accent transition-colors duration-150">
                                                            {tool.title}
                                                        </h3>
                                                        <span className={`px-2.5 py-0.5 text-xs rounded-full font-semibold bg-gradient-to-r ${tool.color} text-white shadow-sm`}>
                                                            {tool.badge}
                                                        </span>
                                                    </div>
                                                    <p className="text-theme-secondary text-sm leading-relaxed mb-3">{tool.desc}</p>
                                                    <span className="inline-flex items-center gap-1.5 text-accent text-sm font-medium 
                                                        opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                                                        Explore Now
                                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                                                    </span>
                                                </div>
                                            </div>
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
