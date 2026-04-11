import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'

const i18nMocks = vi.hoisted(() => {
    const captureException = vi.fn()
    const namespaces: Record<string, Record<string, string>> = {
        common: {
            error: 'Localized Common Error',
            retry: 'Localized Retry',
        },
        errorPage: {
            description: 'Localized Error Description',
            reference: 'Localized Reference',
            goHome: 'Localized Go Home',
        },
        notFoundPage: {
            title: 'Localized Not Found Title',
            description: 'Localized Not Found Description',
            backToHome: 'Localized Back To Home',
            exploreTools: 'Localized Explore Tools',
            popularPages: 'Localized Popular Pages',
            'quickLinks.life.label': 'Localized Life Insurance',
            'quickLinks.life.description': 'Localized Life Description',
            'quickLinks.health.label': 'Localized Health Insurance',
            'quickLinks.health.description': 'Localized Health Description',
            'quickLinks.motor.label': 'Localized Motor Insurance',
            'quickLinks.motor.description': 'Localized Motor Description',
            'quickLinks.hiddenFacts.label': 'Localized Hidden Facts',
            'quickLinks.hiddenFacts.description': 'Localized Hidden Facts Description',
            'quickLinks.calculator.label': 'Localized Premium Calculator',
            'quickLinks.calculator.description': 'Localized Premium Calculator Description',
            'quickLinks.compare.label': 'Localized Compare Policies',
            'quickLinks.compare.description': 'Localized Compare Policies Description',
        },
        'notFoundPage.metadata': {
            title: 'Localized 404 Metadata Title',
            description: 'Localized 404 Metadata Description',
        },
    }

    return {
        captureException,
        translate: (namespace: string, key: string) => namespaces[namespace]?.[key] ?? `${namespace}.${key}`,
    }
})

vi.mock('@sentry/nextjs', () => ({
    captureException: i18nMocks.captureException,
}))

vi.mock('next-intl', () => ({
    useTranslations: (namespace: string) => (key: string) => i18nMocks.translate(namespace, key),
}))

vi.mock('next-intl/server', () => ({
    getTranslations: async (namespace: string) => (key: string) => i18nMocks.translate(namespace, key),
}))

vi.mock('next/link', () => ({
    default: ({ href, children, ...props }: { href: string; children: ReactNode; [key: string]: unknown }) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
}))

import GlobalError from '@/app/error'
import NotFound, { generateMetadata } from '@/app/not-found'

describe('Error pages i18n', () => {
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
        vi.clearAllMocks()
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
        consoleErrorSpy.mockRestore()
    })

    it('renders translated content in error.tsx', () => {
        const reset = vi.fn()
        const error = Object.assign(new Error('boom'), { digest: 'abc-123' })

        render(<GlobalError error={error} reset={reset} />)

        expect(screen.getByRole('heading', { name: 'Localized Common Error' })).toBeInTheDocument()
        expect(screen.getByText('Localized Error Description')).toBeInTheDocument()
        expect(screen.getByText('Localized Reference: abc-123')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Localized Retry' })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Localized Go Home' })).toHaveAttribute('href', '/')

        fireEvent.click(screen.getByRole('button', { name: 'Localized Retry' }))
        expect(reset).toHaveBeenCalledTimes(1)
    })

    it('renders translated content in not-found.tsx and translated metadata', async () => {
        const view = await NotFound()
        render(view)

        expect(screen.getByRole('heading', { name: 'Localized Not Found Title' })).toBeInTheDocument()
        expect(screen.getByText('Localized Not Found Description')).toBeInTheDocument()
        expect(screen.getByText('Localized Popular Pages')).toBeInTheDocument()
        expect(screen.getByText('Localized Life Insurance')).toBeInTheDocument()

        const metadata = await generateMetadata()
        expect(metadata.title).toBe('Localized 404 Metadata Title')
        expect(metadata.description).toBe('Localized 404 Metadata Description')
    })
})
