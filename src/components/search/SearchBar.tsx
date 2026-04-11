'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Search, X, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface SearchResult {
    id: string
    type: 'insurance' | 'tool' | 'fact' | 'claim'
    title: string
    description: string
    href: string
    category?: string
}

const QUICK_LINK_SEEDS = [
    { id: 'q1', type: 'tool', key: 'hiddenFacts', href: '/tools/hidden-facts' },
    { id: 'q2', type: 'tool', key: 'premiumCalculator', href: '/tools/calculator' },
    { id: 'q3', type: 'insurance', key: 'healthInsurance', href: '/insurance/health' },
    { id: 'q4', type: 'insurance', key: 'termLifeInsurance', href: '/insurance/term-life' },
    { id: 'q5', type: 'tool', key: 'policyComparison', href: '/tools/compare' },
    { id: 'q6', type: 'insurance', key: 'motorInsurance', href: '/insurance/motor' },
] as const

interface SearchBarProps {
    className?: string
    placeholder?: string
    compact?: boolean
}

export function SearchBar({ className = '', placeholder, compact = false }: SearchBarProps) {
    const t = useTranslations('searchBar')
    const resolvedPlaceholder = placeholder ?? t('placeholder')

    const quickLinks: SearchResult[] = QUICK_LINK_SEEDS.map((item) => ({
        id: item.id,
        type: item.type,
        href: item.href,
        title: t(`quickLinks.${item.key}.title`),
        description: t(`quickLinks.${item.key}.description`),
    }))

    const typeLabels: Record<SearchResult['type'], string> = {
        insurance: t('typeLabels.insurance'),
        tool: t('typeLabels.tool'),
        fact: t('typeLabels.fact'),
        claim: t('typeLabels.claim'),
    }

    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [activeIndex, setActiveIndex] = useState(-1)
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()
    const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined)

    const search = useCallback(async (q: string) => {
        if (!q.trim()) {
            setResults([])
            return
        }

        setIsLoading(true)
        try {
            const params = new URLSearchParams({ q: q.trim(), index: 'products' })
            const res = await fetch(`/api/search?${params.toString()}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            })

            if (res.ok) {
                const data = await res.json() as {
                    hits?: Array<{
                        id?: string
                        _id?: string
                        title?: string
                        name?: string
                        description?: string
                        category?: string
                        href?: string
                        type?: SearchResult['type']
                    }>
                }
                const hits = data.hits ?? []
                const mapped: SearchResult[] = hits.map((h) => ({
                    id: String(h.id ?? h._id ?? Math.random()),
                    type: (h.type as SearchResult['type']) ?? 'insurance',
                    title: h.title ?? h.name ?? '',
                    description: h.description ?? h.category ?? '',
                    href: h.href ?? `/insurance/${encodeURIComponent(h.title ?? h.name ?? '')}`,
                    category: h.category,
                }))
                setResults(mapped)
                return
            }

            const qLower = q.toLowerCase()
            setResults(quickLinks.filter((link) =>
                link.title.toLowerCase().includes(qLower) ||
                link.description.toLowerCase().includes(qLower),
            ))
        } catch {
            const qLower = q.toLowerCase()
            setResults(quickLinks.filter((link) =>
                link.title.toLowerCase().includes(qLower) ||
                link.description.toLowerCase().includes(qLower),
            ))
        } finally {
            setIsLoading(false)
        }
    }, [quickLinks])

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setQuery(value)
        setActiveIndex(-1)
        clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => search(value), 300)
    }

    const handleKeyDown = (event: React.KeyboardEvent) => {
        const items = query ? results : quickLinks
        if (event.key === 'ArrowDown') {
            event.preventDefault()
            setActiveIndex((index) => Math.min(index + 1, items.length - 1))
        }
        if (event.key === 'ArrowUp') {
            event.preventDefault()
            setActiveIndex((index) => Math.max(index - 1, -1))
        }
        if (event.key === 'Enter' && activeIndex >= 0) {
            event.preventDefault()
            router.push(items[activeIndex].href)
            setIsOpen(false)
            setQuery('')
        }
        if (event.key === 'Escape') {
            setIsOpen(false)
        }
    }

    useEffect(() => {
        const handler = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const displayItems = query ? results : quickLinks

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <div className={`flex items-center gap-2 glass border border-default 
                             focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20
                             transition-all duration-200 rounded-xl ${compact ? 'px-3 py-2' : 'px-4 py-3'}`}>
                {isLoading ? (
                    <Loader2 className="w-4 h-4 text-theme-muted shrink-0 animate-spin" aria-hidden="true" />
                ) : (
                    <Search className="w-4 h-4 text-theme-muted shrink-0" aria-hidden="true" />
                )}
                <input
                    ref={inputRef}
                    type="search"
                    role="combobox"
                    value={query}
                    onChange={handleChange}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={resolvedPlaceholder}
                    aria-label={t('aria.searchInput')}
                    aria-autocomplete="list"
                    aria-expanded={isOpen}
                    aria-controls="search-results"
                    aria-haspopup="listbox"
                    aria-activedescendant={activeIndex >= 0 ? `search-result-${activeIndex}` : undefined}
                    className={`flex-1 bg-transparent border-none outline-none text-theme-primary 
                               placeholder:text-theme-muted ${compact ? 'text-sm' : 'text-base'}`}
                    autoComplete="off"
                />
                {query && (
                    <button
                        onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus() }}
                        className="text-theme-muted hover:text-theme-primary transition-colors"
                        aria-label={t('aria.clearSearch')}
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {isOpen && (
                <div
                    className="absolute top-full left-0 right-0 mt-2 glass-strong rounded-xl border border-default
                               shadow-xl max-h-80 overflow-y-auto z-[var(--z-dropdown)]"
                >
                    {!query && (
                        <p className="text-xs text-theme-muted px-3 pt-3 pb-1 font-medium uppercase tracking-wider">
                            {t('popularPages')}
                        </p>
                    )}
                    {displayItems.length === 0 && query && !isLoading && (
                        <p className="px-4 py-6 text-center text-theme-muted text-sm">
                            {t('noResults', { query })}
                        </p>
                    )}
                    {displayItems.length > 0 && (
                        <div
                            id="search-results"
                            role="listbox"
                            aria-label={t('aria.searchSuggestions')}
                        >
                            {displayItems.map((item, index) => (
                                <Link
                                    key={item.id}
                                    id={`search-result-${index}`}
                                    href={item.href}
                                    role="option"
                                    aria-selected={index === activeIndex}
                                    className={`flex items-center gap-3 px-3 py-3 transition-colors
                                                text-theme-secondary hover:text-theme-primary hover:bg-accent/5
                                                ${index === activeIndex ? 'bg-accent/5 text-theme-primary' : ''}`}
                                    onClick={() => { setIsOpen(false); setQuery('') }}
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-theme-primary truncate">{item.title}</p>
                                        <p className="text-xs text-theme-muted truncate">{item.description}</p>
                                    </div>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium shrink-0">
                                        {typeLabels[item.type]}
                                    </span>
                                    <ArrowRight className="w-3.5 h-3.5 text-theme-muted shrink-0" aria-hidden="true" />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default SearchBar
