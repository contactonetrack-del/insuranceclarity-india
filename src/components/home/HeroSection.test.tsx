/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { HeroSection } from './HeroSection'

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => {
        const messages: Record<string, string> = {
            backgroundAlt: 'Localized Background Alt',
            badge: 'Localized Hero Badge',
            textRollPrefix: 'Localized Text Roll Prefix',
            textRollWords: 'One|Two|Three',
            titleLine1: 'Localized Title Line 1',
            titleLine2: 'Localized Title Line 2',
            subtitle: 'Localized Hero Subtitle',
            'actions.scanPolicy': 'Localized Scan Policy',
            'actions.exploreHiddenFacts': 'Localized Explore Hidden Facts',
            'actions.estimatePremium': 'Localized Estimate Premium',
            notePrefix: 'Localized Note:',
            noteBody: 'Localized note body',
            learnMore: 'Localized Learn More',
            trustAriaLabel: 'Localized Trust Aria',
            'trustIndicators.irdai': 'Localized IRDAI Indicator',
            'trustIndicators.users': 'Localized Users Indicator',
            'trustIndicators.pdfDeleted': 'Localized PDF Indicator',
            'trustIndicators.satisfaction': 'Localized Satisfaction Indicator',
            tickerTitle: 'Localized Ticker Title',
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

vi.mock('@/config/home-data', () => ({
    partnerLogos: [
        { name: 'Carrier One', url: '/carrier-one.svg', w: 120, h: 40 },
    ],
}))

vi.mock('@/components/premium', () => ({
    RevealOnScroll: ({ children }: { children: ReactNode }) => <>{children}</>,
    ParallaxSection: ({ children }: { children: ReactNode }) => <>{children}</>,
    FloatingElement: ({ children }: { children: ReactNode }) => <>{children}</>,
    AnimatedBlob: () => <div data-testid="animated-blob" />,
    TextRoll: ({ words }: { words: string[] }) => <span>{words.join(', ')}</span>,
    AnimatedHeading: ({ text }: { text: string }) => <span>{text}</span>,
    Magnetic: ({ children }: { children: ReactNode }) => <>{children}</>,
    InfiniteSlider: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

describe('HeroSection', () => {
    it('renders translated hero copy and actions', () => {
        render(<HeroSection />)

        expect(screen.getByText('Localized Hero Badge')).toBeInTheDocument()
        expect(
            screen.getByRole('heading', {
                name: /Localized Title Line 1\s*Localized Title Line 2/i,
            }),
        ).toBeInTheDocument()
        expect(screen.getByText('Localized Hero Subtitle')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /Localized Scan Policy/i })).toHaveAttribute('href', '/scan')
        expect(screen.getByRole('link', { name: /Localized Explore Hidden Facts/i })).toHaveAttribute('href', '/tools/hidden-facts')
        expect(screen.getByRole('link', { name: /Localized Estimate Premium/i })).toHaveAttribute('href', '/tools/calculator')
        expect(screen.getByText('Localized Ticker Title')).toBeInTheDocument()
    })
})
