/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import AIScannerPage from './page'

vi.mock('@/lib/auth-client', () => ({
    useAuthSession: vi.fn(() => ({ data: null, status: 'unauthenticated' })),
}))

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => {
        const messages: Record<string, string> = {
            'hero.badge': 'Localized Scanner Badge',
            'hero.titlePrefix': 'Localized Reveal',
            'hero.titleHighlight': 'Localized Hidden Exclusions',
            'hero.subtitle': 'Localized scanner subtitle',
            'upload.dropTitle': 'Localized Drop Title',
            'upload.dropDescription': 'Localized Drop Description',
            'upload.ariaLabel': 'Localized Upload Aria',
            'features.subLimits': 'Localized Sub-limits',
            'features.waitingPeriods': 'Localized Waiting Periods',
            'features.redFlags': 'Localized Red Flags',
            'errors.invalidPdf': 'Localized Invalid PDF',
        }

        return messages[key] ?? key
    },
}))

describe('AIScannerPage', () => {
    it('renders localized scanner hero and upload states', () => {
        render(<AIScannerPage />)

        expect(screen.getByText('Localized Scanner Badge')).toBeInTheDocument()
        expect(screen.getByText('Localized Reveal')).toBeInTheDocument()
        expect(screen.getByText('Localized Hidden Exclusions')).toBeInTheDocument()
        expect(screen.getByText('Localized scanner subtitle')).toBeInTheDocument()
        expect(screen.getByText('Localized Drop Title')).toBeInTheDocument()
        expect(screen.getByText('Localized Drop Description')).toBeInTheDocument()
        expect(screen.getByText('Localized Sub-limits')).toBeInTheDocument()
    })

    it('shows localized invalid-file error for non-pdf upload', () => {
        render(<AIScannerPage />)

        const input = screen.getByLabelText('Localized Upload Aria')
        const invalidFile = new File(['oops'], 'not-a-policy.txt', { type: 'text/plain' })
        fireEvent.change(input, { target: { files: [invalidFile] } })

        expect(screen.getByText('Localized Invalid PDF')).toBeInTheDocument()
    })
})
