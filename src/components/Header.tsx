'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import ThemeToggle from '@/components/ui/ThemeToggle'
import LanguageToggle from '@/components/ui/LanguageToggle'
import LoginModal from '@/components/ui/LoginModal'
import DesktopMainNav from '@/components/header/DesktopMainNav'
import DesktopAccountMenu from '@/components/header/DesktopAccountMenu'
import DesktopScanCta from '@/components/header/DesktopScanCta'
import HeaderBrand from '@/components/header/HeaderBrand'
import HeaderMobileMenuDialog from '@/components/header/HeaderMobileMenuDialog'
import { useAuthSession } from '@/lib/auth-client'
import { useGlobalStore } from '@/store/useGlobalStore'

export default function Header() {
    const t = useTranslations('auditI18n.header')
    const [isScrolled, setIsScrolled] = useState(false)
    const isMobileMenuOpen = useGlobalStore((state) => state.mobileMenuOpen)
    const setMobileMenuOpen = useGlobalStore((state) => state.setMobileMenuOpen)
    const toggleMobileMenu = useGlobalStore((state) => state.toggleMobileMenu)
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const [openCategory, setOpenCategory] = useState<string | null>('personal')
    const { data: session, status } = useAuthSession()
    const pathname = usePathname()

    const userMenuRef = useRef<HTMLDivElement>(null)
    const mobileMenuRef = useRef<HTMLDivElement>(null)
    const mobileMenuBtnRef = useRef<HTMLButtonElement>(null)
    const prevPathRef = useRef(pathname)

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10)
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const closeMobileMenu = useCallback(() => {
        setMobileMenuOpen(false)
        mobileMenuBtnRef.current?.focus()
    }, [setMobileMenuOpen])

    const toggleCategory = useCallback((category: string) => {
        setOpenCategory((current) => (current === category ? null : category))
    }, [])

    useEffect(() => {
        if (pathname !== prevPathRef.current) {
            closeMobileMenu()
            prevPathRef.current = pathname
        }
    }, [pathname, closeMobileMenu])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isMobileMenuOpen) return

            if (e.key === 'Escape') {
                closeMobileMenu()
                return
            }
            if (e.key !== 'Tab') return

            const menuFocusables = Array.from(
                mobileMenuRef.current?.querySelectorAll<HTMLElement>(
                    'a, button, [tabindex]:not([tabindex="-1"])',
                ) || [],
            )
            const focusable = mobileMenuBtnRef.current
                ? [mobileMenuBtnRef.current, ...menuFocusables]
                : menuFocusables

            if (focusable.length === 0) return

            const first = focusable[0]
            const last = focusable[focusable.length - 1]

            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault()
                    last.focus()
                }
                return
            }

            if (document.activeElement === last) {
                e.preventDefault()
                first.focus()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isMobileMenuOpen, closeMobileMenu])

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden'
            return () => {
                document.body.style.overflow = 'unset'
            }
        }
    }, [isMobileMenuOpen])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                userMenuRef.current &&
                !userMenuRef.current.contains(event.target as Node)
            ) {
                setIsUserMenuOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <>
            <header
                className={`fixed top-0 left-0 w-full z-50 transition-all duration-500
                    ${(isScrolled || isMobileMenuOpen)
                    ? 'bg-card-bg/95 border-default/50 shadow-lg backdrop-blur-xl'
                    : 'bg-card-bg/60 backdrop-blur-2xl border-transparent shadow-none'}
                    ${isScrolled ? 'border-b border-default/50' : ''}`}
            >
                <div className="max-w-7xl mx-auto px-6 xl:px-8">
                    <div className="flex items-center justify-between h-20 md:h-[88px]">
                        <HeaderBrand />

                        <DesktopMainNav
                            activeDropdown={activeDropdown}
                            setActiveDropdown={setActiveDropdown}
                        />

                        <div className="flex items-center gap-3 xl:gap-4 pl-4 ml-auto xl:ml-0">
                            <div className="hidden md:flex items-center gap-2">
                                <LanguageToggle />
                                <ThemeToggle />
                            </div>

                            <div className="md:hidden">
                                <LanguageToggle compact />
                            </div>

                            <DesktopScanCta />

                            <DesktopAccountMenu
                                status={status}
                                session={session}
                                isUserMenuOpen={isUserMenuOpen}
                                setIsUserMenuOpen={setIsUserMenuOpen}
                                setIsLoginModalOpen={setIsLoginModalOpen}
                                userMenuRef={userMenuRef}
                            />

                            <button
                                ref={mobileMenuBtnRef}
                                type="button"
                                className="interactive-focus xl:hidden w-11 h-11 flex items-center justify-center glass rounded-xl
                                hover:border-hover transition-all duration-200"
                                onClick={toggleMobileMenu}
                                aria-label={isMobileMenuOpen ? t('closeNavigationMenu') : t('openNavigationMenu')}
                                aria-expanded={isMobileMenuOpen}
                                aria-controls="mobile-menu"
                            >
                                {isMobileMenuOpen ? (
                                    <X className="w-6 h-6 text-theme-primary" aria-hidden="true" />
                                ) : (
                                    <Menu className="w-6 h-6 text-theme-primary" aria-hidden="true" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <HeaderMobileMenuDialog
                    isOpen={isMobileMenuOpen}
                    menuRef={mobileMenuRef}
                    session={session}
                    openCategory={openCategory}
                    onToggleCategory={toggleCategory}
                    onClose={closeMobileMenu}
                    onSignIn={() => {
                        closeMobileMenu()
                        setIsLoginModalOpen(true)
                    }}
                    labels={{
                        navigationMenu: t('navigationMenu'),
                        mobileNavigation: t('mobileNavigation'),
                        personalProtection: t('personalProtection'),
                        businessSolutions: t('businessSolutions'),
                        smartToolkit: t('smartToolkit'),
                    }}
                />
            </header>

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
            />
        </>
    )
}
