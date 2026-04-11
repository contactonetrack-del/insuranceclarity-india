'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function HeaderBrand() {
    const t = useTranslations('auditI18n.header')

    return (
        <Link
            href="/"
            className="interactive-focus flex items-center gap-2 rounded-2xl pr-8 group transition-transform duration-300 hover:scale-[1.02] shrink-0"
        >
            <div className="relative flex items-center justify-center shrink-0">
                <Image
                    src="/logo.png"
                    alt={t('logoAlt')}
                    width={108}
                    height={108}
                    className="object-contain w-auto h-16 md:h-[108px] drop-shadow-md shrink-0"
                    priority
                />
            </div>
            <span className="font-display font-bold text-2xl text-theme-primary -ml-5 tracking-tight">
                Insurance<span className="text-gradient"> {t('brandAccent')}</span>
            </span>
        </Link>
    )
}
