/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { Mock } from 'vitest'

const referRouteState = vi.hoisted(() => ({ code: '' }))

vi.mock('next/navigation', () => ({
    useSearchParams: () => ({
        get: (key: string) => (key === 'code' ? referRouteState.code : null),
    }),
}))

const translations = {
    'refer.missingCode': 'Localized missing code message',
    'refer.badge': 'Localized referral badge',
    'refer.title': 'Localized referral title',
    'refer.subtitlePrefix': 'Localized invited with code',
    'refer.subtitleSuffix': 'Localized subtitle suffix',
    'refer.fields.name.label': 'Localized Name',
    'refer.fields.email.label': 'Localized Email',
    'refer.fields.phone.label': 'Localized Phone',
    'refer.actions.submitting': 'Localized submitting',
    'refer.actions.submitted': 'Localized submitted',
    'refer.actions.submit': 'Localized submit request',
    'refer.errors.submitFailed': 'Localized submit failed',
    'refer.messages.success': 'Localized success',
} as const

vi.mock('next-intl', () => ({
    useTranslations: (namespace: string) => (key: string) => {
        const compound = `${namespace}.${key}` as keyof typeof translations
        return translations[compound] ?? compound
    },
}))

import ReferPage from '@/app/refer/page'

describe('Refer page i18n', () => {
    const originalFetch = global.fetch

    beforeEach(() => {
        referRouteState.code = ''
        global.fetch = vi.fn(async () => ({
            ok: true,
            json: async () => ({}),
        })) as unknown as typeof fetch
    })

    afterEach(() => {
        global.fetch = originalFetch
        vi.clearAllMocks()
    })

    it('renders localized missing-code state', () => {
        render(<ReferPage />)

        expect(screen.getByText('Localized missing code message')).toBeInTheDocument()
    })

    it('renders localized form copy when referral code exists', () => {
        referRouteState.code = 'ABC123'
        render(<ReferPage />)

        expect(screen.getByText('Localized referral badge')).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Localized referral title' })).toBeInTheDocument()
        expect(screen.getByText(/Localized invited with code/)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Localized submit request' })).toBeInTheDocument()
        expect((global.fetch as Mock).mock.calls.length).toBeGreaterThan(0)
    })
})
