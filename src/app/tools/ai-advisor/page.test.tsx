/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import AiAdvisorPage from './page'

const { getTranslationsMock, suspendedPromise } = vi.hoisted(() => ({
    getTranslationsMock: vi.fn(async () => (key: string) => {
        const messages: Record<string, string> = {
            loadingTitle: 'Localized Advisor Loading Title',
            loadingSubtitle: 'Localized Advisor Loading Subtitle',
        }

        return messages[key] ?? key
    }),
    suspendedPromise: new Promise<never>(() => undefined),
}))

vi.mock('next-intl/server', () => ({
    getTranslations: getTranslationsMock,
}))

vi.mock('next/dynamic', () => ({
    default: () => {
        const SuspendedAdvisorClient = () => {
            throw suspendedPromise
        }
        return SuspendedAdvisorClient
    },
}))

describe('AiAdvisorPage', () => {
    it('renders translated fallback while advisor client is loading', async () => {
        const page = await AiAdvisorPage()
        render(page)

        expect(screen.getByRole('heading', { name: 'Localized Advisor Loading Title' })).toBeInTheDocument()
        expect(screen.getByText('Localized Advisor Loading Subtitle')).toBeInTheDocument()
        expect(getTranslationsMock).toHaveBeenCalledWith('tools.aiAdvisorPage')
    })
})
