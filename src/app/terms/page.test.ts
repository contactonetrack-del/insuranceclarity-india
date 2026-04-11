/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import TermsPage, { generateMetadata } from './page'

vi.mock('next-intl/server', () => ({
    getTranslations: vi.fn(async (namespace: string) => {
        const metadataMessages: Record<string, string> = {
            title: 'Localized Terms Metadata Title',
            description: 'Localized Terms Metadata Description',
        }

        const pageMessages: Record<string, string> = {
            badge: 'Localized Terms Badge',
            title: 'Localized Terms Title',
            'notice.title': 'Localized Regulatory Notice',
            'sections.acceptance.title': 'Localized Acceptance Heading',
            'sections.consumerProtection.title': 'Localized Consumer Heading',
            'relatedLinks.privacy': 'Localized Privacy Link',
        }

        return (key: string) => {
            if (namespace === 'termsOfServicePage.metadata') {
                return metadataMessages[key] ?? key
            }

            return pageMessages[key] ?? key
        }
    }),
}))

describe('terms/page i18n', () => {
    it('uses localized metadata strings', async () => {
        const metadata = await generateMetadata()

        expect(metadata.title).toBe('Localized Terms Metadata Title')
        expect(metadata.description).toBe('Localized Terms Metadata Description')
    })

    it('renders translated legal content headings', async () => {
        const page = (await TermsPage()) as ReactElement
        render(page)

        expect(screen.getByText('Localized Terms Badge')).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Localized Terms Title' })).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Localized Regulatory Notice' })).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Localized Acceptance Heading' })).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Localized Consumer Heading' })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Localized Privacy Link' })).toHaveAttribute('href', '/privacy')
    })
})
