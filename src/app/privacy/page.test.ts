/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import PrivacyPage, { generateMetadata } from './page'

vi.mock('next-intl/server', () => ({
    getTranslations: vi.fn(async (namespace: string) => {
        const metadataMessages: Record<string, string> = {
            title: 'Localized Privacy Metadata Title',
            description: 'Localized Privacy Metadata Description',
        }

        const pageMessages: Record<string, string> = {
            badge: 'Localized Privacy Badge',
            title: 'Localized Privacy Title',
            'sections.introduction.title': 'Localized Introduction Heading',
            'sections.processingPrinciples.title': 'Localized Principles Heading',
            'sections.contact.title': 'Localized Contact Heading',
            'relatedLinks.terms': 'Localized Terms Link',
        }

        return (key: string) => {
            if (namespace === 'privacyPolicyPage.metadata') {
                return metadataMessages[key] ?? key
            }

            return pageMessages[key] ?? key
        }
    }),
}))

describe('privacy/page i18n', () => {
    it('uses localized metadata strings', async () => {
        const metadata = await generateMetadata()

        expect(metadata.title).toBe('Localized Privacy Metadata Title')
        expect(metadata.description).toBe('Localized Privacy Metadata Description')
    })

    it('renders translated body headings', async () => {
        const page = (await PrivacyPage()) as ReactElement
        render(page)

        expect(screen.getByText('Localized Privacy Badge')).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Localized Privacy Title' })).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Localized Introduction Heading' })).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Localized Principles Heading' })).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Localized Contact Heading' })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Localized Terms Link' })).toHaveAttribute('href', '/terms')
    })
})
