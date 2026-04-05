'use client'

import { useState, useEffect } from 'react'
import { Scale, Check, X, Filter } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { trackPolicyComparison } from '@/services/analytics.service'
import RegulatoryDisclaimer from '@/components/RegulatoryDisclaimer'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { motion, AnimatePresence } from 'framer-motion'
import ComparisonInsight from './ComparisonInsight'

export interface Policy {
    id: string
    name: string
    type: string
    premium: string
    cover: string
    csr: string
    features: string[]
    pros: string[]
    cons: string[]
    roomRent?: string
    waitingPeriod?: string
    coPayment?: string
    restoration?: string
}

interface Category {
    id: string
    name: string
}

export default function CompareClient({ 
    policies, 
    categories 
}: { 
    policies: Policy[], 
    categories: Category[] 
}) {
    const t = useTranslations('tools.compare')
    const [selected, setSelected] = useState<string[]>(policies.slice(0, 2).map((p) => p.id))
    const [activeCategory, setActiveCategory] = useState<string | null>(null)

    useEffect(() => {
        if (selected.length > 0) {
            // Map category name to valid InsuranceCategory type or fallback
            const categoryMap: Record<string, 'life' | 'health' | 'motor' | 'home' | 'travel' | 'specialized'> = {
                'Health': 'health',
                'Life': 'life',
                'Motor': 'motor'
            }
            const cat = activeCategory ? (categoryMap[activeCategory] || 'specialized') : 'health'

            trackPolicyComparison({
                category: cat,
                policyCount: selected.length,
            })
        }
    }, [selected, activeCategory])

    const togglePolicy = (id: string) => {
        if (selected.includes(id)) {
            setSelected(selected.filter((s) => s !== id))
        } else if (selected.length < 3) {
            setSelected([...selected, id])
        }
    }

    const filteredPolicies = activeCategory 
        ? policies.filter(p => p.type === activeCategory)
        : policies

    const selectedPolicies = policies.filter((p) => selected.includes(p.id))

    return (
        <div className="min-h-screen pt-20">
            <section className="py-12 px-6">
                <div className="max-w-4xl mx-auto">
                    <Breadcrumbs />
                    <div className="text-center mt-4">
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent-10 text-accent 
                                       text-sm rounded-full mb-4 font-medium uppercase tracking-wider">
                            <Scale className="w-4 h-4" />
                            {t('badge')}
                        </span>
                        <h1 className="font-display font-bold text-3xl md:text-5xl text-theme-primary mb-4 tracking-tight">
                            {t('title')}
                        </h1>
                        <p className="text-theme-secondary text-lg max-w-2xl mx-auto">
                            {t('subtitle')}
                        </p>
                    </div>
                </div>
            </section>

            {/* Prominent Disclaimer */}
            <section className="px-6 mb-8">
                <div className="max-w-4xl mx-auto">
                    <RegulatoryDisclaimer variant="prominent" />
                </div>
            </section>

            {/* Category Filter */}
            <section className="px-6 mb-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2 scrollbar-none">
                        <div className="flex-shrink-0 text-theme-secondary">
                            <Filter className="w-4 h-4" />
                        </div>
                        <button
                            onClick={() => setActiveCategory(null)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all
                                ${activeCategory === null 
                                    ? 'bg-accent text-white shadow-lg' 
                                    : 'glass text-theme-secondary hover:text-accent'}`}
                        >
                            All Policies
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.name)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap
                                    ${activeCategory === cat.name 
                                        ? 'bg-accent text-white shadow-lg' 
                                        : 'glass text-theme-secondary hover:text-accent'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    <h2 className="text-lg text-theme-primary font-semibold mb-4 flex items-center gap-2">
                        {t('selectTitle')}
                        <span className="text-xs font-normal text-theme-secondary opacity-60">({selected.length}/3)</span>
                    </h2>
                    
                    {filteredPolicies.length === 0 ? (
                        <div className="glass rounded-2xl p-12 text-center">
                            <p className="text-theme-secondary">{t('noPolicies')}</p>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-3">
                            <AnimatePresence mode="popLayout">
                                {filteredPolicies.map((policy) => (
                                    <motion.button
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        key={policy.id}
                                        onClick={() => togglePolicy(policy.id)}
                                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium 
                                          transition-all duration-200 border border-transparent ${selected.includes(policy.id)
                                                ? 'bg-gradient-accent text-white shadow-xl scale-105 border-accent'
                                                : 'glass text-theme-secondary hover:text-accent hover:border-accent/30'
                                            }`}
                                    >
                                        {policy.name}
                                        {selected.includes(policy.id) && <Check className="w-4 h-4" />}
                                    </motion.button>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </section>

            {selectedPolicies.length >= 2 && (
                <ComparisonInsight policies={selectedPolicies} />
            )}

            {selectedPolicies.length >= 1 && (
                <section className="py-8 px-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-7xl mx-auto overflow-x-auto rounded-2xl shadow-2xl border border-default"
                    >
                        <table className="w-full text-left border-collapse glass overflow-hidden">
                            <thead>
                                <tr className="border-b border-default bg-accent-5">
                                    <th className="py-6 px-6 text-theme-secondary font-semibold uppercase text-xs tracking-widest">{t('feature')}</th>
                                    {selectedPolicies.map((p) => (
                                        <th key={p.id} className="py-6 px-6 text-theme-primary font-bold text-lg min-w-[240px]">
                                            <div className="flex flex-col">
                                                <span>{p.name}</span>
                                                <span className="text-xs font-normal text-theme-secondary opacity-70 mt-1">{p.type}</span>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-default">
                                <tr>
                                    <td className="py-5 px-6 text-theme-secondary font-medium">{t('premium')}</td>
                                    {selectedPolicies.map((p) => (
                                        <td key={p.id} className="py-5 px-6 text-accent font-bold text-xl">{p.premium}</td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="py-5 px-6 text-theme-secondary font-medium">{t('cover')}</td>
                                    {selectedPolicies.map((p) => (
                                        <td key={p.id} className="py-5 px-6 text-theme-primary font-medium">{p.cover}</td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="py-5 px-6 text-theme-secondary font-medium">{t('csr')}</td>
                                    {selectedPolicies.map((p) => (
                                        <td key={p.id} className="py-5 px-6 text-accent-light font-bold text-lg">{p.csr}</td>
                                    ))}
                                </tr>
                                
                                {/* Deep Comparison Fields */}
                                <tr>
                                    <td className="py-5 px-6 text-theme-secondary font-medium">{t('roomRent')}</td>
                                    {selectedPolicies.map((p) => (
                                        <td key={p.id} className="py-5 px-6 text-theme-primary">{p.roomRent || "N/A"}</td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="py-5 px-6 text-theme-secondary font-medium">{t('waitingPeriod')}</td>
                                    {selectedPolicies.map((p) => (
                                        <td key={p.id} className="py-5 px-6 text-theme-primary">{p.waitingPeriod || "N/A"}</td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="py-5 px-6 text-theme-secondary font-medium">{t('coPayment')}</td>
                                    {selectedPolicies.map((p) => (
                                        <td key={p.id} className="py-5 px-6 text-theme-primary">{p.coPayment || "0%"}</td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="py-5 px-6 text-theme-secondary font-medium">{t('restoration')}</td>
                                    {selectedPolicies.map((p) => (
                                        <td key={p.id} className="py-5 px-6 text-theme-primary">{p.restoration || "Yes"}</td>
                                    ))}
                                </tr>

                                <tr>
                                    <td className="py-5 px-6 text-theme-secondary font-medium">{t('keyFeatures')}</td>
                                    {selectedPolicies.map((p) => (
                                        <td key={p.id} className="py-5 px-6 text-theme-secondary text-sm leading-relaxed">
                                            {p.features?.map((f, i) => <div key={i} className="mb-1">• {f}</div>)}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="py-5 px-6 text-emerald-600 dark:text-emerald-400 font-medium">{t('pros')}</td>
                                    {selectedPolicies.map((p) => (
                                        <td key={p.id} className="py-5 px-6 text-sm">
                                            {p.pros?.map((pro, i) => (
                                                <div key={i} className="flex items-start gap-1.5 text-emerald-600 dark:text-emerald-400 mb-2">
                                                    <Check className="w-4 h-4 flex-shrink-0 mt-0.5" /> <span>{pro}</span>
                                                </div>
                                            ))}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="py-5 px-6 text-red-600 dark:text-red-400 font-medium">{t('cons')}</td>
                                    {selectedPolicies.map((p) => (
                                        <td key={p.id} className="py-5 px-6 text-sm">
                                            {p.cons?.map((con, i) => (
                                                <div key={i} className="flex items-start gap-1.5 text-red-600 dark:text-red-400 mb-2">
                                                    <X className="w-4 h-4 flex-shrink-0 mt-0.5" /> <span>{con}</span>
                                                </div>
                                            ))}
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </motion.div>
                </section>
            )}


            <section className="py-12 px-6 pb-24">
                <div className="max-w-4xl mx-auto border-t border-default pt-12">
                    {/* Methodology Disclosure */}
                    <div className="glass rounded-2xl p-8 space-y-6">
                        <div>
                            <h4 className="font-display font-semibold text-theme-primary text-xl mb-4">
                                {t('methodology.title')}
                            </h4>
                            <ul className="space-y-4 text-theme-secondary text-sm">
                                <li className="flex gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                                    <span>{t('methodology.sources')}</span>
                                </li>
                                <li className="flex gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                                    <span>{t('methodology.methodology')}</span>
                                </li>
                                <li className="flex gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                                    <span>{t('methodology.limitations')}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
