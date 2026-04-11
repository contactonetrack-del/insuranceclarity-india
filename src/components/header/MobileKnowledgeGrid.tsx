'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import {
    resolveToneSurfaceClass,
    type Tone,
    type Surface,
} from '@/lib/theme/tone'
import type { LucideIcon } from 'lucide-react'

type KnowledgeNavItem = {
    href: string
    label: string
    icon: LucideIcon
    tone: Tone
    surface: Surface
}

interface MobileKnowledgeGridProps {
    items: KnowledgeNavItem[]
    onNavigate: () => void
}

export default function MobileKnowledgeGrid({
    items,
    onNavigate,
}: MobileKnowledgeGridProps) {
    const t = useTranslations('auditI18n.header')

    return (
        <div className="pt-10 pb-6">
            <p className="text-[10px] text-theme-muted uppercase tracking-[0.3em] mb-8 font-black text-center opacity-70">{t('referenceHub')}</p>
            <ul className="grid grid-cols-3 gap-6">
                {items.map((item) => (
                    <li key={item.href} className="list-none">
                        <Link
                            href={item.href}
                            className="flex flex-col items-center gap-3 group/item"
                            onClick={onNavigate}
                        >
                            <div
                                className={`w-15 h-15 rounded-2xl border ${resolveToneSurfaceClass(item.tone, item.surface)}
                                flex items-center justify-center shrink-0 shadow-lg ring-4 ring-white dark:ring-slate-950 transition-all group-hover/item:scale-110 group-hover/item:shadow-xl active:scale-95`}
                                aria-hidden="true"
                            >
                                <item.icon className="w-7 h-7 text-white" strokeWidth={2} />
                            </div>
                            <span className="block font-extrabold text-[10px] text-theme-primary uppercase tracking-wider group-hover/item:text-accent transition-colors">
                                {item.label.split(' ')[0]}
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}
