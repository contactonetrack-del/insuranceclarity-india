'use client'

import Link from 'next/link'
import { useState, useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown, Coffee, User as UserIcon, LogOut, LayoutDashboard } from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'
import LoginModal from '@/components/ui/LoginModal'
import { useSession, signOut } from 'next-auth/react'
import { useGlobalStore } from '@/store/useGlobalStore'
import { insuranceTypes, businessTypes, tools } from '@/config/navigation'

// ─── Accessible Keyboard-navigable dropdown ───────────────────────────────────
interface NavDropdownProps {
    label: string
    id: string
    items: Array<{ href: string; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; color: string }>
    activeDropdown: string | null
    setActiveDropdown: (id: string | null) => void
}

function NavDropdown({ label, id, items, activeDropdown, setActiveDropdown }: NavDropdownProps) {
    const isOpen = activeDropdown === id
    const buttonRef = useRef<HTMLButtonElement>(null)
    const menuRef = useRef<HTMLDivElement>(null)

    const open = () => setActiveDropdown(id)
    const close = () => { setActiveDropdown(null); buttonRef.current?.focus() }
    const toggle = () => isOpen ? close() : open()

    // Keyboard: Escape closes, arrow keys navigate menu items
    const handleButtonKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') { close(); return }
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); return }
        if (e.key === 'ArrowDown') { e.preventDefault(); open(); setTimeout(() => { (menuRef.current?.querySelector('[role="menuitem"]') as HTMLElement)?.focus() }, 50) }
    }

    const handleMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const items = Array.from(menuRef.current?.querySelectorAll('[role="menuitem"]') ?? []) as HTMLElement[]
        const idx = items.indexOf(document.activeElement as HTMLElement)
        if (e.key === 'Escape') { close(); return }
        if (e.key === 'ArrowDown') { e.preventDefault(); items[Math.min(idx + 1, items.length - 1)]?.focus() }
        if (e.key === 'ArrowUp') { e.preventDefault(); if (idx === 0) { close() } else { items[idx - 1]?.focus() } }
        if (e.key === 'Tab') { close() }
    }

    return (
        <div
            className="relative"
            onMouseEnter={open}
            onMouseLeave={close}
        >
            <button
                ref={buttonRef}
                className="nav-link flex items-center gap-1"
                aria-haspopup="menu"
                aria-expanded={isOpen}
                aria-controls={`dropdown-${id}`}
                onClick={toggle}
                onKeyDown={handleButtonKeyDown}
            >
                {label}
                <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                />
            </button>

            {isOpen && (
                <div
                    id={`dropdown-${id}`}
                    className={`absolute top-full start-0 pt-2 ${id === 'personal-insurance' ? 'w-[520px]' : 'w-72'}`}
                    ref={menuRef}
                    role="menu"
                    aria-label={`${label} submenu`}
                    onKeyDown={handleMenuKeyDown}
                >
                    {/* Invisible bridge gap */}
                    <div className="absolute top-0 left-0 w-full h-2" />
                    <div className={`p-3 rounded-xl shadow-xl animate-fade-in-up
                                    bg-white dark:bg-slate-900 border border-default
                                    ${id === 'personal-insurance' ? 'grid grid-cols-2 gap-2' : ''}`}>
                        {items.map((item, index) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                role="menuitem"
                                tabIndex={0}
                                className={`flex items-center gap-3 px-3 py-3 rounded-lg
                                           text-theme-secondary hover:text-accent hover:bg-accent-5
                                           transition-all duration-200 focus:outline-accent`}
                                style={{ animationDelay: `${index * 30}ms` }}
                                onClick={close}
                            >
                                <div className={`w-9 h-9 shrink-0 rounded-lg bg-gradient-to-br ${item.color}
                                                 flex items-center justify-center shadow-sm`} aria-hidden="true">
                                    <item.icon className="w-5 h-5 text-white" strokeWidth={2} />
                                </div>
                                <span className="font-medium text-sm">{item.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── Main Header ──────────────────────────────────────────────────────────────
export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false)
    const { mobileMenuOpen: isMobileMenuOpen, setMobileMenuOpen } = useGlobalStore()
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const { data: session, status } = useSession()

    const userMenuRef = useRef<HTMLDivElement>(null)
    const mobileMenuRef = useRef<HTMLDivElement>(null)
    const mobileMenuBtnRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50)
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Close mobile menu (used by escape key handler and route changes)
    const closeMobileMenu = useCallback(() => {
        setMobileMenuOpen(false)
        mobileMenuBtnRef.current?.focus()
    }, [setMobileMenuOpen])

    // Close on route change (App Router pathname watcher)
    const pathname = usePathname();
    useEffect(() => {
        if (isMobileMenuOpen) {
            closeMobileMenu();
        }
    }, [pathname, isMobileMenuOpen, closeMobileMenu]);

    // Focus trap for mobile menu
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { closeMobileMenu(); return }
            if (e.key !== 'Tab') return

            // The close button is outside the mobileMenuRef (it's in the header flex row)
            // so we query the document for it, or we rely on the button ref.
            // Let's gather focusables from the menu AND the close button.
            const menuFocusables = Array.from(
                mobileMenuRef.current?.querySelectorAll<HTMLElement>('a, button, [tabindex]:not([tabindex="-1"])') || []
            );

            const focusable = mobileMenuBtnRef.current ? [mobileMenuBtnRef.current, ...menuFocusables] : menuFocusables;

            if (focusable.length === 0) return

            const first = focusable[0]
            const last = focusable[focusable.length - 1]

            if (e.shiftKey) {
                if (document.activeElement === first) { e.preventDefault(); last.focus() }
            } else {
                if (document.activeElement === last) { e.preventDefault(); first.focus() }
            }
        }

        if (isMobileMenuOpen) {
            document.addEventListener('keydown', handleKeyDown)
            // focus first item when menu opens
            if (mobileMenuBtnRef.current) {
                mobileMenuBtnRef.current.focus()
            }
        }

        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isMobileMenuOpen, closeMobileMenu])

    // Close user menu on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <>
            <header
                className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 shadow-md`}
                style={{
                    background: isScrolled
                        ? 'rgb(var(--color-card-bg))'
                        : 'rgba(var(--color-card-bg), 0.85)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    borderBottom: '1px solid var(--border-default)',
                }}
            >
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <Link href="/" className="flex items-center group transition-all duration-300 hover:scale-[1.02]">
                            <span className="font-display text-2xl md:text-[28px] font-extrabold tracking-tight text-[#0F172A] dark:text-white flex items-center">
                                Insurance
                                <span className="mx-1.5 text-accent/40 dark:text-accent/60 font-mono text-xl md:text-2xl">//</span>
                                <span className="text-[#4CAF50]">Clarity</span>
                            </span>
                        </Link>

                        {/* Desktop Navigation — keyboard accessible dropdowns */}
                        <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
                            <Link href="/" className="nav-link">Home</Link>

                            <NavDropdown
                                label="Personal Insurance"
                                id="personal-insurance"
                                items={insuranceTypes}
                                activeDropdown={activeDropdown}
                                setActiveDropdown={setActiveDropdown}
                            />
                            <NavDropdown
                                label="Business & Cyber"
                                id="business-insurance"
                                items={businessTypes}
                                activeDropdown={activeDropdown}
                                setActiveDropdown={setActiveDropdown}
                            />
                            <NavDropdown
                                label="Tools"
                                id="tools"
                                items={tools}
                                activeDropdown={activeDropdown}
                                setActiveDropdown={setActiveDropdown}
                            />

                            <Link href="/resources" className="nav-link">Resources</Link>
                            <Link href="/hubs" className="nav-link">Knowledge Hubs</Link>
                            <Link href="/about" className="nav-link">About</Link>
                            <Link href="/cookies" className="nav-link">Cookie Policy</Link>
                        </nav>

                        {/* Right side */}
                        <div className="flex items-center gap-3">
                            <ThemeToggle />

                            {/* Auth / Account — Desktop */}
                            <div className="hidden sm:block relative" ref={userMenuRef}>
                                {status === 'authenticated' ? (
                                    <>
                                        <button
                                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                            className="flex items-center gap-2 px-3 py-2 rounded-xl
                                                 bg-accent/10 hover:bg-accent/20 text-accent
                                                 border border-accent/20 hover:border-accent/40
                                                 transition-all duration-300 font-medium text-sm"
                                            aria-haspopup="true"
                                            aria-expanded={isUserMenuOpen}
                                        >
                                            <div className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-[10px]">
                                                {session.user?.name?.[0] || session.user?.email?.[0]?.toUpperCase()}
                                            </div>
                                            <span>Account</span>
                                            <ChevronDown className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {/* User Dropdown */}
                                        {isUserMenuOpen && (
                                            <div className="absolute top-full right-0 mt-2 w-48 glass-strong rounded-2xl border border-default shadow-xl p-2 animate-fade-in-up">
                                                <Link
                                                    href="/dashboard"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-theme-secondary hover:text-accent hover:bg-accent/5 transition-colors"
                                                >
                                                    <LayoutDashboard className="w-4 h-4" />
                                                    Dashboard
                                                </Link>
                                                <button
                                                    onClick={() => signOut()}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-rose-500 hover:bg-rose-500/5 transition-colors"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    Sign Out
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setIsLoginModalOpen(true)}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl
                                             bg-accent hover:bg-accent-hover text-white
                                             transition-all duration-300 shadow-lg shadow-accent/20 
                                             font-semibold text-sm active:scale-95"
                                    >
                                        <UserIcon className="w-4 h-4" />
                                        Sign In
                                    </button>
                                )}
                            </div>

                            {/* Mobile Menu Button */}
                            <button
                                ref={mobileMenuBtnRef}
                                className="lg:hidden w-11 h-11 flex items-center justify-center glass rounded-xl
                                       hover:border-hover transition-all duration-200"
                                onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                                aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
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

                {/* Mobile Menu — with focus trap */}
                {isMobileMenuOpen && (
                    <div
                        id="mobile-menu"
                        ref={mobileMenuRef}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Navigation menu"
                        className="lg:hidden fixed top-20 left-0 w-full h-[calc(100vh-80px)]
                               glass-strong p-6 overflow-y-auto animate-slide-in"
                    >
                        <Link
                            href="/"
                            className="block py-4 text-lg text-theme-primary border-b border-default"
                            onClick={closeMobileMenu}
                        >
                            Home
                        </Link>

                        <nav aria-label="Mobile navigation">
                            <div className="py-4 border-b border-default">
                                <p className="text-sm text-accent uppercase tracking-wider mb-3 font-medium"
                                    id="mobile-personal-heading">
                                    Personal Insurance
                                </p>
                                <ul aria-labelledby="mobile-personal-heading">
                                    {insuranceTypes.map((item) => (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                className="flex items-center gap-3 py-3 text-theme-secondary hover:text-accent transition-colors"
                                                onClick={closeMobileMenu}
                                            >
                                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.color}
                                                             flex items-center justify-center`} aria-hidden="true">
                                                    <item.icon className="w-4 h-4 text-white" strokeWidth={2} />
                                                </div>
                                                <span>{item.label}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="py-4 border-b border-default">
                                <p className="text-sm text-accent uppercase tracking-wider mb-3 font-medium"
                                    id="mobile-business-heading">
                                    Business & Cyber
                                </p>
                                <ul aria-labelledby="mobile-business-heading">
                                    {businessTypes.map((item) => (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                className="flex items-center gap-3 py-3 text-theme-secondary hover:text-accent transition-colors"
                                                onClick={closeMobileMenu}
                                            >
                                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.color}
                                                             flex items-center justify-center`} aria-hidden="true">
                                                    <item.icon className="w-4 h-4 text-white" strokeWidth={2} />
                                                </div>
                                                <span>{item.label}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="py-4 border-b border-default">
                                <p className="text-sm text-accent uppercase tracking-wider mb-3 font-medium"
                                    id="mobile-tools-heading">
                                    Tools
                                </p>
                                <ul aria-labelledby="mobile-tools-heading">
                                    {tools.map((item) => (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                className="flex items-center gap-3 py-3 text-theme-secondary hover:text-accent transition-colors"
                                                onClick={closeMobileMenu}
                                            >
                                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.color}
                                                             flex items-center justify-center`} aria-hidden="true">
                                                    <item.icon className="w-4 h-4 text-white" strokeWidth={2} />
                                                </div>
                                                <span>{item.label}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </nav>

                        <Link
                            href="/hubs"
                            className="block py-4 text-lg text-theme-primary border-b border-default"
                            onClick={closeMobileMenu}
                        >
                            Knowledge Hubs
                        </Link>
                        <Link
                            href="/resources"
                            className="block py-4 text-lg text-theme-primary border-b border-default"
                            onClick={closeMobileMenu}
                        >
                            Resources
                        </Link>
                        <Link
                            href="/about"
                            className="block py-4 text-lg text-theme-primary border-b border-default"
                            onClick={closeMobileMenu}
                        >
                            About
                        </Link>
                        <Link
                            href="/cookies"
                            className="block py-4 text-lg text-theme-primary border-b border-default"
                            onClick={closeMobileMenu}
                        >
                            Cookie Policy
                        </Link>

                        <div className="mt-6 pt-6 border-t border-default">
                            <a
                                href="https://buymeacoffee.com/insuranceclarity"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-3 w-full py-4 rounded-xl
                                       bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20
                                       active:scale-95 transition-all"
                                aria-label="Support InsuranceClarity on Buy Me a Coffee"
                            >
                                <Coffee className="w-5 h-5" aria-hidden="true" />
                                Support Our Project
                            </a>
                            <p className="text-center text-xs text-theme-muted mt-3">
                                Help us keep insurance transparent & ad-free
                            </p>
                        </div>
                    </div>
                )}
            </header>

            {/* login modal rendered outside of header to avoid stacking context issues */}
            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
            />
        </>
    )
}
