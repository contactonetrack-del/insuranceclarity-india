'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Filter, Shield, ArrowRight, ChevronDown, CheckCircle, Database } from 'lucide-react'
import {
    RevealOnScroll,
    StaggerContainer,
    StaggerItem,
    GlassCard,
    GradientText,
    AnimatedHeading,
    IconContainer
} from '@/components/premium'

import megaDatabase from '@/data/mega-database.json'

export default function InsuranceDirectoryPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedSector, setSelectedSector] = useState('All Sectors')

    // Extract unique sectors
    const sectors = ['All Sectors', ...Array.from(new Set(megaDatabase.map(item => item.sector)))]

    // Filter logic
    const filteredResults = useMemo(() => {
        return megaDatabase.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.subcategory.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesSector = selectedSector === 'All Sectors' || item.sector === selectedSector
            return matchesSearch && matchesSector
        })
    }, [searchQuery, selectedSector])

    // Grouping the displayed results by category mapping just for UI cleanup if needed, but simple list is robust for 500

    return (
        <div className="min-h-screen pt-20">
            {/* Hero & Search Header */}
            <section className="py-16 px-6 overflow-visible border-b border-default relative">
                <div className="absolute inset-0 bg-gradient-to-b from-accent-5 to-transparent pointer-events-none -z-10" />
                <div className="max-w-7xl mx-auto">
                    <RevealOnScroll direction="down" delay={0.1}>
                        <div className="flex items-center gap-2 text-sm text-theme-secondary mb-8">
                            <Link href="/" className="hover:text-accent transition-colors">Home</Link>
                            <span>/</span>
                            <span className="text-theme-primary font-medium">Insurance Directory</span>
                        </div>
                    </RevealOnScroll>

                    <RevealOnScroll direction="up" delay={0.2} className="text-center max-w-4xl mx-auto mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent to-accent-hover text-white
                           text-sm rounded-full mb-6 font-bold shadow-lg shadow-accent/20">
                            <Database className="w-4 h-4" />
                            {megaDatabase.length} GLOBAL CATEGORIES
                        </div>
                        <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-theme-primary leading-tight mb-6">
                            The Ultimate <GradientText className="from-accent-hover to-accent">Insurance Directory</GradientText>
                        </h1>
                        <p className="text-lg text-theme-secondary mb-8">
                            Explore our comprehensive database of over 500 distinct insurance products mapped to global and IRDAI standards. From standard Life cover to emerging Parametric and EV infrastructure risks.
                        </p>

                        {/* Search Bar Container */}
                        <div className="relative max-w-3xl mx-auto z-20">
                            <div className="glass shadow-2xl rounded-2xl p-2 flex flex-col sm:flex-row gap-2">
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                        <Search className="w-5 h-5 text-theme-muted" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search by policy type, keyword, or category..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full h-14 pl-12 pr-4 bg-transparent border-none focus:ring-0 text-theme-primary placeholder:text-theme-muted text-lg outline-none"
                                    />
                                </div>
                                <div className="h-px sm:h-auto sm:w-px bg-default mx-2" />
                                <div className="relative min-w-[200px]">
                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                        <Filter className="w-5 h-5 text-theme-muted" />
                                    </div>
                                    <select
                                        value={selectedSector}
                                        onChange={(e) => setSelectedSector(e.target.value)}
                                        className="w-full h-14 pl-12 pr-10 bg-transparent border-none focus:ring-0 text-theme-primary cursor-pointer appearance-none text-base font-medium outline-none"
                                    >
                                        {sectors.map(s => (
                                            <option key={s} value={s} className="bg-white dark:bg-slate-800 text-theme-primary">{s}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                        <ChevronDown className="w-5 h-5 text-theme-muted" />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-theme-muted">
                                <span>Popular checks:</span>
                                {['Cyber Security', 'Parametric', 'Term Life', 'Data Breach', 'EV Auto'].map((tag) => (
                                    <button
                                        key={tag}
                                        onClick={() => setSearchQuery(tag)}
                                        className="px-3 py-1 rounded-full glass-subtle hover:text-accent hover:border-accent/30 transition-colors"
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </RevealOnScroll>
                </div>
            </section>

            {/* Results Section */}
            <section className="py-16 px-6 bg-theme-bg relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-default">
                        <h2 className="text-2xl font-display font-bold text-theme-primary">
                            Search Results
                        </h2>
                        <span className="px-3 py-1 rounded-md bg-accent-10 text-accent font-semibold text-sm">
                            {filteredResults.length} {filteredResults.length === 1 ? 'Product' : 'Products'} Found
                        </span>
                    </div>

                    {filteredResults.length === 0 ? (
                        <div className="text-center py-20 px-6 glass-subtle rounded-3xl border-dashed border-2 border-default">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-hover mb-4">
                                <Search className="w-8 h-8 text-theme-muted" />
                            </div>
                            <h3 className="text-xl font-bold text-theme-primary mb-2">No insurance products found</h3>
                            <p className="text-theme-secondary mb-6">We couldn't find any coverage types matching your criteria.</p>
                            <button
                                onClick={() => { setSearchQuery(''); setSelectedSector('All Sectors'); }}
                                className="px-6 py-2.5 rounded-xl bg-theme-primary text-theme-inverted font-medium transition-transform active:scale-95"
                            >
                                Clear all filters
                            </button>
                        </div>
                    ) : (
                        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-5" staggerDelay={0.03}>
                            {filteredResults.map((item) => (
                                <StaggerItem key={item.id}>
                                    <GlassCard hover className="h-full flex flex-col group border-default hover:border-accent/30 p-5">
                                        {/* Badges Row */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md bg-slate-500/10 text-slate-600 dark:text-slate-400">
                                                {item.sector}
                                            </span>
                                            {item.irdaiClass && (
                                                <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                                    IRDAI: {item.irdaiClass}
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="text-lg font-bold text-theme-primary mb-2 group-hover:text-accent transition-colors">
                                            {item.name}
                                        </h3>

                                        <p className="text-sm text-theme-secondary flex-1 mb-6 leading-relaxed">
                                            {item.description}
                                        </p>

                                        {/* Footer Metadata */}
                                        <div className="pt-4 border-t border-default flex items-center justify-between text-xs text-theme-muted">
                                            <div className="flex items-center gap-1.5 font-medium">
                                                <Database className="w-3.5 h-3.5" />
                                                Category: {item.category}
                                            </div>
                                            <div className="font-semibold text-theme-primary bg-hover px-2 py-0.5 rounded">
                                                ID: {item.id}
                                            </div>
                                        </div>
                                    </GlassCard>
                                </StaggerItem>
                            ))}
                        </StaggerContainer>
                    )}
                </div>
            </section>
        </div>
    )
}
