'use client'

import { useState, useMemo } from 'react'
import {
    Search, AlertTriangle, CheckCircle, FileText, Shield,
    Heart, Building2, Car, Plane, Home, Briefcase, Gem, UserCheck, Filter
} from 'lucide-react'
import {
    RevealOnScroll,
    StaggerContainer,
    StaggerItem,
    GlassCard,
    AnimatedHeading,
    IconContainer
} from '@/components/premium'
import { hiddenFactsData, severityLevels, getAllFacts, type HiddenFact, getSeverityColor, getSeverityLabel } from '@/data/hidden-facts'

// Categories with SVG icons instead of emojis
const categories = [
    { key: 'all', label: 'All Insurance', icon: Shield },
    { key: 'life', label: 'Life', icon: Heart },
    { key: 'health', label: 'Health', icon: Building2 },
    { key: 'motor', label: 'Motor', icon: Car },
    { key: 'travel', label: 'Travel', icon: Plane },
    { key: 'home', label: 'Home', icon: Home },
    { key: 'business', label: 'Business', icon: Briefcase },
    { key: 'specialized', label: 'Specialized', icon: Gem },
    { key: 'personalAccident', label: 'PA', icon: UserCheck },
]

// Icon colors for categories
const categoryColors: Record<string, string> = {
    all: 'from-slate-500 to-gray-600',
    life: 'from-red-500 to-pink-600',
    health: 'from-emerald-500 to-teal-600',
    motor: 'from-blue-500 to-indigo-600',
    travel: 'from-purple-500 to-violet-600',
    home: 'from-amber-500 to-orange-600',
    business: 'from-slate-600 to-gray-700',
    specialized: 'from-cyan-500 to-blue-600',
    personalAccident: 'from-rose-500 to-red-600',
}

