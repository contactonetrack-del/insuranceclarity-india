/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import CookieBanner from './CookieBanner'

const cookieMocks = vi.hoisted(() => ({
    getCookieValue: vi.fn(() => null),
    readCookiePreferences: vi.fn(() => null),
}))

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => {
        const messages: Record<string, string> = {
            title: 'Localized Cookie Title',
            description: 'Localized cookie description',
            learnMore: 'Localized learn more',
            'actions.acceptAll': 'Localized Accept All',
            'actions.rejectNonEssential': 'Localized Reject',
            'actions.managePreferences': 'Localized Manage',
            'actions.savePreferences': 'Localized Save',
            'actions.cancel': 'Localized Cancel',
            'actions.close': 'Localized Close',
            'preferences.title': 'Localized Preferences',
            'preferences.essential.title': 'Localized Essential',
            'preferences.essential.description': 'Localized Essential Desc',
            'preferences.analytics.title': 'Localized Analytics',
            'preferences.analytics.description': 'Localized Analytics Desc',
            'preferences.analytics.toggleAria': 'Localized Toggle Analytics',
        }
        return messages[key] ?? key
    },
}))

vi.mock('next/link', () => ({
    default: ({
        href,
        children,
        ...props
    }: {
        href: string
        children: ReactNode
        [key: string]: unknown
    }) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
}))

vi.mock('@/services/analytics.service', () => ({
    trackEvent: vi.fn(),
}))

vi.mock('@/lib/analytics/posthog', () => ({
    syncPostHogConsent: vi.fn(),
}))

vi.mock('@/lib/analytics/consent', () => ({
    CONSENT_COOKIE_NAME: 'insurance_cookie_consent',
    CONSENT_UPDATED_EVENT: 'consent-updated',
    getCookieValue: cookieMocks.getCookieValue,
    readCookiePreferences: cookieMocks.readCookiePreferences,
}))

describe('CookieBanner', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('renders translated banner content when consent does not exist', () => {
        render(<CookieBanner />)
        expect(screen.queryByText('Localized Cookie Title')).not.toBeInTheDocument()

        act(() => {
            vi.advanceTimersByTime(1000)
        })

        expect(screen.getByText('Localized Cookie Title')).toBeInTheDocument()
        expect(screen.getByText('Localized cookie description')).toBeInTheDocument()
        expect(screen.getByText('Localized Accept All')).toBeInTheDocument()
        expect(screen.getByText('Localized Reject')).toBeInTheDocument()
        expect(screen.getByText('Localized Manage')).toBeInTheDocument()
    })
})
