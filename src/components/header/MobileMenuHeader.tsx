'use client'

import { Menu, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface MobileMenuHeaderProps {
    onClose: () => void
}

export default function MobileMenuHeader({ onClose }: MobileMenuHeaderProps) {
    const t = useTranslations('auditI18n.header')

    return (
        <div className="sticky top-0 z-10 flex items-center justify-between h-20 px-6 bg-card-bg/80 backdrop-blur-xl border-b border-default/50 shrink-0">
            <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
                    <Menu className="w-4 h-4 text-white" />
                </div>
                <span className="font-display font-bold text-xl text-theme-primary tracking-tight">
                    {t('navigation')}
                </span>
            </div>
            <button
                onClick={onClose}
                className="interactive-focus w-11 h-11 flex items-center justify-center glass rounded-xl border-hover transition-all active:scale-90"
                aria-label={t('closeMenu')}
            >
                <X className="w-6 h-6 text-theme-primary" />
            </button>
        </div>
    )
}