export default function HiddenFactsPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null)

    const allFacts = useMemo(() => getAllFacts(), [])

    const filteredFacts = useMemo(() => {
        let facts = allFacts

        if (selectedCategory !== 'all') {
            facts = facts.filter(fact => fact.category === selectedCategory)
        }

        if (selectedSeverity) {
            facts = facts.filter(fact => fact.severity === selectedSeverity)
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            facts = facts.filter(fact =>
                fact.title.toLowerCase().includes(query) ||
                fact.description.toLowerCase().includes(query) ||
                fact.whatToCheck.toLowerCase().includes(query) ||
                fact.realCase.toLowerCase().includes(query)
            )
        }

        return facts
    }, [allFacts, selectedCategory, selectedSeverity, searchQuery])

    return (
        <div className="min-h-screen pt-20">
            {/* Hero */}
            {/* Hero */}
            <section className="py-16 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <RevealOnScroll direction="down">
                        <span className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full 
                             text-red-500 dark:text-red-400 text-sm mb-4 font-medium">
                            <AlertTriangle className="w-4 h-4" />
                            HIDDEN FACTS REVEALER
                        </span>
                    </RevealOnScroll>

                    <RevealOnScroll direction="up" delay={0.1}>
                        <h1 className="font-display font-bold text-4xl md:text-5xl text-theme-primary mb-6">
                            <AnimatedHeading text="What Insurance Companies Don't Tell You" />
                        </h1>
                    </RevealOnScroll>

                    <RevealOnScroll direction="up" delay={0.2}>
                        <p className="text-theme-secondary text-lg max-w-2xl mx-auto leading-relaxed">
                            Discover 150+ hidden exclusions, fine print clauses, and real claim rejection cases.
                        </p>
                    </RevealOnScroll>
                </div>
            </section>

            {/* Stats */}
            {/* Stats */}
            <div className="max-w-7xl mx-auto px-6 -mt-4">
                <RevealOnScroll direction="up" delay={0.3}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <GlassCard className="text-center" padding="md" hover>
                            <div className="flex justify-center mb-4">
                                <IconContainer icon={FileText} size="md" variant="glass" className="bg-accent/10 text-accent" />
                            </div>
                            <div className="font-display font-bold text-3xl text-gradient mb-1">{allFacts.length}</div>
                            <div className="text-theme-secondary text-sm font-medium">Total Facts</div>
                        </GlassCard>

                        <GlassCard className="text-center" padding="md" hover>
                            <div className="flex justify-center mb-4">
                                <IconContainer icon={AlertTriangle} size="md" variant="glass" className="bg-red-500/10 text-red-500" />
                            </div>
                            <div className="font-display font-bold text-3xl text-red-500 mb-1">
                                {allFacts.filter(f => f.severity === 'critical').length}
                            </div>
                            <div className="text-theme-secondary text-sm font-medium">Critical Issues</div>
                        </GlassCard>

                        <GlassCard className="text-center" padding="md" hover>
                            <div className="flex justify-center mb-4">
                                <IconContainer icon={Shield} size="md" variant="glass" className="bg-accent/10 text-accent" />
                            </div>
                            <div className="font-display font-bold text-3xl text-theme-primary mb-1">8</div>
                            <div className="text-theme-secondary text-sm font-medium">Categories</div>
                        </GlassCard>

                        <GlassCard className="text-center" padding="md" hover>
                            <div className="flex justify-center mb-4">
                                <IconContainer icon={CheckCircle} size="md" variant="glass" className="bg-accent/10 text-accent" />
                            </div>
                            <div className="font-display font-bold text-3xl text-accent mb-1">150+</div>
                            <div className="text-theme-secondary text-sm font-medium">Real Cases</div>
                        </GlassCard>
                    </div>
                </RevealOnScroll>
            </div>

            {/* Search & Filter */}
            <section className="py-8 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Search */}
                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-muted" />
                        <input
                            type="text"
                            placeholder="Search facts, exclusions, or policies..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 glass rounded-xl text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all font-medium"
                        />
                    </div>

                    {/* Category Tabs - with SVG icons */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {categories.map((cat) => {
                            const IconComponent = cat.icon
                            const isActive = selectedCategory === cat.key
                            return (
                                <button
                                    key={cat.key}
                                    onClick={() => setSelectedCategory(cat.key)}
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium 
                    transition-all duration-300 ${isActive
                                            ? 'bg-gradient-accent text-white shadow-lg scale-105'
                                            : 'glass text-theme-secondary hover:text-accent hover:bg-white/5'
                                        }`}
                                >
                                    <IconComponent className="w-4 h-4" strokeWidth={2} />
                                    {cat.label}
                                </button>
                            )
                        })}
                    </div>

                    {/* Severity Filter */}
                    <div className="flex flex-wrap gap-2 mb-8 items-center">
                        <span className="flex items-center gap-2 text-theme-secondary text-sm py-2">
                            <Filter className="w-4 h-4" />
                            Filter by severity:
                        </span>
                        {Object.entries(severityLevels).map(([key, level]) => (
                            <button
                                key={key}
                                onClick={() => setSelectedSeverity(selectedSeverity === key ? null : key)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${selectedSeverity === key
                                    ? getSeverityColor(key) + ' border border-current shadow-sm'
                                    : 'glass text-theme-secondary hover:text-theme-primary hover:bg-white/5'
                                    }`}
                            >
                                {level.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Results */}
            <section className="pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <p className="text-theme-secondary mb-6">
                        Showing {filteredFacts.length} of {allFacts.length} facts
                    </p>

                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6" staggerDelay={0.05}>
                        {filteredFacts.map((fact) => {
                            const severity = getSeverityLabel(fact.severity)
                            return (
                                <StaggerItem key={fact.id}>
                                    <GlassCard
                                        hover
                                        className="relative overflow-hidden h-full group"
                                        padding="lg"
                                    >
                                        {/* Severity Badge */}
                                        <div className={`absolute top-4 right-4 px-2.5 py-1 rounded-full text-xs 
                                    font-bold tracking-wide border shadow-sm ${getSeverityColor(fact.severity)}`}>
                                            {severity.label}
                                        </div>

                                        {/* Category */}
                                        <span className="text-theme-muted text-xs font-bold uppercase tracking-widest mb-2 block">
                                            {hiddenFactsData[fact.category]?.category || fact.category}
                                        </span>

                                        {/* Title */}
                                        <h3 className="font-display font-bold text-xl text-theme-primary mb-3 pr-24 group-hover:text-accent transition-colors">
                                            {fact.title}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-theme-secondary text-sm leading-relaxed mb-4">
                                            {fact.description}
                                        </p>

                                        {/* What to Check */}
                                        <div className="mt-auto p-4 bg-accent/5 border border-accent/10 rounded-xl mb-3">
                                            <p className="text-accent-dark dark:text-accent text-sm flex items-start gap-2.5">
                                                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                                <span><strong className="font-semibold block mb-1">What to Check:</strong> {fact.whatToCheck}</span>
                                            </p>
                                        </div>

                                        {/* Real Case */}
                                        <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                                            <p className="text-amber-700 dark:text-amber-400 text-sm flex items-start gap-2.5">
                                                <FileText className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                                <span><strong className="font-semibold block mb-1">Real Case:</strong> {fact.realCase}</span>
                                            </p>
                                        </div>

                                        {/* Affected Policies */}
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {fact.affectedPolicies.map((policy, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2 py-1 bg-theme-base/50 border border-theme-border text-theme-secondary text-xs rounded-lg font-medium"
                                                >
                                                    {policy}
                                                </span>
                                            ))}
                                        </div>
                                    </GlassCard>
                                </StaggerItem>
                            )
                        })}
                    </StaggerContainer>

                    {/* Empty State */}
                    {filteredFacts.length === 0 && (
                        <GlassCard className="text-center py-16 flex flex-col items-center justify-center">
                            <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 animate-pulse">
                                <Search className="w-10 h-10 text-accent" />
                            </div>
                            <h3 className="font-display font-bold text-xl text-theme-primary mb-2">
                                No facts found
                            </h3>
                            <p className="text-theme-secondary max-w-sm mx-auto">
                                We couldn't find any facts matching your search. Try adjusting your filters.
                            </p>
                        </GlassCard>
                    )}
                </div>
            </section>
        </div>
    )
}
