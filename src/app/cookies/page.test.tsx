/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import CookiePolicyPage, { generateMetadata } from './page'

vi.mock('next-intl/server', () => ({
    getTranslations: vi.fn(async (namespace: string) => {
        const metadataMessages: Record<string, string> = {
            title: 'Localized Cookie Metadata Title',
            description: 'Localized Cookie Metadata Description',
        }

        const pageMessages: Record<string, string> = {
            badge: 'Localized Legal Badge',
            title: 'Localized Cookie Page Title',
            lastUpdatedLabel: 'Localized Last Updated',
            lastUpdatedDate: 'Localized Date',
            'sections.whatAreCookies.title': 'Localized What Are Cookies',
            'sections.cookiesUse.title': 'Localized Cookies We Use',
            'relatedLinks.privacy': 'Localized Privacy Link',
            'relatedLinks.terms': 'Localized Terms Link',
        }

        return (key: string) => {
            if (namespace === 'cookiePolicyPage.metadata') {
                return metadataMessages[key] ?? key
            }

            return pageMessages[key] ?? key
        }
    }),
}))

describe('cookies/page i18n', () => {
    it('uses localized metadata', async () => {
        const metadata = await generateMetadata()
        expect(metadata.title).toBe('Localized Cookie Metadata Title')
        expect(metadata.description).toBe('Localized Cookie Metadata Description')
    })

    it('renders translated page labels', async () => {
        const page = (await CookiePolicyPage()) as ReactElement
        render(page)

        expect(screen.getByText('Localized Legal Badge')).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Localized Cookie Page Title' })).toBeInTheDocument()
        expect(screen.getByText(/Localized Last Updated/i)).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Localized What Are Cookies' })).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Localized Cookies We Use' })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Localized Privacy Link' })).toHaveAttribute('href', '/privacy')
        expect(screen.getByRole('link', { name: 'Localized Terms Link' })).toHaveAttribute('href', '/terms')
    })
})
