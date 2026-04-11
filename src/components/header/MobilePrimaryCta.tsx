'use client'

import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface MobilePrimaryCtaProps {
    onNavigate: () => void
}

export default function MobilePrimaryCta({ onNavigate }: MobilePrimaryCtaProps) {
    const t = useTranslations('auditI18n.header')

    return (
        <Link
            href="/scan"
            className="flex items-center justify-center gap-3 w-full py-5 mb-10 rounded-2xl bg-accent text-white shadow-xl shadow-accent/25 active:scale-95 transition-all font-black text-lg group"
            onClick={onNavigate}
        >
            <Sparkles className="w-6 h-6 flex-shrink-0 group-hover:animate-pulse" />
            <span>{t('scanMyPolicy')}</span>
        </Link>
    )
}
