'use client'

import { useEffect, useState } from 'react'
import { initWebVitalsTracking } from '@/services/analytics.service';
import Script from 'next/script'
import { isRuntimeAnalyticsDisabled } from '@/lib/runtime-flags';
import { CONSENT_UPDATED_EVENT, hasAnalyticsConsent } from '@/lib/analytics/consent';
import { ensurePostHogInitialized, isPostHogConfigured, syncPostHogConsent } from '@/lib/analytics/posthog';

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

interface AnalyticsBootstrapProps {
    nonce?: string
}

export default function AnalyticsBootstrap({ nonce }: AnalyticsBootstrapProps) {
    const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
    const [enabled, setEnabled] = useState(false)
    const analyticsDisabled = isRuntimeAnalyticsDisabled()
    const hasProductAnalytics = isPostHogConfigured()

    useEffect(() => {
        if ((!measurementId && !hasProductAnalytics) || analyticsDisabled) return

        const syncConsent = () => {
            const nextEnabled = hasAnalyticsConsent() && !isDoNotTrackEnabled()
            if (measurementId) {
                window[`ga-disable-${measurementId}`] = !nextEnabled
            }
            setEnabled(nextEnabled)

            if (nextEnabled) {
                void ensurePostHogInitialized()
                initWebVitalsTracking().catch(() => {/* fail gracefully without logging to client console */})
            } else {
                syncPostHogConsent(false)
            }
        }

        syncConsent()
        window.addEventListener(CONSENT_UPDATED_EVENT, syncConsent)

        return () => {
            window.removeEventListener(CONSENT_UPDATED_EVENT, syncConsent)
        }
    }, [analyticsDisabled, hasProductAnalytics, measurementId])

    if (!measurementId || analyticsDisabled || !enabled) {
        return null
    }

    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
                strategy="afterInteractive"
                nonce={nonce}
            />
            <Script id="ga-bootstrap" strategy="afterInteractive" nonce={nonce}>
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
        'ic-consent-updated': CustomEvent<import('@/lib/analytics/consent').CookiePreferences>
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
