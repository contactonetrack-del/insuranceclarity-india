/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { CategoriesSection } from './CategoriesSection'

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => {
        const messages: Record<string, string> = {
            'insurance.badge': 'Localized Insurance Badge',
            'insurance.title': 'Localized Insurance Title',
            'insurance.description': 'Localized Insurance Description',
            'business.badge': 'Localized Business Badge',
            'business.title': 'Localized Business Title',
            'business.description': 'Localized Business Description',
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
    StaggerContainer: ({ children }: { children: ReactNode }) => <>{children}</>,
    StaggerItem: ({ children }: { children: ReactNode }) => <>{children}</>,
    TiltCard: ({ children }: { children: ReactNode }) => <>{children}</>,
    GlassCard: ({ children }: { children: ReactNode }) => <>{children}</>,
    IconContainer: () => null,
}))

vi.mock('@/config/home-data', () => ({
    insuranceCategories: [
        {
            href: '/insurance/life',
            title: 'Life Insurance',
            desc: 'Life category description',
            icon: () => null,
            tone: 'brand',
            surface: 'gradient',
        },
    ],
    businessCategories: [
        {
            href: '/insurance/liability',
            title: 'Liability Insurance',
            desc: 'Business category description',
            icon: () => null,
            tone: 'neutral',
            surface: 'soft',
        },
    ],
}))

describe('CategoriesSection', () => {
    it('renders translated section shells while preserving category cards', () => {
        render(<CategoriesSection />)

        expect(screen.getByText('Localized Insurance Badge')).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Localized Insurance Title' })).toBeInTheDocument()
        expect(screen.getByText('Localized Insurance Description')).toBeInTheDocument()
        expect(screen.getByText('Localized Business Badge')).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Localized Business Title' })).toBeInTheDocument()
        expect(screen.getByText('Localized Business Description')).toBeInTheDocument()
        expect(screen.getByText('Life Insurance')).toBeInTheDocument()
        expect(screen.getByText('Liability Insurance')).toBeInTheDocument()
    })
})

