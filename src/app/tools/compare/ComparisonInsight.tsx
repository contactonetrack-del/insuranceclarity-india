'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Check, AlertCircle, Loader2, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import type { Policy } from './CompareClient'

interface Verdict {
    winnerId: string
    verdict: string
    pros: string[]
    bestFor: string
    ranking: string[]
}

export default function ComparisonInsight({ policies }: { policies: Policy[] }) {
    const t = useTranslations('tools.compare.insight')
    const [verdict, setVerdict] = useState<Verdict | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const generateVerdict = async () => {
        if (policies.length < 2) return
        
        setLoading(true)
        setError(null)
        
        try {
            const res = await fetch('/api/ai/compare', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ policies })
            })
            
            if (!res.ok) throw new Error('Failed to fetch verdict')
            
            const data = await res.json()
            setVerdict(data)
        } catch (err) {
            setError(t('error'))
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    // Reset verdict when policies change significantly
    const policyIds = policies.map(p => p.id).join(',')
    
    useEffect(() => {
        setVerdict(null)
    }, [policyIds])

    const winner = policies.find(p => p.id === verdict?.winnerId)

    return (
        <section className="px-6 mb-12">
            <div className="max-w-4xl mx-auto">
                <div className="glass rounded-3xl p-8 border border-accent/20 relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent/10 blur-[100px] rounded-full" />
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-gradient-accent rounded-lg">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-display font-bold text-theme-primary">
                                    {t('title')}
                                </h3>
                                <p className="text-sm text-theme-secondary opacity-70">
                                    {t('subtitle')}
                                </p>
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {!verdict && !loading && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center py-8 text-center"
                                >
                                    <p className="text-theme-secondary mb-6 max-w-md">
                                        {t('prompt')}
                                    </p>
                                    <button
                                        onClick={generateVerdict}
                                        disabled={policies.length < 2}
                                        className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-accent 
                                                 text-white rounded-xl font-semibold shadow-xl hover:scale-105 
                                                 transition-all disabled:opacity-50 disabled:hover:scale-100"
                                    >
                                        {t('button')}
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            )}

                            {loading && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center py-12"
                                >
                                    <Loader2 className="w-10 h-10 text-accent animate-spin mb-4" />
                                    <p className="text-theme-primary font-medium animate-pulse">
                                        {t('loading')}
                                    </p>
                                </motion.div>
                            )}

                            {verdict && winner && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-accent uppercase tracking-widest mb-1 italic">
                                                {t('winnerLabel')}
                                            </span>
                                            <h4 className="text-2xl font-bold text-theme-primary">
                                                {winner.name}
                                            </h4>
                                        </div>
                                        <div className="px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-accent font-bold text-sm">
                                            🎯 {verdict.bestFor}
                                        </div>
                                    </div>

                                    <div className="p-6 bg-theme-bg/50 rounded-2xl border border-default leading-relaxed italic">
                                        "{verdict.verdict}"
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <h5 className="text-sm font-semibold text-theme-secondary uppercase tracking-wider">
                                                {t('whyWinner')}
                                            </h5>
                                            <div className="space-y-2">
                                                {verdict.pros.map((pro, idx) => (
                                                    <div key={idx} className="flex items-start gap-2 text-theme-primary text-sm">
                                                        <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                                        <span>{pro}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        {error && (
                                            <div className="flex items-center gap-2 text-red-500 text-sm mt-4">
                                                <AlertCircle className="w-4 h-4" />
                                                <span>{error}</span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    )
}
