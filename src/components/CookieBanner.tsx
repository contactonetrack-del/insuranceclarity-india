'use client'

import { useState, useEffect } from 'react'
import { Cookie, X, Settings, Check } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { trackEvent } from '@/services/analytics.service'
import {
    CONSENT_COOKIE_NAME,
    CONSENT_UPDATED_EVENT,
    type CookiePreferences,
    getCookieValue,
    readCookiePreferences,
} from '@/lib/analytics/consent'
import { syncPostHogConsent } from '@/lib/analytics/posthog'

const CONSENT_COOKIE_DAYS = 365
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

/**
 * Cookie Consent Banner Component
 * Compliant with DPDP Act 2023 and IT Rules 2011
 */
export default function CookieBanner() {
    const t = useTranslations('cookieBanner')

    const getCookie = (name: string): string | null => {
        return getCookieValue(name)
    }

    const setCookie = (name: string, value: string, days: number) => {
        const expires = new Date()
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
        const secureFlag = window.location.protocol === 'https:' ? ';Secure' : ''
        document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax${secureFlag}`
    }

    const applyConsent = (prefs: CookiePreferences) => {
        if (typeof window === 'undefined') return

        if (GA_MEASUREMENT_ID) {
            window[`ga-disable-${GA_MEASUREMENT_ID}`] = !prefs.analytics
        }

        syncPostHogConsent(prefs.analytics)

        if (!prefs.analytics) {
            // Try to delete existing GA cookies
            document.cookie = '_ga=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
            if (GA_MEASUREMENT_ID) {
                document.cookie = `_ga_${GA_MEASUREMENT_ID.replace(/[^a-zA-Z0-9]/g, '')}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
            }
        }

        window.dispatchEvent(new CustomEvent(CONSENT_UPDATED_EVENT, { detail: prefs }))
    }

    const [showBanner, setShowBanner] = useState(false)
    const [showPreferences, setShowPreferences] = useState(false)
    const [preferences, setPreferences] = useState<CookiePreferences>({
        essential: true,
        analytics: false,
    })

    useEffect(() => {
        const consent = getCookie(CONSENT_COOKIE_NAME)
        if (!consent) {
            setTimeout(() => setShowBanner(true), 1000)
        } else {
            const saved = readCookiePreferences(document.cookie)
            if (saved) {
                setPreferences(saved)
                applyConsent(saved)
            } else {
                setShowBanner(true)
            }
        }
    }, [])

    const saveConsent = (prefs: CookiePreferences, method: string) => {
        setPreferences(prefs)
        setCookie(CONSENT_COOKIE_NAME, JSON.stringify(prefs), CONSENT_COOKIE_DAYS)
        applyConsent(prefs)
        setShowBanner(false)
        trackEvent('cookie_consent_updated', {
            method,
            analytics_enabled: prefs.analytics,
        })
    }

    const handleAcceptAll = () => {
        const all: CookiePreferences = { essential: true, analytics: true }
        saveConsent(all, 'accept_all_button')
    }

    const handleRejectNonEssential = () => {
        const essential: CookiePreferences = { essential: true, analytics: false }
        saveConsent(essential, 'reject_non_essential_button')
    }

    const handleSavePreferences = () => {
        saveConsent(preferences, 'save_preferences_button')
        setShowPreferences(false)
    }

    if (!showBanner) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
                <div
                    className="rounded-2xl shadow-2xl border border-default overflow-hidden"
                    style={{
                        background: 'rgb(var(--color-card-bg))',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                    }}
                >
                    {!showPreferences ? (
                        <div className="p-4 md:p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                                    <Cookie className="w-5 h-5 text-accent" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-theme-primary mb-1">
                                        {t('title')}
                                    </h3>
                                    <p className="text-sm text-theme-secondary mb-4">
                                        {t('description')}{' '}
                                        <Link href="/cookies" className="text-accent hover:underline">
                                            {t('learnMore')}
                                        </Link>
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={handleAcceptAll}
                                            className="px-4 py-2 bg-accent text-white rounded-lg font-medium 
                                            hover:bg-accent/90 transition-colors text-sm flex items-center gap-2"
                                        >
                                            <Check className="w-4 h-4" />
                                            {t('actions.acceptAll')}
                                        </button>
                                        <button
                                            onClick={handleRejectNonEssential}
                                            className="px-4 py-2 bg-theme-surface border border-default rounded-lg 
                                            font-medium hover:bg-theme-surface/80 transition-colors text-sm
                                            text-theme-primary"
                                        >
                                            {t('actions.rejectNonEssential')}
                                        </button>
                                        <button
                                            onClick={() => setShowPreferences(true)}
                                            className="px-4 py-2 text-theme-secondary hover:text-theme-primary 
                                            transition-colors text-sm flex items-center gap-2"
                                        >
                                            <Settings className="w-4 h-4" />
                                            {t('actions.managePreferences')}
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={handleRejectNonEssential}
                                    className="text-theme-muted hover:text-theme-primary transition-colors"
                                    aria-label={t('actions.close')}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 md:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-theme-primary flex items-center gap-2">
                                    <Settings className="w-5 h-5 text-accent" />
                                    {t('preferences.title')}
                                </h3>
                                <button
                                    onClick={() => setShowPreferences(false)}
                                    className="text-theme-muted hover:text-theme-primary"
                                    aria-label={t('actions.close')}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex items-start justify-between gap-4 p-3 rounded-lg bg-theme-surface">
                                    <div>
                                        <p className="font-medium text-theme-primary text-sm">{t('preferences.essential.title')}</p>
                                        <p className="text-xs text-theme-secondary mt-0.5">
                                            {t('preferences.essential.description')}
                                        </p>
                                    </div>
                                    <div className="w-12 h-6 bg-success-500 rounded-full flex items-center justify-end px-1">
                                        <div className="w-4 h-4 bg-white rounded-full" />
                                    </div>
                                </div>

                                <div className="flex items-start justify-between gap-4 p-3 rounded-lg bg-theme-surface">
                                    <div>
                                        <p className="font-medium text-theme-primary text-sm">{t('preferences.analytics.title')}</p>
                                        <p className="text-xs text-theme-secondary mt-0.5">
                                            {t('preferences.analytics.description')}
                                        </p>
                                    </div>
                                    <button
                                        role="switch"
                                        aria-checked={preferences.analytics}
                                        aria-label={t('preferences.analytics.toggleAria')}
                                        onClick={() => setPreferences((current) => ({ ...current, analytics: !current.analytics }))}
                                        className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                                            preferences.analytics
                                                ? 'bg-success-500 justify-end'
                                                : 'bg-gray-300 dark:bg-slate-600 justify-start'
                                        }`}
                                    >
                                        <div className="w-4 h-4 bg-white rounded-full shadow" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setShowPreferences(false)}
                                    className="px-4 py-2 text-theme-secondary hover:text-theme-primary text-sm"
                                >
                                    {t('actions.cancel')}
                                </button>
                                <button
                                    onClick={handleSavePreferences}
                                    className="px-4 py-2 bg-accent text-white rounded-lg font-medium 
                                    hover:bg-accent/90 transition-colors text-sm"
                                >
                                    {t('actions.savePreferences')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

declare global {
    interface Window {
        [key: `ga-disable-${string}`]: boolean
    }
}
