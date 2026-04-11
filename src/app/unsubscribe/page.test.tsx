/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import UnsubscribePage from './page'

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => {
        const messages: Record<string, string> = {
            title: 'Localized Unsubscribe Title',
            description: 'Localized unsubscribe description.',
            'fields.emailLabel': 'Localized Email Label',
            'fields.emailPlaceholder': 'localized@example.com',
            'fields.reasonLabel': 'Localized Reason Label',
            'fields.reasonPlaceholder': 'Localized Reason Placeholder',
            'actions.submitting': 'Localized Submitting',
            'actions.unsubscribe': 'Localized Unsubscribe',
            'status.securityTokenMissing': 'Localized Missing Token',
            'status.unsubscribeFailed': 'Localized Unsubscribe Failed',
            'status.unsubscribed': 'Localized Unsubscribed',
        }

        return messages[key] ?? key
    },
}))

vi.mock('next/navigation', () => ({
    useSearchParams: () => ({
        get: (key: string) => (key === 'email' ? 'prefilled@example.com' : null),
    }),
}))

describe('UnsubscribePage', () => {
    it('renders translated labels and prefilled email', () => {
        render(<UnsubscribePage />)

        expect(screen.getByRole('heading', { name: 'Localized Unsubscribe Title' })).toBeInTheDocument()
        expect(screen.getByText('Localized unsubscribe description.')).toBeInTheDocument()
        expect(screen.getByLabelText('Localized Email Label')).toHaveValue('prefilled@example.com')
        expect(screen.getByLabelText('Localized Reason Label')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Localized Unsubscribe' })).toBeInTheDocument()
    })
})
