'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Mail, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'
import Link from 'next/link'

async function getCsrfToken(): Promise<string | null> {
    const match = document.cookie.match(/(?:^|;\s*)__csrf=([^;]+)/)
    if (match) return decodeURIComponent(match[1])
    try {
        const res = await fetch('/api/csrf')
        if (!res.ok) return null
        const data = await res.json() as { csrfToken: string }
        return data.csrfToken
    } catch {
        return null
    }
}

interface NewsletterSignupProps {
    source?: string
    title?: string
    subtitle?: string
    compact?: boolean
}

export default function NewsletterSignup({
    source = 'footer',
    title,
    subtitle,
    compact = false,
}: NewsletterSignupProps) {
    const t = useTranslations('newsletterSignup')
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [csrfToken, setCsrfToken] = useState<string | null>(null)

    useEffect(() => {
        getCsrfToken().then(setCsrfToken)
    }, [])

    const resolvedTitle = title ?? t('titleDefault')
    const resolvedSubtitle = subtitle ?? t('subtitleDefault')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || loading) return

        setLoading(true)
        setError(null)

        try {
            const res = await fetch('/api/newsletter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
                },
                body: JSON.stringify({ email, source }),
            })

            const data = await res.json() as { success: boolean; message: string }

            if (!res.ok || !data.success) {
                throw new Error(data.message || t('errors.subscriptionFailed'))
            }

            setSuccess(true)
        } catch (err) {
            setError(err instanceof Error ? err.message : t('errors.generic'))
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className={`newsletter-success ${compact ? 'newsletter-success--compact' : ''}`} role="status">
                <CheckCircle2 className="h-6 w-6 text-success-500" aria-hidden="true" />
                <div>
                    <p className="newsletter-success__title">{t('success.title')}</p>
                    <p className="newsletter-success__desc">{t('success.description')}</p>
                </div>
            </div>
        )
    }

    if (compact) {
        return (
            <form onSubmit={handleSubmit} className="newsletter-compact" aria-label={t('aria.compactForm')}>
                <label htmlFor="newsletter-email-compact" className="sr-only">{t('aria.emailLabel')}</label>
                <input
                    id="newsletter-email-compact"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('placeholders.compactEmail')}
                    className="newsletter-compact__input input"
                    required
                    aria-describedby={error ? 'newsletter-error' : undefined}
                />
                <button type="submit" disabled={loading} className="btn-primary newsletter-compact__btn">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <ArrowRight className="w-4 h-4" aria-hidden="true" />}
                </button>
                {error && <p id="newsletter-error" className="newsletter-error" role="alert">{error}</p>}
            </form>
        )
    }

    return (
        <div className="newsletter-signup">
            <div className="newsletter-signup__icon" aria-hidden="true">
                <Mail className="w-7 h-7" />
            </div>
            <h3 className="newsletter-signup__title">{resolvedTitle}</h3>
            <p className="newsletter-signup__subtitle">{resolvedSubtitle}</p>

            <form onSubmit={handleSubmit} className="newsletter-signup__form" aria-label={t('aria.form')}>
                <label htmlFor="newsletter-email" className="sr-only">{t('aria.emailLabel')}</label>
                <input
                    id="newsletter-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('placeholders.email')}
                    className="input newsletter-signup__input"
                    required
                    aria-describedby={error ? 'newsletter-error-main' : undefined}
                />
                <button type="submit" disabled={loading} className="btn-primary newsletter-signup__btn">
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                            {t('actions.subscribing')}
                        </>
                    ) : success ? (
                        <>
                            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                            {t('actions.subscribed')}
                        </>
                    ) : (
                        <>
                            {t('actions.subscribe')}
                            <ArrowRight className="w-4 h-4" aria-hidden="true" />
                        </>
                    )}
                </button>
                {error && <p id="newsletter-error-main" className="newsletter-error mt-2" role="alert">{error}</p>}
            </form>

            <p className="newsletter-signup__legal">
                {t('legal.prefix')}{' '}
                <Link href="/privacy" className="text-accent hover:underline">{t('legal.privacyPolicy')}</Link>.
            </p>
        </div>
    )
}
