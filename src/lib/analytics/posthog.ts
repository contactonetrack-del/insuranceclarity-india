import { isRuntimeAnalyticsDisabled } from '@/lib/runtime-flags'
import { hasAnalyticsConsent } from '@/lib/analytics/consent'

type PostHogClient = typeof import('posthog-js').default

interface PostHogConfig {
    host: string
    key: string
}

function getPostHogConfig(): PostHogConfig | null {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim()
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim()

    if (!key || !host) {
        return null
    }

    return { key, host }
}

export function isPostHogConfigured(): boolean {
    return getPostHogConfig() !== null
}

export async function ensurePostHogInitialized(): Promise<PostHogClient | null> {
    if (typeof window === 'undefined' || isRuntimeAnalyticsDisabled() || !hasAnalyticsConsent()) {
        return null
    }

    if (window.posthog) {
        window.posthog.opt_in_capturing()
        return window.posthog
    }

    const config = getPostHogConfig()
    if (!config) {
        return null
    }

    const { default: posthog } = await import('posthog-js')

    posthog.init(config.key, {
        api_host: config.host,
        autocapture: false,
        capture_pageleave: 'if_capture_pageview',
        capture_pageview: 'history_change',
        defaults: '2025-11-30',
        disable_session_recording: true,
        mask_personal_data_properties: true,
        person_profiles: 'identified_only',
        loaded: (client) => {
            window.posthog = client as PostHogClient
            window.posthog.opt_in_capturing()
        },
    })

    window.posthog = posthog
    window.posthog.opt_in_capturing()

    return window.posthog
}

export function syncPostHogConsent(enabled: boolean): void {
    if (typeof window === 'undefined' || !window.posthog) {
        return
    }

    if (enabled) {
        window.posthog.opt_in_capturing()
        return
    }

    window.posthog.opt_out_capturing()
    window.posthog.reset()
}

declare global {
    interface Window {
        posthog?: PostHogClient
    }
}
