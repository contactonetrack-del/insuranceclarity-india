import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function DesktopScanCta() {
    const t = useTranslations('auditI18n.header')

    return (
        <Link
            href="/scan"
            className="interactive-focus hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap shrink-0
            tone-brand-gradient border transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-accent/20
            active:scale-95 hover:-translate-y-0.5"
        >
            <Sparkles className="w-4 h-4" />
            {t('scanPolicy')}
        </Link>
    )
}
