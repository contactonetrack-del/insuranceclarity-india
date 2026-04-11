/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'

vi.mock('next-intl/server', () => ({
    getTranslations: vi.fn(async (namespace: string) => {
        const messages: Record<string, string> = {
            'tools.interactiveQuotePage.badge': 'Localized Next-Generation Quoting',
            'tools.interactiveQuotePage.hero.titleLine1': 'Localized Ditch the Forms.',
            'tools.interactiveQuotePage.hero.titleGradient': 'Localized Talk to an Assistant.',
            'tools.interactiveQuotePage.hero.descriptionPrefix': 'Localized assistant description ',
            'tools.interactiveQuotePage.hero.descriptionHighlight': '85%',
            'tools.interactiveQuotePage.hero.descriptionSuffix': ' localization.',
            'tools.interactiveQuotePage.benefits.dynamicQuestioning': 'Localized Dynamic Questioning Matrix',
            'tools.interactiveQuotePage.benefits.serverActions': 'Localized Server Actions',
            'tools.interactiveQuotePage.benefits.pdfGeneration': 'Localized PDF Generation',
            'tools.interactiveQuotePage.metadata.title': 'Localized Interactive Quote Wizard',
            'tools.interactiveQuotePage.metadata.description': 'Localized interactive quote description',
        }

        return (key: string) => messages[`${namespace}.${key}`] ?? `${namespace}.${key}`
    }),
}))

vi.mock('@/components/ui/AiChatWizard', () => ({
    default: () => <div data-testid="ai-chat-wizard" />,
}))

vi.mock('@/components/ui/Breadcrumbs', () => ({
    default: () => <nav data-testid="breadcrumbs" />,
}))

describe('InteractiveQuotePage', () => {
    it('renders localized hero and benefit copy', async () => {
        const { default: InteractiveQuotePage } = await import('./page')
        const page = (await InteractiveQuotePage()) as ReactElement

        render(page)

        expect(screen.getByText('Localized Next-Generation Quoting')).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: /Localized Ditch the Forms\./i })).toBeInTheDocument()
        expect(screen.getByText('Localized Talk to an Assistant.')).toBeInTheDocument()
        expect(screen.getByText('Localized Dynamic Questioning Matrix')).toBeInTheDocument()
        expect(screen.getByText('Localized Server Actions')).toBeInTheDocument()
        expect(screen.getByText('Localized PDF Generation')).toBeInTheDocument()
    })

    it('returns localized metadata', async () => {
        const { generateMetadata } = await import('./page')
        const metadata = await generateMetadata()

        expect(metadata).toMatchObject({
            title: 'Localized Interactive Quote Wizard',
            description: 'Localized interactive quote description',
        })
    })
})
