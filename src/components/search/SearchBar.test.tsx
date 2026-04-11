/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { ReactNode } from 'react'
import { SearchBar } from './SearchBar'

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string, values?: Record<string, string>) => {
        const messages: Record<string, string> = {
            placeholder: 'Localized Search Placeholder',
            popularPages: 'Localized Popular Pages',
            noResults: `Localized No Results ${values?.query ?? ''}`.trim(),
            'aria.searchInput': 'Localized Search Input',
            'aria.clearSearch': 'Localized Clear Search',
            'aria.searchSuggestions': 'Localized Search Suggestions',
            'typeLabels.insurance': 'Localized Insurance',
            'typeLabels.tool': 'Localized Tool',
            'typeLabels.fact': 'Localized Hidden Fact',
            'typeLabels.claim': 'Localized Claim Case',
            'quickLinks.hiddenFacts.title': 'Localized Hidden Facts',
            'quickLinks.hiddenFacts.description': 'Localized Hidden Facts Description',
            'quickLinks.premiumCalculator.title': 'Localized Premium Calculator',
            'quickLinks.premiumCalculator.description': 'Localized Premium Calculator Description',
            'quickLinks.healthInsurance.title': 'Localized Health Insurance',
            'quickLinks.healthInsurance.description': 'Localized Health Insurance Description',
            'quickLinks.termLifeInsurance.title': 'Localized Term Life',
            'quickLinks.termLifeInsurance.description': 'Localized Term Life Description',
            'quickLinks.policyComparison.title': 'Localized Policy Comparison',
            'quickLinks.policyComparison.description': 'Localized Policy Comparison Description',
            'quickLinks.motorInsurance.title': 'Localized Motor Insurance',
            'quickLinks.motorInsurance.description': 'Localized Motor Insurance Description',
        }
        return messages[key] ?? key
    },
}))

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn() }),
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

describe('SearchBar', () => {
    it('renders translated shell and popular quick links', () => {
        render(<SearchBar />)

        const input = screen.getByRole('combobox', { name: 'Localized Search Input' })
        expect(input).toHaveAttribute('placeholder', 'Localized Search Placeholder')

        fireEvent.focus(input)

        expect(screen.getByText('Localized Popular Pages')).toBeInTheDocument()
        expect(screen.getByText('Localized Hidden Facts')).toBeInTheDocument()
        expect(screen.getByText('Localized Hidden Facts Description')).toBeInTheDocument()
        expect(screen.getAllByText('Localized Tool').length).toBeGreaterThan(0)
    })
})
