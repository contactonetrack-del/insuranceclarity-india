'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Sparkles, Search, ArrowRight, ShieldCheck, Star, Lock, Users } from 'lucide-react'
import {
    RevealOnScroll,
    ParallaxSection,
    FloatingElement,
    AnimatedBlob,
    TextRoll,
    AnimatedHeading,
    Magnetic,
    InfiniteSlider,
} from '@/components/premium'
import { partnerLogos } from '@/config/home-data'
import { resolveToneSurfaceClass, type Tone } from '@/lib/theme/tone'

export function HeroSection() {
    const t = useTranslations('home.heroSection')
    const rollWords = t('textRollWords').split('|')

    return (
        <section className="relative min-h-[90dvh] flex items-center pt-20 pb-24 px-6 -mt-20 overflow-x-clip">
            <ParallaxSection className="absolute inset-0 z-0" speed={0.3}>
                <div className="relative h-full w-full scale-110">
                    <Image
                        src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&q=80"
                        alt={t('backgroundAlt')}
                        fill
                        priority
                        sizes="100vw"
                        className="object-cover"
                    />
                </div>
            </ParallaxSection>
            <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/50 to-white/90 dark:from-slate-950/60 dark:via-slate-950/40 dark:to-slate-950/80 z-[1]" />

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
                        <span className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-accent text-sm font-medium mb-4">
                            <Sparkles className="w-4 h-4" />
                            {t('badge')}
                        </span>

                        <div className="h-8 flex items-center gap-2 text-theme-secondary font-medium">
                            <span>{t('textRollPrefix')}</span>
                            <TextRoll
                                words={rollWords}
                                className="text-accent font-bold"
                            />
                        </div>
                    </div>
                </RevealOnScroll>

                <RevealOnScroll direction="up" delay={0.2}>
                    <h1 className="font-display font-extrabold text-4xl md:text-5xl lg:text-6xl text-theme-primary leading-tight tracking-tight mb-6 drop-shadow-lg">
                        <span className="block">
                            <AnimatedHeading
                                text={t('titleLine1')}
                                animation="wordByWord"
                                staggerDelay={0.08}
                                className="justify-center"
                            />
                        </span>
                        <span className="mt-1 block text-accent drop-shadow-[0_2px_10px_rgba(var(--token-accent-rgb),0.24)]">
                            <AnimatedHeading
                                text={t('titleLine2')}
                                animation="wordByWord"
                                staggerDelay={0.07}
                                delay={0.3}
                                className="justify-center"
                            />
                        </span>
                    </h1>
                </RevealOnScroll>

                <RevealOnScroll direction="up" delay={0.3}>
                    <p className="text-theme-secondary text-lg md:text-xl max-w-2xl mx-auto mb-10 drop-shadow-md">
                        {t('subtitle')}
                    </p>
                </RevealOnScroll>

                <RevealOnScroll direction="up" delay={0.4}>
                    <div className="flex flex-wrap items-center justify-center gap-4 mb-5">
                        <Magnetic strength={0.2} className="inline-block">
                            <Link
                                href="/scan"
                                className="interactive-focus tone-brand-gradient inline-flex min-w-[18rem] items-center justify-center gap-3 rounded-full border px-8 py-4 text-lg font-semibold text-white shadow-[0_18px_40px_rgba(var(--token-accent-rgb),0.28)] transition-[transform,box-shadow,filter] duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(var(--token-accent-rgb),0.34)]"
                            >
                                <Sparkles className="h-6 w-6" strokeWidth={2} />
                                <span>{t('actions.scanPolicy')}</span>
                            </Link>
                        </Magnetic>
                        <Magnetic strength={0.2} className="inline-block">
                            <Link
                                href="/tools/hidden-facts"
                                className="interactive-focus tone-neutral-soft inline-flex min-w-[18rem] items-center justify-center gap-3 rounded-full border px-8 py-4 text-lg font-semibold text-theme-primary shadow-md backdrop-blur-xl transition-[transform,background-color,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-lg"
                            >
                                <Search className="h-6 w-6" strokeWidth={2} />
                                <span>{t('actions.exploreHiddenFacts')}</span>
                            </Link>
                        </Magnetic>
                        <Magnetic strength={0.2} className="inline-block">
                            <Link
                                href="/tools/calculator"
                                className="interactive-focus tone-neutral-soft inline-flex min-w-[18rem] items-center justify-center gap-3 rounded-full border px-8 py-4 text-lg font-semibold text-theme-primary shadow-md backdrop-blur-xl transition-[transform,background-color,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-lg"
                            >
                                <span>{t('actions.estimatePremium')}</span>
                                <ArrowRight className="h-6 w-6" strokeWidth={2} />
                            </Link>
                        </Magnetic>
                    </div>
                </RevealOnScroll>

                <RevealOnScroll direction="up" delay={0.5}>
                    <p className="text-[11px] md:text-xs text-theme-muted text-center max-w-3xl mx-auto mb-6">
                        <strong>{t('notePrefix')}</strong>{' '}
                        {t('noteBody')}{' '}
                        <Link href="/terms" className="underline hover:text-accent">{t('learnMore')}</Link>
                    </p>
                </RevealOnScroll>

                <RevealOnScroll direction="up" delay={0.55}>
                    <div
                        className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-3 md:gap-4 lg:flex-nowrap"
                        role="list"
                        aria-label={t('trustAriaLabel')}
                    >
                        {[
                            { icon: ShieldCheck, label: t('trustIndicators.irdai'), tone: 'brand' as Tone },
                            { icon: Users, label: t('trustIndicators.users'), tone: 'info' as Tone },
                            { icon: Lock, label: t('trustIndicators.pdfDeleted'), tone: 'neutral' as Tone },
                            { icon: Star, label: t('trustIndicators.satisfaction'), tone: 'warning' as Tone },
                        ].map(({ icon: Icon, label, tone }) => (
                            <div
                                key={label}
                                className="tone-neutral-soft inline-flex min-h-12 items-center justify-center gap-3 rounded-full border px-4 py-3 text-sm font-semibold text-theme-primary shadow-md backdrop-blur-xl"
                                role="listitem"
                            >
                                <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full border ${resolveToneSurfaceClass(tone, 'soft')}`}>
                                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                                </span>
                                <span className="whitespace-nowrap">{label}</span>
                            </div>
                        ))}
                    </div>
                </RevealOnScroll>

                <RevealOnScroll
                    delay={0.6}
                    className="relative group/ticker w-screen -ms-[calc(50vw-50%)] mt-8 overflow-x-hidden"
                    role="region"
                    ariaLabel={t('tickerTitle')}
                    tabIndex={0}
                >
                    <div className="text-center mb-4">
                        <span className="text-[10px] font-bold tracking-[0.4em] text-accent/50 uppercase">
                            {t('tickerTitle')}
                        </span>
                    </div>

                    <div className="glass-strong p-0 py-3 shadow-lg border-y border-hover/5 relative overflow-visible w-full">
                        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-32 bg-accent/5 blur-[100px] pointer-events-none" />
                        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-64 h-32 bg-accent/5 blur-[100px] pointer-events-none" />

                        <InfiniteSlider gap={60} duration={120} className="py-6">
                            {partnerLogos.map((logo) => {
                                const displayHeight = Math.min(logo.h, 40)
                                const displayWidth = Math.round(logo.w * (displayHeight / logo.h))

                                return (
                                    <div
                                        key={logo.name}
                                        className="relative flex items-center justify-center px-6 py-2 transition-all duration-500 opacity-60 hover:opacity-100 group/logo h-[48px] min-w-[120px] [perspective:1000px]"
                                    >
                                        <div className="transition-transform duration-500 group-hover/logo:[transform:rotateX(10deg)_rotateY(10deg)_scale(1.25)] group-hover/logo:drop-shadow-[0_20px_25px_rgba(var(--token-accent-rgb),0.2)]">
                                            <Image
                                                src={logo.url}
                                                alt={`${logo.name} logo`}
                                                width={logo.w}
                                                height={logo.h}
                                                className="object-contain"
                                                style={{ width: `${displayWidth}px`, height: `${displayHeight}px` }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </InfiniteSlider>
                    </div>
                </RevealOnScroll>
            </div>
        </section>
    )
}
