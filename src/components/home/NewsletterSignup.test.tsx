/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import NewsletterSignup from './NewsletterSignup'

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => {
        const messages: Record<string, string> = {
            titleDefault: 'Localized Newsletter Title',
            subtitleDefault: 'Localized Newsletter Subtitle',
            'actions.subscribe': 'Localized Subscribe',
            'actions.subscribing': 'Localized Subscribing',
            'actions.subscribed': 'Localized Subscribed',
            'placeholders.email': 'Localized Email Placeholder',
            'placeholders.compactEmail': 'Localized Compact Placeholder',
            'aria.form': 'Localized Newsletter Form',
            'aria.compactForm': 'Localized Compact Form',
            'aria.emailLabel': 'Localized Email Label',
            'legal.prefix': 'Localized legal prefix',
            'legal.privacyPolicy': 'Localized Privacy Policy',
            'errors.subscriptionFailed': 'Localized subscription failed',
            'errors.generic': 'Localized generic error',
            'success.title': 'Localized success title',
            'success.description': 'Localized success description',
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

describe('NewsletterSignup', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: false,
            json: async () => ({}),
        }))
    })

    it('renders translated default content', () => {
        render(<NewsletterSignup />)

        expect(screen.getByText('Localized Newsletter Title')).toBeInTheDocument()
        expect(screen.getByText('Localized Newsletter Subtitle')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Localized Email Placeholder')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Localized Subscribe/i })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /Localized Privacy Policy/i })).toHaveAttribute('href', '/privacy')
    })
})
