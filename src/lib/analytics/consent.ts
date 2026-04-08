export interface CookiePreferences {
    essential: boolean
    analytics: boolean
}

export const CONSENT_COOKIE_NAME = 'ic_cookie_consent'
export const CONSENT_UPDATED_EVENT = 'ic-consent-updated'

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function getCookieValue(name: string, cookieStore?: string | null): string | null {
    const source = cookieStore ?? (typeof document === 'undefined' ? null : document.cookie)
    if (!source) {
        return null
    }

    const match = source.match(new RegExp(`(?:^|; )${escapeRegExp(name)}=([^;]+)`))
    return match ? decodeURIComponent(match[1]) : null
}

export function readCookiePreferences(cookieStore?: string | null): CookiePreferences | null {
    const rawConsent = getCookieValue(CONSENT_COOKIE_NAME, cookieStore)
    if (!rawConsent) {
        return null
    }

    try {
        const parsed = JSON.parse(rawConsent) as Partial<CookiePreferences>
        return {
            essential: parsed.essential !== false,
            analytics: parsed.analytics === true,
        }
    } catch {
        return null
    }
}

export function hasConsentCookie(cookieStore?: string | null): boolean {
    return getCookieValue(CONSENT_COOKIE_NAME, cookieStore) !== null
}

export function hasAnalyticsConsent(cookieStore?: string | null): boolean {
    return readCookiePreferences(cookieStore)?.analytics === true
}
