'use client'

import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import {
    resolveToneSurfaceClass,
    type Tone,
    type Surface,
} from '@/lib/theme/tone'
import type { LucideIcon } from 'lucide-react'

type MobileNavItem = {
    href: string
    label: string
    description: string
    icon: LucideIcon
    tone: Tone
    surface: Surface
}

interface MobileNavSectionProps {
    sectionId: string
    label: string
    isOpen: boolean
    onToggle: (sectionId: string) => void
    items: MobileNavItem[]
    onNavigate: () => void
    variant?: 'list' | 'grid'
}

export default function MobileNavSection({
    sectionId,
    label,
    isOpen,
    onToggle,
    items,
    onNavigate,
    variant = 'list',
}: MobileNavSectionProps) {
    return (
        <div className="group/cat">
            <button
                onClick={() => onToggle(sectionId)}
                className={`flex items-center justify-between w-full py-4 px-2 text-left rounded-xl transition-all duration-300
                ${isOpen ? 'bg-slate-50 dark:bg-slate-900' : 'hover:bg-slate-50/50 dark:hover:bg-slate-900/50'}`}
            >
                <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isOpen ? 'bg-accent scale-125 shadow-[0_0_10px_rgba(var(--token-accent-rgb),0.42)]' : 'bg-slate-300'}`} />
                    <span className={`text-xs font-black uppercase tracking-[0.2em] transition-colors ${isOpen ? 'text-accent' : 'text-theme-muted'}`}>
                        {label}
                    </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-theme-muted transition-transform duration-300 ${isOpen ? 'rotate-180 text-accent' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'circOut' }}
                        className={variant === 'grid'
                            ? 'overflow-hidden grid grid-cols-2 gap-3 pt-3 pb-6 px-1'
                            : 'overflow-hidden grid grid-cols-1 gap-1.5 pt-2 pb-6 px-2'}
                    >
                        {items.map((item) => (
                            <li key={item.href} className="list-none">
                                <Link
                                    href={item.href}
                                    className={variant === 'grid'
                                        ? 'flex flex-col items-center text-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-default hover:border-accent transition-all active:scale-[0.98] group/item'
                                        : 'flex items-center gap-4 p-4 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-all group/item'}
                                    onClick={onNavigate}
                                >
                                    <div
                                        className={variant === 'grid'
                                            ? `w-11 h-11 rounded-xl border ${resolveToneSurfaceClass(item.tone, item.surface)}
                                            flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover/item:scale-110`
                                            : `w-10 h-10 rounded-xl border ${resolveToneSurfaceClass(item.tone, item.surface)}
                                            flex items-center justify-center shrink-0 shadow-sm group-hover/item:scale-110 transition-transform`}
                                        aria-hidden="true"
                                    >
                                        <item.icon className="w-5 h-5 text-white" strokeWidth={2} />
                                    </div>
                                    {variant === 'grid' ? (
                                        <span className="block font-bold text-[11px] leading-tight line-clamp-2 text-theme-primary">{item.label}</span>
                                    ) : (
                                        <div className="flex-1 min-w-0">
                                            <span className="block font-bold text-sm text-theme-primary group-hover/item:text-accent transition-colors">{item.label}</span>
                                            <span className="block text-[10px] text-theme-muted truncate">{item.description}</span>
                                        </div>
                                    )}
                                </Link>
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    )
}
