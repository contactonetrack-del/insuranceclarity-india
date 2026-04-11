/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import ClaimSearchPage from './page'

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => {
        const messages: Record<string, string> = {
            'hero.badge': 'Localized Search Badge',
            'hero.titlePrefix': 'Localized Title Prefix',
            'hero.titleHighlight': 'Localized Highlight',
            'hero.titleSuffix': 'Localized Title Suffix',
            'hero.subtitle': 'Localized Search Subtitle',
            'search.placeholder': 'Localized Search Placeholder',
            'search.action': 'Localized AI Search',
            'categories.all': 'Localized All',
            'categories.health': 'Localized Health',
            'categories.life': 'Localized Life',
            'categories.motor': 'Localized Motor',
            'status.approved': 'Localized Approved',
            'status.partial': 'Localized Partial',
            'status.rejected': 'Localized Rejected',
            'status.verdictSuffix': 'Localized Verdict',
            'empty.title': 'Localized Empty Title',
            'empty.description': 'Localized Empty Description',
            'result.issueTitle': 'Localized Issue',
            'result.outcomeTitle': 'Localized Outcome',
            'result.lessonTitle': 'Localized Lesson',
            'faq.title': 'Localized FAQ',
            'faq.items.ombudsman.q': 'Localized Ombudsman Q',
            'faq.items.ombudsman.a': 'Localized Ombudsman A',
            'faq.items.rejectedVsRepudiated.q': 'Localized Rejected Q',
            'faq.items.rejectedVsRepudiated.a': 'Localized Rejected A',
            'faq.items.appealAfterTwoYears.q': 'Localized Appeal Q',
            'faq.items.appealAfterTwoYears.a': 'Localized Appeal A',
            'cta.badge': 'Localized CTA Badge',
            'cta.title': 'Localized CTA Title',
            'cta.action': 'Localized CTA Action',
        }

        return messages[key] ?? key
    },
}))

describe('ClaimSearchPage', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn(async () => ({
            json: async () => [],
        })))
    })

    it('renders localized search-page UI text', async () => {
        render(<ClaimSearchPage />)

        expect(screen.getByText('Localized Search Badge')).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: /Localized Title Prefix/i })).toBeInTheDocument()
        expect(screen.getByText('Localized Search Subtitle')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Localized Search Placeholder')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Localized All' })).toBeInTheDocument()

        await waitFor(() => {
            expect(screen.getByText('Localized Empty Title')).toBeInTheDocument()
        })
    })
})
