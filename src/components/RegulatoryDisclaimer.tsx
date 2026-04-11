'use client'

import { AlertTriangle } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface RegulatoryDisclaimerProps {
    variant?: 'compact' | 'prominent'
    className?: string
}

export default function RegulatoryDisclaimer({
    variant = 'compact',
    className = '',
}: RegulatoryDisclaimerProps) {
    const t = useTranslations('regulatoryDisclaimer')
    const disclaimerText = t('body')

    if (variant === 'prominent') {
        return (
            <div className={`rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 ${className}`}>
                <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                    <div className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
                        <p className="font-medium">{t('prominent.title')}</p>
                        <p className="leading-relaxed opacity-90">{disclaimerText}</p>
                        <div className="border-t border-amber-500/20 pt-2 text-xs opacity-80">
                            <p>
                                <strong>{t('prominent.weDoNotLabel')}</strong>{' '}
                                {t('prominent.weDoNotItems')}
                            </p>
                            <p className="mt-1">
                                <strong>{t('prominent.complaintsLabel')}</strong>{' '}
                                <a href="https://bimabharosa.irdai.gov.in" target="_blank" rel="noopener noreferrer" className="underline">
                                    {t('prominent.complaintsPortal')}
                                </a>{' '}
                                |{' '}
                                <a href="https://www.irdai.gov.in" target="_blank" rel="noopener noreferrer" className="underline">
                                    {t('prominent.irdaiWebsite')}
                                </a>{' '}
                                | {t('prominent.complaintsEmail')} | {t('prominent.complaintsPhones')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={`flex flex-col gap-x-2 text-[12px] leading-relaxed text-theme-muted/80 md:flex-row md:items-center ${className}`}>
            <span className="shrink-0 font-bold uppercase tracking-tighter text-theme-secondary decoration-accent/30 underline underline-offset-4">
                {t('compact.label')}
            </span>
            <p>{t('compact.body')}</p>
        </div>
    )
}
