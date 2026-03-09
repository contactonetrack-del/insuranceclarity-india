'use client'

import { useEffect, useState } from 'react'
import { initWebVitalsTracking } from '@/services/analytics.service';
import Script from 'next/script'

interface CookiePreferences {
    essential: boolean
    analytics: boolean
}

const CONSENT_COOKIE_NAME = 'ic_cookie_consent'
const CONSENT_UPDATED_EVENT = 'ic-consent-updated'

function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`))
    return match ? decodeURIComponent(match[1]) : null
}

function hasAnalyticsConsent(): boolean {
    const rawConsent = getCookie(CONSENT_COOKIE_NAME)
    if (!rawConsent) return false

    try {
        const parsed = JSON.parse(rawConsent) as Partial<CookiePreferences>
        return parsed.analytics === true
    } catch {
        return false
    }
}

function isDoNotTrackEnabled(): boolean {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
        return false
    }

    const dnt =
        navigator.doNotTrack ||
        window.doNotTrack ||
        navigator.msDoNotTrack

    return dnt === '1' || dnt === 'yes'
}

export default function AnalyticsBootstrap() {
    const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
    const [enabled, setEnabled] = useState(false)

    useEffect(() => {
        if (!measurementId) return

        const syncConsent = () => {
            const nextEnabled = hasAnalyticsConsent() && !isDoNotTrackEnabled()
            window[`ga-disable-${measurementId}`] = !nextEnabled
            setEnabled(nextEnabled)

            if (nextEnabled) {
                initWebVitalsTracking().catch(console.warn)
            }
        }

        syncConsent()
        window.addEventListener(CONSENT_UPDATED_EVENT, syncConsent)

        return () => {
            window.removeEventListener(CONSENT_UPDATED_EVENT, syncConsent)
        }
    }, [measurementId])

    if (!measurementId || !enabled) {
        return null
    }

    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
                strategy="afterInteractive"
            />
            <Script id="ga-bootstrap" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){window.dataLayer.push(arguments);}
                    window.gtag = window.gtag || gtag;
                    gtag('js', new Date());
                    gtag('config', '${measurementId}', {
                        anonymize_ip: true,
                        send_page_view: true
                    });
                `}
            </Script>
        </>
    )
}

declare global {
    interface WindowEventMap {
        'ic-consent-updated': CustomEvent<CookiePreferences>
    }

    interface Window {
        dataLayer: unknown[]
        doNotTrack?: string
        gtag?: (...args: unknown[]) => void
        [key: `ga-disable-${string}`]: boolean
    }

    interface Navigator {
        msDoNotTrack?: string
    }
}
