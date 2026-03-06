'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
    Bot, ArrowRight, ShieldCheck, Sparkles, Send, Activity, User, Briefcase, Zap
} from 'lucide-react'
import {
    RevealOnScroll,
    StaggerContainer,
    StaggerItem,
    GlassCard,
    GradientText,
    IconContainer
} from '@/components/premium'
import { findBestMatches, type MatchResult } from '@/lib/ai-matcher'

export default function AiAdvisorPage() {
    const [query, setQuery] = useState('')
    const [isThinking, setIsThinking] = useState(false)
    const [results, setResults] = useState<MatchResult[] | null>(null)
    const [searchedQuery, setSearchedQuery] = useState('')

    // Auto-scroll to results
    const resultsRef = useRef<HTMLDivElement>(null)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!query.trim()) return

        setSearchedQuery(query)
        setIsThinking(true)
        setResults(null)

        // Super brief mock delay to simulate "AI Thinking" purely for premium UX
        setTimeout(() => {
            const matches = findBestMatches(query, 3)
            setResults(matches)
            setIsThinking(false)

            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }, 100)
        }, 800)
    }

    const suggestionChips = [
        "I just started a retail bakery and worry about fires",
        "Looking to protect my family's income if I die",
        "My company servers might get hacked",
        "I am pregnant and need to cover delivery costs"
    ]

    return (
        <div className="min-h-screen pt-20">
            {/* Hero Section */}
            <section className="py-20 px-6 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none -z-10" />
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none -z-10" />

                <div className="max-w-4xl mx-auto text-center">
                    <RevealOnScroll direction="down" delay={0.1}>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400
                           text-sm rounded-full mb-6 font-bold shadow-lg shadow-indigo-500/10 border border-indigo-500/20">
                            <Bot className="w-4 h-4" />
                            AI RISK ADVISOR
                        </div>
                    </RevealOnScroll>

                    <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-5xl text-theme-primary leading-tight mb-6">
                        Discover Your Perfect Protection with <br />
                        <GradientText className="from-indigo-500 to-purple-600">Semantic AI Matching</GradientText>
                    </h1>

                    <p className="text-xl text-theme-secondary mb-12 max-w-2xl mx-auto leading-relaxed">
                        Don't know what policy you need? Just tell our AI about your life, business, or specific fears in plain English. We'll search 500+ global insurance products instantly.
                    </p>

                    {/* Input Interface */}
                    <RevealOnScroll direction="up" delay={0.2} className="relative z-10 max-w-2xl mx-auto">
                        <GlassCard className="p-2 border-indigo-500/30 shadow-2xl shadow-indigo-500/10">
                            <form onSubmit={handleSubmit} className="relative flex items-center">
                                <Sparkles className="absolute left-6 w-6 h-6 text-indigo-500" />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="e.g., I run a bakery and I'm worried about a flood..."
                                    className="w-full bg-transparent border-none py-6 pl-16 pr-24 text-lg text-theme-primary placeholder:text-theme-secondary/50 focus:ring-0 outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={!query.trim() || isThinking}
                                    className="absolute right-3 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold
                                           hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-2"
                                >
                                    {isThinking ? (
                                        <Activity className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>Analyze <Send className="w-4 h-4" /></>
                                    )}
                                </button>
                            </form>
                        </GlassCard>

                        {/* Suggestion Chips */}
                        <div className="mt-6 flex flex-wrap justify-center gap-3">
                            {suggestionChips.map((chip, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setQuery(chip)}
                                    className="px-4 py-2 rounded-full text-sm border border-default bg-theme-bg/50 text-theme-secondary
                                             hover:border-indigo-500 hover:text-indigo-600 transition-colors"
                                >
                                    "{chip}"
                                </button>
                            ))}
                        </div>
                    </RevealOnScroll>
                </div>
            </section>

            {/* Results Section */}
            <div ref={resultsRef} className="pb-24 px-6 min-h-[400px]">
                {isThinking && (
                    <div className="max-w-4xl mx-auto text-center py-20 animate-pulse">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/10 mb-6">
                            <Bot className="w-8 h-8 text-indigo-500 animate-bounce" />
                        </div>
                        <h3 className="text-2xl font-bold text-theme-primary mb-2">Analyzing Ontology...</h3>
                        <p className="text-theme-secondary">Scanning 500+ IRDAI and global classifications for exact risk-parameter matches.</p>
                    </div>
                )}

                {results && results.length > 0 && (
                    <div className="max-w-6xl mx-auto py-12">
                        <div className="text-center mb-12">
                            <h2 className="text-2xl font-bold text-theme-primary">AI Inference Complete</h2>
                            <p className="text-theme-secondary">Top {results.length} recommended coverage types for: "{searchedQuery}"</p>
                        </div>

                        <StaggerContainer className="grid md:grid-cols-3 gap-6" staggerDelay={0.15}>
                            {results.map((result, index) => {
                                // Choose icon based on sector
                                const sectorLower = result.product.sector.toLowerCase()
                                let SectorIcon = ShieldCheck
                                if (sectorLower.includes('life')) SectorIcon = User
                                else if (sectorLower.includes('business') || sectorLower.includes('property')) SectorIcon = Briefcase
                                else if (sectorLower.includes('health') || sectorLower.includes('personal')) SectorIcon = Activity
                                else if (sectorLower.includes('ev') || sectorLower.includes('cyber')) SectorIcon = Zap

                                return (
                                    <StaggerItem key={index}>
                                        <GlassCard hover className={`h-full border-t-4 flex flex-col relative
                                            ${index === 0 ? 'border-t-indigo-500 shadow-xl shadow-indigo-500/10' : 'border-t-default'}`}
                                        >
                                            {index === 0 && (
                                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold rounded-full shadow-lg">
                                                    BEST MATCH
                                                </div>
                                            )}

                                            <div className="flex justify-between items-start mb-6 mt-2">
                                                <IconContainer icon={SectorIcon} className="text-indigo-500 bg-indigo-500/10" />

                                                {/* Confidence Ring */}
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="relative w-12 h-12 flex items-center justify-center">
                                                        <svg className="w-full h-full transform -rotate-90">
                                                            <circle cx="24" cy="24" r="20" className="stroke-default fill-none" strokeWidth="4" />
                                                            <circle cx="24" cy="24" r="20" className="stroke-indigo-500 fill-none" strokeWidth="4"
                                                                strokeDasharray={`${result.score * 1.25} 125`} />
                                                        </svg>
                                                        <span className="absolute text-xs font-bold text-theme-primary">{result.score}%</span>
                                                    </div>
                                                    <span className="text-[10px] text-theme-secondary mt-1 uppercase font-bold tracking-wider">Confidence</span>
                                                </div>
                                            </div>

                                            <h3 className="text-xl font-bold text-theme-primary mb-2 line-clamp-2">
                                                {result.product.name}
                                            </h3>

                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-theme-bg/50 border border-default text-xs font-medium text-theme-secondary mb-4 w-fit">
                                                <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                                                {result.product.subcategory}
                                            </div>

                                            <p className="text-sm text-theme-secondary flex-1 leading-relaxed mb-6">
                                                {result.product.description}
                                            </p>

                                            <div className="mt-auto space-y-3 pt-4 border-t border-default">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-theme-secondary">Target Risk:</span>
                                                    <span className="font-medium text-theme-primary">{result.product.riskType}</span>
                                                </div>
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-theme-secondary">Global Code:</span>
                                                    <span className="font-mono text-theme-primary bg-theme-bg px-1 rounded">{result.product.id}</span>
                                                </div>
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-theme-secondary">Match Reason:</span>
                                                    <span className="italic text-indigo-500 line-clamp-1 max-w-[150px]" title={result.matchReason}>
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
                            <Link href="/insurance/directory" className="inline-flex items-center gap-2 text-indigo-500 font-bold hover:text-purple-600 transition-colors">
                                Browse the full 500+ item directory <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                )}

                {results && results.length === 0 && (
                    <div className="max-w-md mx-auto text-center py-20">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-500/10 mb-6">
                            <ShieldCheck className="w-8 h-8 text-rose-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-theme-primary mb-4">No Direct Matches Found</h3>
                        <p className="text-theme-secondary mb-8">
                            We couldn't find an exact product mapping for "{searchedQuery}" in our 500+ item database. Try using different keywords or browsing the full directory.
                        </p>
                        <Link href="/insurance/directory" className="px-6 py-3 rounded-xl glass-subtle font-bold text-theme-primary border border-default">
                            Open Full Directory
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
