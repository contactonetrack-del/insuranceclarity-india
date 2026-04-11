/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import MobileMenuUtilityBar from './MobileMenuUtilityBar'

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => {
        const messages: Record<string, string> = {
            preferences: 'Localized preferences',
            personalize: 'Localized personalize',
            signIn: 'Localized sign in',
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

vi.mock('@/components/ui/ThemeToggle', () => ({
    default: () => <button aria-label="theme toggle">Theme Toggle</button>,
}))

vi.mock('@/components/ui/LanguageToggle', () => ({
    default: () => <button aria-label="language toggle">Language Toggle</button>,
}))

describe('MobileMenuUtilityBar', () => {
    it('renders localized utility labels and sign-in action for anonymous user', () => {
        render(
            <MobileMenuUtilityBar
                session={null}
                onCloseMenu={() => undefined}
                onSignIn={() => undefined}
            />,
        )

        expect(screen.getByText('Localized preferences')).toBeInTheDocument()
        expect(screen.getByText('Localized personalize')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Localized sign in' })).toBeInTheDocument()
    })

    it('renders dashboard avatar link for signed-in user', () => {
        render(
            <MobileMenuUtilityBar
                session={{ user: { name: 'Neha' } }}
                onCloseMenu={() => undefined}
                onSignIn={() => undefined}
            />,
        )

        const dashboardLink = screen.getByRole('link', { name: 'N' })
        expect(dashboardLink).toHaveAttribute('href', '/dashboard')
    })
})
