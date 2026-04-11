/**
 * @vitest-environment jsdom
 */
import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import ProductTour from './ProductTour'

vi.mock('next/navigation', () => ({
    usePathname: () => '/',
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

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string, values?: Record<string, number>) => {
        const messages: Record<string, string> = {
            dialogAria: 'Localized tour dialog',
            skipTour: 'Localized skip tour',
            previousStep: 'Localized previous step',
            back: 'Localized back',
            startScanningFree: 'Localized start scanning',
            nextStep: 'Localized next step',
            next: 'Localized next',
            'steps.upload.title': 'Localized upload title',
            'steps.upload.body': 'Localized upload body',
            'steps.upload.highlight': 'Localized upload highlight',
            'steps.risks.title': 'Localized risks title',
            'steps.risks.body': 'Localized risks body',
            'steps.risks.highlight': 'Localized risks highlight',
            'steps.unlock.title': 'Localized unlock title',
            'steps.unlock.body': 'Localized unlock body',
            'steps.unlock.highlight': 'Localized unlock highlight',
        }

        if (key === 'stepProgress') {
            return `Localized step ${values?.current} of ${values?.total}`
        }

        if (key === 'goToStep') {
            return `Localized go to step ${values?.step}`
        }

        return messages[key] ?? key
    },
}))

describe('ProductTour', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        window.localStorage.clear()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('renders localized first-step content after the delayed auto-open', () => {
        render(<ProductTour />)

        expect(screen.queryByText('Localized upload title')).not.toBeInTheDocument()

        act(() => {
            vi.advanceTimersByTime(700)
        })

        expect(screen.getByRole('dialog', { name: 'Localized tour dialog' })).toBeInTheDocument()
        expect(screen.getByText('Localized upload title')).toBeInTheDocument()
        expect(screen.getByText('Localized upload body')).toBeInTheDocument()
        expect(screen.getByText('Localized upload highlight')).toBeInTheDocument()
        expect(screen.getByLabelText('Localized step 1 of 3')).toBeInTheDocument()
        expect(screen.getAllByRole('button', { name: 'Localized skip tour' })).toHaveLength(2)
    })
})
