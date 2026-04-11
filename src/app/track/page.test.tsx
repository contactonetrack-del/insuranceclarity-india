/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import TrackQuotePage from './page'

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => {
        const messages: Record<string, string> = {
            'hero.title': 'Localized Track Title',
            'hero.descriptionPrefix': 'Localized Description Prefix',
            'hero.quoteIdHighlight': 'Localized Quote ID',
            'hero.descriptionSuffix': 'Localized Description Suffix',
            'form.placeholder': 'Localized Track Placeholder',
            'form.locate': 'Localized Locate',
            'validation.tooShort': 'Localized Too Short',
            'validation.tooLong': 'Localized Too Long',
            'validation.required': 'Localized Required',
            'errors.noRecordFound': 'Localized No Record',
            'errors.requestFailedLog': 'Localized Request Failed Log',
            'errors.requestFailed': 'Localized Request Failed',
            'result.quoteVerified': 'Localized Quote Verified',
            'result.generatingPdf': 'Localized Generating PDF',
            'result.insuranceType': 'Localized Insurance Type',
            'result.basePremiumDue': 'Localized Base Premium',
            'result.perMonth': '/localized-month',
            'result.totalCoverageValue': 'Localized Coverage Value',
            'result.applicationDate': 'Localized Application Date',
            'result.bundleDescription': 'Localized Bundle Description',
            'result.downloadPdf': 'Localized Download PDF',
            'result.notAvailable': '---',
        }

        return messages[key] ?? key
    },
}))

vi.mock('@/components/premium/text/animated-text', () => ({
    AnimatedHeading: ({ text, as: Tag = 'h1', className }: { text: string; as?: 'h1' | 'h2'; className?: string }) => (
        <Tag className={className}>{text}</Tag>
    ),
    GradientText: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}))

vi.mock('../actions/track-actions', () => ({
    fetchQuoteStatus: vi.fn(),
}))

describe('TrackQuotePage', () => {
    it('renders translated track UI copy', () => {
        render(<TrackQuotePage />)

        expect(screen.getByRole('heading', { name: 'Localized Track Title' })).toBeInTheDocument()
        expect(screen.getByText(/Localized Description Prefix/i)).toBeInTheDocument()
        expect(screen.getByText('Localized Quote ID')).toBeInTheDocument()
        expect(screen.getByText(/Localized Description Suffix/i)).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Localized Track Placeholder')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Localized Locate/i })).toBeInTheDocument()
    })
})
