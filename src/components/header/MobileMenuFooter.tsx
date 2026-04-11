'use client'

import { Coffee } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function MobileMenuFooter() {
    const t = useTranslations('auditI18n.header')

    return (
        <div className="mt-12 mb-8 flex flex-col gap-4">
            <a
                href="https://buymeacoffee.com/insuranceclarity"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl
                bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-black shadow-xl
                active:scale-95 transition-all outline-none"
            >
                <Coffee className="w-5 h-5 flex-shrink-0" />
                {t('supportProject')}
            </a>
            <p className="text-center text-[11px] font-bold text-theme-muted tracking-widest uppercase opacity-60">
                {t('transparencyTagline')}
            </p>
        </div>
    )
}
