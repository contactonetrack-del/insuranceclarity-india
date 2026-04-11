/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { ToolsSection } from './ToolsSection'

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => {
        const messages: Record<string, string> = {
            badge: 'Localized Tools Badge',
            title: 'Localized Tools Title',
            description: 'Localized Tools Description',
            exploreAction: 'Localized Explore Action',
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
    GlassCard: ({ children }: { children: ReactNode }) => <>{children}</>,
    IconContainer: () => null,
}))

vi.mock('@/lib/theme/tone', () => ({
    resolveToneSurfaceClass: () => 'tone-class',
}))

vi.mock('@/config/home-data', () => ({
    tools: [
        {
            href: '/tools/sample-tool',
            stat: '42%',
            statLabel: 'sample stat',
            title: 'Sample Tool',
            badge: 'Popular',
            desc: 'Sample tool description',
            tone: 'brand',
            surface: 'gradient',
            icon: () => null,
        },
    ],
}))

describe('ToolsSection', () => {
    it('renders translated section copy while preserving tool content', () => {
        render(<ToolsSection />)

        expect(screen.getByText('Localized Tools Badge')).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Localized Tools Title' })).toBeInTheDocument()
        expect(screen.getByText('Localized Tools Description')).toBeInTheDocument()
        expect(screen.getByText('Sample Tool')).toBeInTheDocument()
        expect(screen.getByText('Localized Explore Action')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /Sample Tool/i })).toHaveAttribute('href', '/tools/sample-tool')
    })
})

