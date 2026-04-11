/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ComponentType, ReactNode } from 'react'
import AdvisorClient from './advisor-client'

const { mockFindBestMatches } = vi.hoisted(() => ({
    mockFindBestMatches: vi.fn(),
}))

vi.mock('@/services/ai-matcher.service', () => ({
    findBestMatches: mockFindBestMatches,
}))

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string, values?: Record<string, unknown>) => {
        const messages: Record<string, string> = {
            'hero.badge': 'Localized Advisor Badge',
            'hero.titlePrefix': 'Localized Discover Coverage',
            'hero.titleHighlight': 'Localized Guided Matching',
            'hero.subtitle': 'Localized advisor subtitle',
            'search.placeholder': 'Localized query placeholder',
            'search.analyze': 'Localized Analyze',
            'loading.title': 'Localized loading title',
            'loading.description': 'Localized loading description',
            'results.title': 'Localized inference complete',
            'results.bestMatch': 'Localized best match',
            'results.confidence': 'Localized confidence',
            'results.targetRisk': 'Localized target risk:',
            'results.globalCode': 'Localized global code:',
            'results.matchReason': 'Localized match reason:',
            'results.browseDirectory': 'Localized browse directory',
            'empty.title': 'Localized empty title',
            'empty.openDirectory': 'Localized open directory',
            'errors.fetchMatchesLog': 'Localized fetch log',
            'suggestions.one': 'Localized suggestion one',
            'suggestions.two': 'Localized suggestion two',
            'suggestions.three': 'Localized suggestion three',
            'suggestions.four': 'Localized suggestion four',
        }

        if (key === 'results.topForQuery') {
            return `Localized top ${values?.count} for "${values?.query}"`
        }
        if (key === 'empty.description') {
            return `Localized empty description for "${values?.query}"`
        }

        return messages[key] ?? key
    },
}))

vi.mock('@/components/premium', () => ({
    GlassCard: ({ children, className }: { children: ReactNode; className?: string }) => <div className={className}>{children}</div>,
    GradientText: ({ children, className }: { children: ReactNode; className?: string }) => <span className={className}>{children}</span>,
    IconContainer: ({ icon: Icon, className }: { icon: ComponentType<{ className?: string }>; className?: string }) => <Icon className={className} />,
    RevealOnScroll: ({ children }: { children: ReactNode }) => <>{children}</>,
    StaggerContainer: ({ children, className }: { children: ReactNode; className?: string }) => <div className={className}>{children}</div>,
    StaggerItem: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

describe('AdvisorClient', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders localized advisor hero/search copy', () => {
        render(<AdvisorClient />)

        expect(screen.getByText('Localized Advisor Badge')).toBeInTheDocument()
        expect(screen.getByText('Localized Discover Coverage')).toBeInTheDocument()
        expect(screen.getByText('Localized Guided Matching')).toBeInTheDocument()
        expect(screen.getByText('Localized advisor subtitle')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Localized query placeholder')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Localized Analyze/i })).toBeInTheDocument()
    })

    it('renders localized empty state after a no-match search', async () => {
        mockFindBestMatches.mockResolvedValue([])
        render(<AdvisorClient />)

        fireEvent.change(screen.getByPlaceholderText('Localized query placeholder'), {
            target: { value: 'my test risk query' },
        })
        fireEvent.click(screen.getByRole('button', { name: /Localized Analyze/i }))

        await waitFor(() => {
            expect(screen.getByText('Localized empty title')).toBeInTheDocument()
        })

        expect(mockFindBestMatches).toHaveBeenCalledWith('my test risk query', 3)
        expect(screen.getByText('Localized empty description for "my test risk query"')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Localized open directory' })).toHaveAttribute('href', '/insurance/directory')
    })
})
