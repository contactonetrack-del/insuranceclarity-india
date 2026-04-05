'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Sparkles, Search, ArrowRight, ShieldCheck, Star, Lock, Users } from 'lucide-react'
import {
    RevealOnScroll,
    ParallaxSection,
    FloatingElement,
    AnimatedBlob,
    TextRoll,
    AnimatedHeading,
    GradientText,
    Magnetic,
    InfiniteSlider
} from '@/components/premium'
import { Button } from '@/components/ui/Button'
import { partnerLogos } from '@/config/home-data'

export function HeroSection() {
    return (
        <section className="relative min-h-[90dvh] flex items-center pt-20 pb-24 px-6 -mt-20 overflow-x-clip">
            {/* Hero Background Image with Parallax Effect */}
            <ParallaxSection className="absolute inset-0 z-0" speed={0.3}>
                <div className="absolute inset-0 scale-110">
                    <Image
                        src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&q=80"
                        alt="Insurance protection background"
                        fill
                        priority
                        sizes="100vw"
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
                        <GradientText className="drop-shadow-[0_2px_10px_rgba(52,211,153,0.3)]">
                            <AnimatedHeading
                                text="Companies Hide From You"
                                animation="letterByLetter"
                                staggerDelay={0.08}
                                delay={0.5}
                                className="justify-center py-1"
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
                    <div className="flex flex-wrap justify-center gap-4 mb-5">
                        {/* PRIMARY CTA — AI Scanner */}
                        <Link href="/scan">
                            <Magnetic strength={0.2} className="inline-block">
                                <Button icon={Sparkles} size="lg" glow>
                                    Scan My Policy Free
                                </Button>
                            </Magnetic>
                        </Link>
                        <Link href="/tools/hidden-facts">
                            <Magnetic strength={0.2} className="inline-block">
                                <Button variant="secondary" icon={Search} size="lg">
                                    Explore Hidden Facts
                                </Button>
                            </Magnetic>
                        </Link>
                        <Link href="/tools/calculator">
                            <Magnetic strength={0.2} className="inline-block">
                                <Button variant="secondary" icon={ArrowRight} iconPosition="right" size="lg">
                                    Estimate Premium
                                </Button>
                            </Magnetic>
                        </Link>
                    </div>
                </RevealOnScroll>

                {/* Inline Disclaimer */}
                <RevealOnScroll direction="up" delay={0.5}>
                    <p className="text-[11px] md:text-xs text-theme-muted text-center max-w-3xl mx-auto mb-6">
                        <strong>Note:</strong> InsuranceClarity is an educational platform, not an IRDAI-licensed intermediary. We do not sell insurance. <Link href="/terms" className="underline hover:text-accent">Learn more</Link>
                    </p>
                </RevealOnScroll>

                {/* Trust Badges Row */}
                <RevealOnScroll direction="up" delay={0.55}>
                    <div className="hero-trust-row" role="list" aria-label="Trust indicators">
                        {[
                            { icon: ShieldCheck, label: 'IRDAI-Compliant Analysis', color: 'text-emerald-500' },
                            { icon: Users,       label: '10,000+ Users Protected',  color: 'text-blue-500'    },
                            { icon: Lock,        label: 'PDF Deleted After Scan',   color: 'text-purple-500'  },
                            { icon: Star,        label: '4.9★ User Satisfaction',   color: 'text-amber-500'   },
                        ].map(({ icon: Icon, label, color }) => (
                            <div key={label} className="hero-trust-item" role="listitem">
                                <Icon className={`hero-trust-icon ${color}`} aria-hidden="true" />
                                <span>{label}</span>
                            </div>
                        ))}
                    </div>
                </RevealOnScroll>

                {/* Infinite Logo Slider - Full Bleed Edge-to-Edge */}
                <RevealOnScroll delay={0.6} className="relative group/ticker w-screen -ms-[calc(50vw-50%)] mt-8 overflow-x-hidden">
                    <div className="text-center mb-4">
                        <span className="text-[10px] font-bold tracking-[0.4em] text-accent/50 uppercase">
                            Decoding policies from top insurers
                        </span>
                    </div>

                    <div className="glass-strong p-0 py-3 shadow-lg border-y border-hover/5 relative overflow-visible w-full">
                        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-32 bg-accent/5 blur-[100px] pointer-events-none" />
                        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-64 h-32 bg-emerald-500/5 blur-[100px] pointer-events-none" />

                        <InfiniteSlider gap={60} duration={120} className="py-6">
                            {partnerLogos.map((logo) => (
                                <div
                                    key={logo.name}
                                    className="relative flex items-center justify-center px-6 py-2 transition-all duration-500 opacity-60 hover:opacity-100 group/logo h-[48px] min-w-[120px] [perspective:1000px]"
                                >
                                    <div className="transition-transform duration-500 group-hover/logo:[transform:rotateX(10deg)_rotateY(10deg)_scale(1.25)] group-hover/logo:drop-shadow-[0_20px_25px_rgba(var(--color-accent-rgb),0.2)]">
                                        <Image
                                            src={logo.url}
                                            alt={`${logo.name} logo`}
                                            width={logo.w}
                                            height={logo.h}
                                            className="object-contain max-h-[40px] w-auto h-auto"
                                            style={{ maxWidth: `${logo.w}px` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </InfiniteSlider>
                    </div>
                </RevealOnScroll>
            </div>
        </section>
    )
}
