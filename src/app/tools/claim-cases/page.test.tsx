/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'

const { mockFindRecent } = vi.hoisted(() => ({
    mockFindRecent: vi.fn(),
}))

vi.mock('next-intl/server', () => ({
    getTranslations: vi.fn(async () => {
        const messages: Record<string, string> = {
            badge: 'Localized Claim Cases Badge',
            title: 'Localized Claim Cases Title',
            subtitle: 'Localized Claim Cases Subtitle',
            emptyTitleFallback: 'Localized Fallback Empty Title',
            emptyTitleNoCases: 'Localized Empty Title',
            emptyDescriptionFallback: 'Localized Fallback Empty Description',
            emptyDescriptionNoCases: 'Localized Empty Description',
            approved: 'Localized Approved',
            rejected: 'Localized Rejected',
            partial: 'Localized Partial',
            claimAmount: 'Localized Claim Amount:',
            lesson: 'Localized Lesson:',
            viewHiddenFacts: 'Localized View Hidden Facts',
        }

        return (key: string) => messages[key] ?? key
    }),
}))

vi.mock('@/repositories/claim.repository', () => ({
    claimRepository: {
        findRecent: mockFindRecent,
    },
}))

vi.mock('@/components/ui/Breadcrumbs', () => ({
    default: () => <nav data-testid="breadcrumbs" />,
}))

describe('ClaimCasesPage', () => {
    it('renders localized copy from i18n keys', async () => {
        mockFindRecent.mockResolvedValue([])
        const { default: ClaimCasesPage } = await import('./page')

        const page = (await ClaimCasesPage()) as ReactElement
        render(page)

        expect(screen.getByText('Localized Claim Cases Badge')).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Localized Claim Cases Title' })).toBeInTheDocument()
        expect(screen.getByText('Localized Claim Cases Subtitle')).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Localized Empty Title' })).toBeInTheDocument()
        expect(screen.getByText('Localized Empty Description')).toBeInTheDocument()
    }, 15000)
})
