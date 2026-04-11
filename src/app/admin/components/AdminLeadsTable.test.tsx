/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AdminLeadsTable } from './AdminLeadsTable'

vi.mock('next-intl', () => ({
    useLocale: () => 'en-IN',
    useTranslations: () => (key: string, values?: Record<string, string>) => {
        const messages: Record<string, string> = {
            title: 'Localized Lead Management',
            exportCsv: 'Localized Export CSV',
            'headers.name': 'Localized Name',
            'headers.contactInfo': 'Localized Contact',
            'headers.policyType': 'Localized Policy',
            'headers.source': 'Localized Source',
            'headers.acquired': 'Localized Acquired',
            'headers.status': 'Localized Status',
            empty: 'Localized Empty Leads',
            statusAria: `Localized status for ${values?.name ?? ''}`,
        }

        return messages[key] ?? key
    },
}))

vi.mock('@/app/actions/admin-actions', () => ({
    updateLeadStatus: vi.fn(async () => ({})),
}))

describe('AdminLeadsTable', () => {
    it('renders translated labels for empty state', () => {
        render(<AdminLeadsTable leads={[]} onStatusChange={() => { }} />)

        expect(screen.getByText('Localized Lead Management')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /Localized Export CSV/i })).toBeInTheDocument()
        expect(screen.getByText('Localized Name')).toBeInTheDocument()
        expect(screen.getByText('Localized Contact')).toBeInTheDocument()
        expect(screen.getByText('Localized Policy')).toBeInTheDocument()
        expect(screen.getByText('Localized Source')).toBeInTheDocument()
        expect(screen.getByText('Localized Acquired')).toBeInTheDocument()
        expect(screen.getByText('Localized Status')).toBeInTheDocument()
        expect(screen.getByText('Localized Empty Leads')).toBeInTheDocument()
    })
})
