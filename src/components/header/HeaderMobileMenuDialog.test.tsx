import { createRef, type HTMLAttributes, type ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import HeaderMobileMenuDialog from '@/components/header/HeaderMobileMenuDialog'

vi.mock('framer-motion', () => ({
    AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
    motion: {
        div: (props: HTMLAttributes<HTMLDivElement>) => <div {...props} />,
    },
}))

vi.mock('@/components/header/MobileMenuHeader', () => ({
    default: () => <div>mobile-menu-header</div>,
}))

vi.mock('@/components/header/MobileMenuUtilityBar', () => ({
    default: () => <div>mobile-menu-utility</div>,
}))

vi.mock('@/components/header/MobilePrimaryCta', () => ({
    default: () => <div>mobile-primary-cta</div>,
}))

vi.mock('@/components/header/MobileNavSection', () => ({
    default: ({ label }: { label: string }) => <div>{label}</div>,
}))

vi.mock('@/components/header/MobileKnowledgeGrid', () => ({
    default: () => <div>mobile-knowledge-grid</div>,
}))

vi.mock('@/components/header/MobileMenuFooter', () => ({
    default: () => <div>mobile-menu-footer</div>,
}))

describe('HeaderMobileMenuDialog', () => {
    const labels = {
        navigationMenu: 'Navigation Menu',
        mobileNavigation: 'Mobile Navigation',
        personalProtection: 'Personal Protection',
        businessSolutions: 'Business Solutions',
        smartToolkit: 'Smart Toolkit',
    }

    it('does not render when closed', () => {
        render(
            <HeaderMobileMenuDialog
                isOpen={false}
                menuRef={createRef<HTMLDivElement>()}
                session={null}
                openCategory="personal"
                onToggleCategory={() => { /* noop */ }}
                onClose={() => { /* noop */ }}
                onSignIn={() => { /* noop */ }}
                labels={labels}
            />,
        )

        expect(screen.queryByRole('dialog')).toBeNull()
    })

    it('renders translated section labels when open', () => {
        render(
            <HeaderMobileMenuDialog
                isOpen
                menuRef={createRef<HTMLDivElement>()}
                session={null}
                openCategory="personal"
                onToggleCategory={() => { /* noop */ }}
                onClose={() => { /* noop */ }}
                onSignIn={() => { /* noop */ }}
                labels={labels}
            />,
        )

        expect(screen.getByRole('dialog', { name: 'Navigation Menu' })).toBeInTheDocument()
        expect(screen.getByText('Personal Protection')).toBeInTheDocument()
        expect(screen.getByText('Business Solutions')).toBeInTheDocument()
        expect(screen.getByText('Smart Toolkit')).toBeInTheDocument()
    })
})
