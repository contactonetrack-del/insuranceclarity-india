'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Send, Users, Briefcase, Link2, Check } from 'lucide-react'

type ShareButtonsProps = {
    url: string
    title: string
    description?: string
    image?: string
}

export function ShareButtons({ url, title, description = '', image = '' }: ShareButtonsProps) {
    const t = useTranslations('shareButtons')
    const [copied, setCopied] = useState(false)

    const shareLinks = {
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
        whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} - ${url}`)}`,
        pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(image)}&description=${encodeURIComponent(description || title)}`,
    }

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            if (process.env.NODE_ENV !== 'production') {
                console.error('share.copy_failed', err instanceof Error ? err.message : String(err))
            }
        }
    }

    const handleWebShare = async () => {
        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({
                    title,
                    text: description,
                    url,
                })
            } catch {
                // Web Share cancelled or unsupported.
            }
        }
    }

    return (
        <div className="flex flex-col gap-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-theme-secondary">{t('heading')}</h4>
            <div className="flex flex-wrap items-center gap-3">
                <a
                    href={shareLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10 w-10 rounded-full border border-default text-theme-muted transition-all hover:scale-110 hover:border-accent/35 hover:bg-accent/10 hover:text-accent flex items-center justify-center"
                    aria-label={t('aria.xTwitter')}
                >
                    <Send className="h-4 w-4" />
                </a>

                <a
                    href={shareLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10 w-10 rounded-full border border-default text-theme-muted transition-all hover:scale-110 hover:border-accent/35 hover:bg-accent/10 hover:text-accent flex items-center justify-center"
                    aria-label={t('aria.facebook')}
                >
                    <Users className="h-4 w-4" />
                </a>

                <a
                    href={shareLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10 w-10 rounded-full border border-default text-theme-muted transition-all hover:scale-110 hover:border-accent/35 hover:bg-accent/10 hover:text-accent flex items-center justify-center"
                    aria-label={t('aria.linkedIn')}
                >
                    <Briefcase className="h-4 w-4" />
                </a>

                <a
                    href={shareLinks.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10 w-10 rounded-full border border-default text-theme-muted transition-all hover:scale-110 hover:border-accent/35 hover:bg-accent/10 hover:text-accent flex items-center justify-center"
                    aria-label={t('aria.whatsApp')}
                >
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                </a>

                <a
                    href={shareLinks.pinterest}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10 w-10 rounded-full border border-default text-theme-muted transition-all hover:scale-110 hover:border-accent/35 hover:bg-accent/10 hover:text-accent flex items-center justify-center"
                    aria-label={t('aria.pinterest')}
                    onClick={(event) => {
                        if (!image) {
                            event.preventDefault()
                            alert(t('alerts.pinterestImageRequired'))
                        }
                    }}
                >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" stroke="none">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345l-.288 1.178c-.046.182-.149.223-.339.135-1.267-.584-2.06-2.417-2.06-3.896 0-3.172 2.304-6.085 6.646-6.085 3.499 0 6.22 2.493 6.22 5.824 0 3.479-2.193 6.275-5.239 6.275-1.022 0-1.986-.531-2.316-1.161l-.634 2.414c-.229.873-.848 1.966-1.263 2.634 1.111.34 2.298.523 3.535.523 6.621 0 11.988-5.367 11.988-11.987C24.005 5.367 18.638 0 12.017 0z" />
                    </svg>
                </a>

                <button
                    onClick={handleCopy}
                    className={`h-10 w-10 rounded-full border border-default transition-all hover:scale-110 flex items-center justify-center ${copied ? 'border-success-500/30 bg-success-50 text-success-500' : 'text-theme-muted hover:border-accent/35 hover:bg-accent/10 hover:text-accent'}`}
                    aria-label={t('aria.copyLink')}
                >
                    {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
                </button>

                <button
                    onClick={handleWebShare}
                    className="ml-auto inline-flex h-10 rounded-full border border-default px-4 text-sm font-medium text-theme-secondary transition-all hover:border-theme-primary hover:text-theme-primary md:hidden items-center justify-center"
                >
                    {t('actions.share')}
                </button>
            </div>
        </div>
    )
}
