'use client'

import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'
import LanguageToggle from '@/components/ui/LanguageToggle'
import { useTranslations } from 'next-intl'

interface SessionLike {
    user?: {
        name?: string | null
    } | null
}

interface MobileMenuUtilityBarProps {
    session: SessionLike | null | undefined
    onCloseMenu: () => void
    onSignIn: () => void
}

export default function MobileMenuUtilityBar({
    session,
    onCloseMenu,
    onSignIn,
}: MobileMenuUtilityBarProps) {
    const t = useTranslations('auditI18n.header')

    return (
        <div className="flex items-center justify-between p-4 mb-8 rounded-2xl bg-slate-50/80 dark:bg-slate-900/50 border border-default shadow-sm">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Sparkles className="w-4.5 h-4.5 text-accent" />
                </div>
                <div>
                    <p className="text-[10px] font-black text-theme-muted uppercase tracking-widest leading-none mb-1">{t('preferences')}</p>
                    <p className="text-xs font-bold text-theme-primary">{t('personalize')}</p>
                </div>
            </div>
            <div className="flex items-center gap-3.5">
                <LanguageToggle />
                <ThemeToggle />
                <div className="h-6 w-px bg-default opacity-50" />
                {!session ? (
                    <button
                        onClick={onSignIn}
                        className="px-4 py-2 rounded-xl text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 font-bold text-xs shadow-sm active:scale-95 transition-all"
                    >
                        {t('signIn')}
                    </button>
                ) : (
                    <Link
                        href="/dashboard"
                        onClick={onCloseMenu}
                        className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-bold border border-accent/20"
                    >
                        {session.user?.name?.[0] || 'U'}
                    </Link>
                )}
            </div>
        </div>
    )
}
