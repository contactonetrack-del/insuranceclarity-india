'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
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

// Quick navigation shortcuts — always shown when the search box is empty
const QUICK_LINKS: SearchResult[] = [
    { id: 'q1', type: 'tool', title: 'Hidden Facts Revealer', href: '/tools/hidden-facts', description: 'Uncover policy exclusions' },
    { id: 'q2', type: 'tool', title: 'Premium Calculator', href: '/tools/calculator', description: 'Estimate your premium instantly' },
    { id: 'q3', type: 'insurance', title: 'Health Insurance', href: '/insurance/health', description: 'Individual & Family Floater plans' },
    { id: 'q4', type: 'insurance', title: 'Term Life Insurance', href: '/insurance/term-life', description: 'Pure protection, lowest premiums' },
    { id: 'q5', type: 'tool', title: 'Policy Comparison', href: '/tools/compare', description: 'Compare side by side' },
    { id: 'q6', type: 'insurance', title: 'Motor Insurance', href: '/insurance/motor', description: 'Car, Bike & Commercial' },
]

const TYPE_LABELS: Record<SearchResult['type'], string> = {
    insurance: 'Insurance',
    tool: 'Tool',
    fact: 'Hidden Fact',
    claim: 'Claim Case',
}

interface SearchBarProps {
    className?: string
    placeholder?: string
    compact?: boolean
}

export function SearchBar({ className = '', placeholder = 'Search insurance types, tools, facts…', compact = false }: SearchBarProps) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [activeIndex, setActiveIndex] = useState(-1)
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()
    const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined)

    // Search via Meilisearch REST API (falls back to quick links if not configured)
    const search = useCallback(async (q: string) => {
        if (!q.trim()) {
            setResults([])
            return
        }

        setIsLoading(true)
        try {
            const host = process.env.NEXT_PUBLIC_MEILISEARCH_HOST
            const key = process.env.NEXT_PUBLIC_MEILISEARCH_API_KEY

            if (host && key) {
                const res = await fetch(`${host}/multi-search`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${key}`,
                    },
                    body: JSON.stringify({
                        queries: [
                            { indexUid: 'insurance_types', q, limit: 4, attributesToRetrieve: ['id', 'title', 'description', 'href'] },
                            { indexUid: 'hidden_facts', q, limit: 3, attributesToRetrieve: ['id', 'title', 'description', 'href'] },
                        ],
                    }),
                })

                if (res.ok) {
                    const data = await res.json()
                    const merged: SearchResult[] = [
                        ...(data.results[0]?.hits ?? []).map((h: SearchResult) => ({ ...h, type: 'insurance' as const })),
                        ...(data.results[1]?.hits ?? []).map((h: SearchResult) => ({ ...h, type: 'fact' as const })),
                    ]
                    setResults(merged)
                    return
                }
            }

            // Fallback: client-side filter over quick links
            const q_lower = q.toLowerCase()
            setResults(QUICK_LINKS.filter(l =>
                l.title.toLowerCase().includes(q_lower) ||
                l.description.toLowerCase().includes(q_lower)
            ))
        } catch {
            // Silently fall back — search is a progressive enhancement
            setResults([])
        } finally {
            setIsLoading(false)
        }
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setQuery(val)
        setActiveIndex(-1)
        clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => search(val), 300)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        const items = query ? results : QUICK_LINKS
        if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, items.length - 1)) }
        if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, -1)) }
        if (e.key === 'Enter' && activeIndex >= 0) {
            e.preventDefault()
            router.push(items[activeIndex].href)
            setIsOpen(false)
            setQuery('')
        }
        if (e.key === 'Escape') { setIsOpen(false) }
    }

    // Click outside to close
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const displayItems = query ? results : QUICK_LINKS

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Input */}
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
                    value={query}
                    onChange={handleChange}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    aria-label="Search"
                    aria-autocomplete="list"
                    aria-expanded={isOpen}
                    aria-controls="search-results"
                    aria-activedescendant={activeIndex >= 0 ? `search-result-${activeIndex}` : undefined}
                    className={`flex-1 bg-transparent border-none outline-none text-theme-primary 
                               placeholder:text-theme-muted ${compact ? 'text-sm' : 'text-base'}`}
                    autoComplete="off"
                />
                {query && (
                    <button
                        onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus() }}
                        className="text-theme-muted hover:text-theme-primary transition-colors"
                        aria-label="Clear search"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Dropdown results */}
            {isOpen && (
                <div
                    id="search-results"
                    role="listbox"
                    aria-label="Search suggestions"
                    className="absolute top-full left-0 right-0 mt-2 glass-strong rounded-xl border border-default
                               shadow-xl max-h-80 overflow-y-auto z-[var(--z-dropdown)]"
                >
                    {!query && (
                        <p className="text-xs text-theme-muted px-3 pt-3 pb-1 font-medium uppercase tracking-wider">
                            Popular pages
                        </p>
                    )}
                    {displayItems.length === 0 && query && !isLoading && (
                        <p className="px-4 py-6 text-center text-theme-muted text-sm">
                            No results for &ldquo;{query}&rdquo;
                        </p>
                    )}
                    {displayItems.map((item, index) => (
                        <Link
                            key={item.id}
                            id={`search-result-${index}`}
                            href={item.href}
                            role="option"
                            aria-selected={index === activeIndex}
                            className={`flex items-center gap-3 px-3 py-3 transition-colors
                                        text-theme-secondary hover:text-theme-primary hover:bg-accent-5
                                        ${index === activeIndex ? 'bg-accent-5 text-theme-primary' : ''}`}
                            onClick={() => { setIsOpen(false); setQuery('') }}
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-theme-primary truncate">{item.title}</p>
                                <p className="text-xs text-theme-muted truncate">{item.description}</p>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium shrink-0">
                                {TYPE_LABELS[item.type]}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-theme-muted shrink-0" aria-hidden="true" />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}

export default SearchBar
