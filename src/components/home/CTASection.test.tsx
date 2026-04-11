/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { CTASection } from './CTASection'

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => {
        const messages: Record<string, string> = {
            badge: 'Localized CTA Badge',
            titleLine1: 'Localized CTA Title Line 1',
            titleLine2: 'Localized CTA Title Line 2',
            description: 'Localized CTA Description',
            'actions.exploreHiddenFacts': 'Localized Explore Hidden Facts',
            'actions.estimatePremium': 'Localized Estimate Premium',
            footnote: 'Localized CTA Footnote',
        }
        return messages[key] ?? key
    },
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

vi.mock('@/components/premium', () => ({
    RevealOnScroll: ({ children }: { children: ReactNode }) => <>{children}</>,
    Magnetic: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

describe('CTASection', () => {
    it('renders translated CTA copy', () => {
        render(<CTASection />)

        expect(screen.getByText('Localized CTA Badge')).toBeInTheDocument()
        expect(
            screen.getByRole('heading', {
                name: /Localized CTA Title Line 1\s+Localized CTA Title Line 2/i,
            }),
        ).toBeInTheDocument()
        expect(screen.getByText('Localized CTA Description')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /Localized Explore Hidden Facts/i })).toHaveAttribute('href', '/tools/hidden-facts')
        expect(screen.getByRole('link', { name: /Localized Estimate Premium/i })).toHaveAttribute('href', '/tools/calculator')
        expect(screen.getByText('Localized CTA Footnote')).toBeInTheDocument()
    })
})
