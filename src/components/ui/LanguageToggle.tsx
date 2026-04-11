'use client'

import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useTransition } from 'react'

const YEAR_IN_SECONDS = 60 * 60 * 24 * 365

type LocaleOption = 'en' | 'hi'

interface LanguageToggleProps {
    compact?: boolean
}

const options: Array<{ value: LocaleOption; label: string }> = [
    { value: 'en', label: 'EN' },
    { value: 'hi', label: 'हिं' },
]

export default function LanguageToggle({ compact = false }: LanguageToggleProps) {
    const locale = useLocale() as LocaleOption
    const router = useRouter()
    const t = useTranslations('auditI18n.header')
    const [isPending, startTransition] = useTransition()

    const setLocale = (nextLocale: LocaleOption) => {
        if (nextLocale === locale) return

        document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=${YEAR_IN_SECONDS}; samesite=lax`
        startTransition(() => {
            router.refresh()
        })
    }

    return (
        <div
            className="inline-flex items-center rounded-xl border border-default bg-card-bg/80 p-1 shadow-sm"
            role="group"
            aria-label={t('language')}
        >
            {options.map((option) => {
                const isActive = option.value === locale
                const ariaLabel =
                    option.value === 'en' ? t('switchToEnglish') : t('switchToHindi')

                return (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => setLocale(option.value)}
                        aria-label={ariaLabel}
                        aria-pressed={isActive}
                        disabled={isPending}
                        className={`interactive-focus rounded-lg font-bold transition-colors ${
                            compact ? 'min-w-10 px-2 py-1.5 text-[11px]' : 'min-w-11 px-2.5 py-2 text-xs'
                        } ${
                            isActive
                                ? 'bg-accent text-white shadow-sm'
                                : 'text-theme-secondary hover:bg-secondary'
                        } ${isPending ? 'cursor-wait opacity-70' : ''}`}
                    >
                        {option.label}
                    </button>
                )
            })}
        </div>
    )
}
