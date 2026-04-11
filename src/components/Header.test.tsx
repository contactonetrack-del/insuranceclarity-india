/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Header from './Header'

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
}))

vi.mock('next/navigation', () => ({
    usePathname: () => '/',
}))

vi.mock('@/components/ui/ThemeToggle', () => ({
    default: () => <div data-testid="theme-toggle" />,
}))

vi.mock('@/components/ui/LanguageToggle', () => ({
    default: ({ compact = false }: { compact?: boolean }) => (
        <div data-testid={compact ? 'language-toggle-mobile' : 'language-toggle-desktop'} />
    ),
}))

vi.mock('@/components/ui/LoginModal', () => ({
    default: () => null,
}))

vi.mock('@/components/header/DesktopMainNav', () => ({
    default: () => <div data-testid="desktop-main-nav" />,
}))

vi.mock('@/components/header/DesktopAccountMenu', () => ({
    default: () => <div data-testid="desktop-account-menu" />,
}))

vi.mock('@/components/header/DesktopScanCta', () => ({
    default: () => <div data-testid="desktop-scan-cta" />,
}))

vi.mock('@/components/header/HeaderBrand', () => ({
    default: () => <div data-testid="header-brand" />,
}))

vi.mock('@/components/header/HeaderMobileMenuDialog', () => ({
    default: () => <div data-testid="header-mobile-menu-dialog" />,
}))

vi.mock('@/lib/auth-client', () => ({
    useAuthSession: () => ({
        data: null,
        status: 'unauthenticated',
    }),
}))

vi.mock('@/store/useGlobalStore', () => ({
    useGlobalStore: (selector: (state: {
        mobileMenuOpen: boolean
        setMobileMenuOpen: (open: boolean) => void
        toggleMobileMenu: () => void
    }) => unknown) =>
        selector({
            mobileMenuOpen: false,
            setMobileMenuOpen: () => undefined,
            toggleMobileMenu: () => undefined,
        }),
}))

describe('Header', () => {
    it('renders language toggles for desktop and mobile header surfaces', () => {
        render(<Header />)

        expect(screen.getByTestId('language-toggle-desktop')).toBeInTheDocument()
        expect(screen.getByTestId('language-toggle-mobile')).toBeInTheDocument()
    })
})
