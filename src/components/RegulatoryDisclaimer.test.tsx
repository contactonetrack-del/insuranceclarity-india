/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import RegulatoryDisclaimer from './RegulatoryDisclaimer'

const messages: Record<string, string> = {
    'body': 'Localized body text',
    'compact.label': 'Localized Legal Disclaimer:',
    'compact.body': 'Localized compact body',
    'prominent.title': 'Localized Important Notice',
    'prominent.weDoNotLabel': 'Localized we do not:',
    'prominent.weDoNotItems': 'Localized disallowed items',
    'prominent.complaintsLabel': 'Localized complaints:',
    'prominent.complaintsPortal': 'Localized portal',
    'prominent.irdaiWebsite': 'localized-site.example',
    'prominent.complaintsEmail': 'localized@example.com',
    'prominent.complaintsPhones': '12345',
}

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => messages[key] ?? key,
}))

describe('RegulatoryDisclaimer', () => {
    it('renders compact variant using translated strings', () => {
        render(<RegulatoryDisclaimer />)

        expect(screen.getByText('Localized Legal Disclaimer:')).toBeInTheDocument()
        expect(screen.getByText('Localized compact body')).toBeInTheDocument()
    })

    it('renders prominent variant using translated strings', () => {
        render(<RegulatoryDisclaimer variant="prominent" />)

        expect(screen.getByText('Localized Important Notice')).toBeInTheDocument()
        expect(screen.getByText('Localized body text')).toBeInTheDocument()
        expect(screen.getByText(/Localized we do not:/)).toBeInTheDocument()
        expect(screen.getByText(/Localized complaints:/)).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Localized portal' })).toHaveAttribute('href', 'https://bimabharosa.irdai.gov.in')
    })
})
