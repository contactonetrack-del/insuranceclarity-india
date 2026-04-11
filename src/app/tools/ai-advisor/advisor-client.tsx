'use client'

import React, { useRef, useState } from 'react'
import Link from 'next/link'
import {
    Activity,
    ArrowRight,
    Bot,
    Briefcase,
    Send,
    ShieldCheck,
    Sparkles,
    User,
    Zap,
} from 'lucide-react'
import {
    GlassCard,
    GradientText,
    IconContainer,
    RevealOnScroll,
    StaggerContainer,
    StaggerItem,
} from '@/components/premium'
import { useTranslations } from 'next-intl'
import { findBestMatches, type MatchResult } from '@/services/ai-matcher.service'

export default function AdvisorClient() {
    const t = useTranslations('tools.aiAdvisorClient')
    const [query, setQuery] = useState('')
    const [isThinking, setIsThinking] = useState(false)
    const [results, setResults] = useState<MatchResult[] | null>(null)
    const [searchedQuery, setSearchedQuery] = useState('')

    const resultsRef = useRef<HTMLDivElement>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!query.trim()) return

        setSearchedQuery(query)
        setIsThinking(true)
        setResults(null)

        try {
            const matches = await findBestMatches(query, 3)
            setResults(matches)
        } catch (error) {
            console.error(t('errors.fetchMatchesLog'), error)
        } finally {
            setIsThinking(false)
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }, 100)
        }
    }

    const suggestionChips = [
        t('suggestions.one'),
        t('suggestions.two'),
        t('suggestions.three'),
        t('suggestions.four'),
    ]

    return (
        <div className="min-h-screen pt-20">
            <section className="relative overflow-hidden px-6 py-20">
                <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-accent/5 to-accent-hover/5" />
                <div className="pointer-events-none absolute -left-[10%] -top-[10%] -z-10 h-[50%] w-[50%] rounded-full bg-accent/10 blur-[120px] mix-blend-screen" />

                <div className="mx-auto max-w-4xl text-center">
                    <RevealOnScroll direction="down" delay={0.1}>
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-bold text-accent shadow-lg shadow-accent/10">
                            <Bot className="h-4 w-4" />
                            {t('hero.badge')}
                        </div>
                    </RevealOnScroll>

                    <h1 className="mb-6 font-display text-4xl font-bold leading-tight text-theme-primary md:text-5xl lg:text-5xl">
                        {t('hero.titlePrefix')} <br />
                        <GradientText className="from-accent to-accent-hover">{t('hero.titleHighlight')}</GradientText>
                    </h1>

                    <p className="mx-auto mb-12 max-w-2xl text-xl leading-relaxed text-theme-secondary">
                        {t('hero.subtitle')}
                    </p>

                    <RevealOnScroll direction="up" delay={0.2} className="relative z-10 mx-auto max-w-2xl">
                        <GlassCard className="border-accent/30 p-2 shadow-2xl shadow-accent/10">
                            <form onSubmit={handleSubmit} className="relative flex items-center">
                                <Sparkles className="absolute left-6 h-6 w-6 text-accent" />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder={t('search.placeholder')}
                                    className="w-full border-none bg-transparent py-6 pl-16 pr-24 text-lg text-theme-primary outline-none placeholder:text-theme-secondary/50 focus:ring-0"
                                />
                                <button
                                    type="submit"
                                    disabled={!query.trim() || isThinking}
                                    className="absolute right-3 flex items-center gap-2 rounded-xl bg-gradient-accent px-6 py-3 font-bold text-white transition-all active:scale-95 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isThinking ? (
                                            <Activity className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <>
                                                {t('search.analyze')} <Send className="h-4 w-4" />
                                            </>
                                        )}
                                    </button>
                            </form>
                        </GlassCard>

                        <div className="mt-6 flex flex-wrap justify-center gap-3">
                            {suggestionChips.map((chip, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setQuery(chip)}
                                    className="rounded-full border border-default bg-theme-bg/50 px-4 py-2 text-sm text-theme-secondary transition-colors hover:border-accent hover:text-accent"
                                >
                                    "{chip}"
                                </button>
                            ))}
                        </div>
                    </RevealOnScroll>
                </div>
            </section>

            <div ref={resultsRef} className="min-h-[400px] px-6 pb-24">
                {isThinking && (
                    <div className="mx-auto max-w-4xl animate-pulse py-20 text-center">
                        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                            <Bot className="h-8 w-8 animate-bounce text-accent" />
                        </div>
                        <h3 className="mb-2 text-2xl font-bold text-theme-primary">{t('loading.title')}</h3>
                        <p className="text-theme-secondary">{t('loading.description')}</p>
                    </div>
                )}

                {results && results.length > 0 && (
                    <div className="mx-auto max-w-6xl py-12">
                        <div className="mb-12 text-center">
                            <h2 className="text-2xl font-bold text-theme-primary">{t('results.title')}</h2>
                            <p className="text-theme-secondary">{t('results.topForQuery', { count: results.length, query: searchedQuery })}</p>
                        </div>

                        <StaggerContainer className="grid gap-6 md:grid-cols-3" staggerDelay={0.15}>
                            {results.map((result, index) => {
                                const sectorLower = result.product.sector.toLowerCase()
                                let SectorIcon = ShieldCheck
                                if (sectorLower.includes('life')) SectorIcon = User
                                else if (sectorLower.includes('business') || sectorLower.includes('property')) SectorIcon = Briefcase
                                else if (sectorLower.includes('health') || sectorLower.includes('personal')) SectorIcon = Activity
                                else if (sectorLower.includes('ev') || sectorLower.includes('cyber')) SectorIcon = Zap

                                return (
                                    <StaggerItem key={index}>
                                        <GlassCard hover className={`relative flex h-full flex-col border-t-4 ${index === 0 ? 'border-t-accent shadow-xl shadow-accent/10' : 'border-t-default'}`}>
                                            {index === 0 && (
                                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-accent px-3 py-1 text-xs font-bold text-white shadow-lg">
                                                    {t('results.bestMatch')}
                                                </div>
                                            )}

                                            <div className="mb-6 mt-2 flex items-start justify-between">
                                                <IconContainer icon={SectorIcon} className="bg-accent/10 text-accent" />

                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="relative flex h-12 w-12 items-center justify-center">
                                                        <svg className="h-full w-full -rotate-90 transform">
                                                            <circle cx="24" cy="24" r="20" className="stroke-default fill-none" strokeWidth="4" />
                                                            <circle
                                                                cx="24"
                                                                cy="24"
                                                                r="20"
                                                                className="fill-none stroke-accent"
                                                                strokeWidth="4"
                                                                strokeDasharray={`${result.score * 1.25} 125`}
                                                            />
                                                        </svg>
                                                        <span className="absolute text-xs font-bold text-theme-primary">{result.score}%</span>
                                                    </div>
                                                    <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-theme-secondary">{t('results.confidence')}</span>
                                                </div>
                                            </div>

                                            <h3 className="mb-2 line-clamp-2 text-xl font-bold text-theme-primary">{result.product.name}</h3>

                                            <div className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-md border border-default bg-theme-bg/50 px-2.5 py-1 text-xs font-medium text-theme-secondary">
                                                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                                                {result.product.subcategory}
                                            </div>

                                            <p className="mb-6 flex-1 text-sm leading-relaxed text-theme-secondary">{result.product.description}</p>

                                            <div className="mt-auto space-y-3 border-t border-default pt-4">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-theme-secondary">{t('results.targetRisk')}</span>
                                                    <span className="font-medium text-theme-primary">{result.product.riskType}</span>
                                                </div>
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-theme-secondary">{t('results.globalCode')}</span>
                                                    <span className="rounded bg-theme-bg px-1 font-mono text-theme-primary">{result.product.id}</span>
                                                </div>
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-theme-secondary">{t('results.matchReason')}</span>
                                                    <span className="line-clamp-1 max-w-[150px] italic text-accent" title={result.matchReason}>
                                                        {result.matchReason}
                                                    </span>
                                                </div>
                                            </div>
                                        </GlassCard>
                                    </StaggerItem>
                                )
                            })}
                        </StaggerContainer>

                        <div className="mt-12 text-center">
                            <Link href="/insurance/directory" className="inline-flex items-center gap-2 font-bold text-accent transition-colors hover:text-accent-hover">
                                {t('results.browseDirectory')} <ArrowRight className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                )}

                {results && results.length === 0 && (
                    <div className="mx-auto max-w-md py-20 text-center">
                        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10">
                            <ShieldCheck className="h-8 w-8 text-rose-500" />
                        </div>
                        <h3 className="mb-4 text-2xl font-bold text-theme-primary">{t('empty.title')}</h3>
                        <p className="mb-8 text-theme-secondary">
                            {t('empty.description', { query: searchedQuery })}
                        </p>
                        <Link href="/insurance/directory" className="glass-subtle rounded-xl border border-default px-6 py-3 font-bold text-theme-primary">
                            {t('empty.openDirectory')}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
