'use client'

import { useState, useEffect } from 'react'
import { Cookie, X, Settings, Check } from 'lucide-react'
import Link from 'next/link'

type ConsentState = 'pending' | 'accepted' | 'rejected' | 'custom'

interface CookiePreferences {
    essential: boolean // Always true
    analytics: boolean
}

const CONSENT_COOKIE_NAME = 'ic_cookie_consent'
const CONSENT_COOKIE_DAYS = 365

/**
 * Cookie Consent Banner Component
 * Compliant with DPDP Act 2023 and IT Rules 2011
 */
export default function CookieBanner() {
    const [showBanner, setShowBanner] = useState(false)
    const [showPreferences, setShowPreferences] = useState(false)
    const [preferences, setPreferences] = useState<CookiePreferences>({
        essential: true,
        analytics: false,
    })

    useEffect(() => {
        // Check if consent already given
        const consent = getCookie(CONSENT_COOKIE_NAME)
        if (!consent) {
            // Small delay to avoid layout shift
            setTimeout(() => setShowBanner(true), 1000)
        } else {
            // Apply saved preferences
            try {
                const saved = JSON.parse(consent)
                setPreferences(saved)
                applyConsent(saved)
            } catch {
                setShowBanner(true)
            }
        }
    }, [])

    const getCookie = (name: string): string | null => {
        if (typeof document === 'undefined') return null
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
        return match ? decodeURIComponent(match[2]) : null
    }

    const setCookie = (name: string, value: string, days: number) => {
        const expires = new Date()
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
        document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`
    }

    const applyConsent = (prefs: CookiePreferences) => {
        if (typeof window === 'undefined') return

        if (prefs.analytics) {
            // Enable GA4
            window[`ga-disable-${process.env.NEXT_PUBLIC_GA_ID}`] = false
        } else {
            // Disable GA4
            window[`ga-disable-${process.env.NEXT_PUBLIC_GA_ID}`] = true
            // Try to delete existing GA cookies
            document.cookie = '_ga=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
            document.cookie = '_ga_=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        }
    }

    const handleAcceptAll = () => {
        const newPrefs: CookiePreferences = { essential: true, analytics: true }
        setPreferences(newPrefs)
        setCookie(CONSENT_COOKIE_NAME, JSON.stringify(newPrefs), CONSENT_COOKIE_DAYS)
        applyConsent(newPrefs)
        setShowBanner(false)
    }

    const handleRejectNonEssential = () => {
        const newPrefs: CookiePreferences = { essential: true, analytics: false }
        setPreferences(newPrefs)
        setCookie(CONSENT_COOKIE_NAME, JSON.stringify(newPrefs), CONSENT_COOKIE_DAYS)
        applyConsent(newPrefs)
        setShowBanner(false)
    }

    const handleSavePreferences = () => {
        setCookie(CONSENT_COOKIE_NAME, JSON.stringify(preferences), CONSENT_COOKIE_DAYS)
        applyConsent(preferences)
        setShowBanner(false)
        setShowPreferences(false)
    }

    if (!showBanner) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
                <div className="glass-strong rounded-2xl shadow-2xl border border-default overflow-hidden">
                    {!showPreferences ? (
                        /* Main Banner */
                        <div className="p-4 md:p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-accent-10 flex items-center justify-center flex-shrink-0">
                                    <Cookie className="w-5 h-5 text-accent" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-theme-primary mb-1">
                                        We use cookies
                                    </h3>
                                    <p className="text-sm text-theme-secondary mb-4">
                                        We use essential cookies for site functionality and analytics cookies to understand
                                        how you use our site. You can accept all cookies, reject non-essential ones,
                                        or customize your preferences.{' '}
                                        <Link href="/cookies" className="text-accent hover:underline">
                                            Learn more
                                        </Link>
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={handleAcceptAll}
                                            className="px-4 py-2 bg-accent text-white rounded-lg font-medium 
                                                     hover:bg-accent/90 transition-colors text-sm flex items-center gap-2"
                                        >
                                            <Check className="w-4 h-4" />
                                            Accept All
                                        </button>
                                        <button
                                            onClick={handleRejectNonEssential}
                                            className="px-4 py-2 bg-theme-surface border border-default rounded-lg 
                                                     font-medium hover:bg-theme-surface/80 transition-colors text-sm
                                                     text-theme-primary"
                                        >
                                            Reject Non-Essential
                                        </button>
                                        <button
                                            onClick={() => setShowPreferences(true)}
                                            className="px-4 py-2 text-theme-secondary hover:text-theme-primary 
                                                     transition-colors text-sm flex items-center gap-2"
                                        >
                                            <Settings className="w-4 h-4" />
                                            Manage Preferences
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={handleRejectNonEssential}
                                    className="text-theme-muted hover:text-theme-primary transition-colors"
                                    aria-label="Close"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Preferences Panel */
                        <div className="p-4 md:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-theme-primary flex items-center gap-2">
                                    <Settings className="w-5 h-5 text-accent" />
                                    Cookie Preferences
                                </h3>
                                <button
                                    onClick={() => setShowPreferences(false)}
                                    className="text-theme-muted hover:text-theme-primary"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4 mb-6">
                                {/* Essential Cookies */}
                                <div className="flex items-start justify-between gap-4 p-3 rounded-lg bg-theme-surface">
                                    <div>
                                        <p className="font-medium text-theme-primary text-sm">Essential Cookies</p>
                                        <p className="text-xs text-theme-secondary mt-0.5">
                                            Required for website functionality. Cannot be disabled.
                                        </p>
                                    </div>
                                    <div className="w-12 h-6 bg-green-500 rounded-full flex items-center justify-end px-1">
                                        <div className="w-4 h-4 bg-white rounded-full" />
                                    </div>
                                </div>

                                {/* Analytics Cookies */}
                                <div className="flex items-start justify-between gap-4 p-3 rounded-lg bg-theme-surface">
                                    <div>
                                        <p className="font-medium text-theme-primary text-sm">Analytics Cookies</p>
                                        <p className="text-xs text-theme-secondary mt-0.5">
                                            Help us understand how visitors use our website (Google Analytics).
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setPreferences(p => ({ ...p, analytics: !p.analytics }))}
                                        className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${preferences.analytics ? 'bg-green-500 justify-end' : 'bg-gray-300 justify-start'
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
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSavePreferences}
                                    className="px-4 py-2 bg-accent text-white rounded-lg font-medium 
                                             hover:bg-accent/90 transition-colors text-sm"
                                >
                                    Save Preferences
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// Extend Window interface for GA disable flag
declare global {
    interface Window {
        [key: `ga-disable-${string}`]: boolean
    }
}
