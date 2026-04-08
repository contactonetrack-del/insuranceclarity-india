'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown, Coffee, User as UserIcon, LogOut, LayoutDashboard, Sparkles } from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'
import LoginModal from '@/components/ui/LoginModal'
import { useAuthSession, signOut } from '@/lib/auth-client'
import { useGlobalStore } from '@/store/useGlobalStore'
import { insuranceTypes, businessTypes, tools, knowledgeCenter } from '@/config/navigation'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Accessible Keyboard-navigable dropdown ───────────────────────────────────
interface NavDropdownProps {
    label: string
    id: string
    items: Array<{ href: string; label: string; description: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; color: string }>
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
            className="relative h-full flex items-center shrink-0"
            onMouseEnter={open}
            onMouseLeave={close}
        >
            <button
                ref={buttonRef}
                className={`flex items-center gap-1.5 text-sm transition-colors duration-200 group relative py-2 whitespace-nowrap
                           ${isOpen ? 'text-accent font-semibold' : 'text-slate-700 hover:text-accent dark:text-slate-200 dark:hover:text-accent font-medium'}`}
                aria-haspopup="menu"
                aria-expanded={isOpen}
                aria-controls={`dropdown-${id}`}
                onClick={toggle}
                onKeyDown={handleButtonKeyDown}
            >
                {label}
                <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-accent' : 'text-slate-400 dark:text-slate-400 group-hover:text-accent'}`}
                    aria-hidden="true"
                />
                {/* Premium Hover Underline */}
                <span className={`absolute bottom-0 left-0 h-0.5 bg-accent transition-all duration-300 rounded-full
                                 ${isOpen ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-100'}`} />
            </button>

            {isOpen && (
                <div
                    id={`dropdown-${id}`}
                    className={`absolute top-[calc(100%+0.5rem)] start-1/2 -translate-x-1/2 z-50`}
                    ref={menuRef}
                    role="menu"
                    aria-label={`${label} submenu`}
                    onKeyDown={handleMenuKeyDown}
                >
                    {/* Invisible bridge gap */}
                    <div className="absolute -top-4 left-0 w-full h-4" />

                    <div className={`p-4 rounded-2xl shadow-2xl animate-fade-in-up bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800
                                    ${id === 'personal-insurance' ? 'w-[640px] grid grid-cols-2 gap-x-4 gap-y-2' :
                            id === 'business-insurance' ? 'w-[560px] grid grid-cols-2 gap-x-4 gap-y-2' : 'w-80 grid gap-y-2'}`}>
                        {items.map((item, index) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                role="menuitem"
                                tabIndex={0}
                                className="group flex flex-row items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 focus:outline-accent"
                                style={{ animationDelay: `${index * 20}ms` }}
                                onClick={close}
                            >
                                <div className={`w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br ${item.color}
                                                 flex items-center justify-center shadow-md shadow-slate-200/50 dark:shadow-none
                                                 group-hover:scale-105 transition-transform duration-300`} aria-hidden="true">
                                    <item.icon className="w-5 h-5 text-white" strokeWidth={2} />
                                </div>
                                <div className="flex-1">
                                    <span className="block font-semibold text-sm text-slate-900 dark:text-slate-100 group-hover:text-accent transition-colors">{item.label}</span>
                                    <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 opacity-80">{item.description}</span>
                                </div>
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
    const isMobileMenuOpen = useGlobalStore((state) => state.mobileMenuOpen);
    const setMobileMenuOpen = useGlobalStore((state) => state.setMobileMenuOpen);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const { data: session, status } = useAuthSession()
    const pathname = usePathname()

    const userMenuRef = useRef<HTMLDivElement>(null)
    const mobileMenuRef = useRef<HTMLDivElement>(null)
    const mobileMenuBtnRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10)
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Close mobile menu (used by escape key handler and route changes)
    const closeMobileMenu = useCallback(() => {
        setMobileMenuOpen(false)
        mobileMenuBtnRef.current?.focus()
    }, [setMobileMenuOpen])

    // Track path changes with a ref to avoid logic loops
    const prevPathRef = useRef(pathname)

    // Accordion state for mobile menu
    const [openCategory, setOpenCategory] = useState<string | null>('personal')

    const toggleCategory = (cat: string) => {
        setOpenCategory(openCategory === cat ? null : cat)
    }

    // Close on route change - only if the path actually changed
    useEffect(() => {
        if (pathname !== prevPathRef.current) {
            closeMobileMenu();
            prevPathRef.current = pathname;
        }
    }, [pathname, closeMobileMenu]);

    // Focus trap for mobile menu
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { closeMobileMenu(); return }
            if (e.key !== 'Tab') return

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

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isMobileMenuOpen, closeMobileMenu])
    
    // Body scroll lock when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = 'unset'; };
        }
    }, [isMobileMenuOpen]);

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
                className={`fixed top-0 left-0 w-full z-50 transition-all duration-500
                         ${(isScrolled || isMobileMenuOpen) 
                            ? 'bg-card-bg/95 border-default/50 shadow-lg backdrop-blur-xl' 
                            : 'bg-card-bg/60 backdrop-blur-2xl border-transparent shadow-none'}
                         ${isScrolled ? 'border-b border-default/50' : ''}`}
            >
                <div className="max-w-7xl mx-auto px-6 xl:px-8">
                    <div className="flex items-center justify-between h-20 md:h-[88px]">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 pr-8 group transition-transform duration-300 hover:scale-[1.02] shrink-0">
                            <div className="relative flex items-center justify-center shrink-0">
                                <Image
                                    src="/logo.png"
                                    alt="InsuranceClarity Logo"
                                    width={108}
                                    height={108}
                                    className="object-contain w-auto h-16 md:h-[108px] drop-shadow-md shrink-0"
                                    priority
                                />
                            </div>
                            <span className="font-display font-bold text-2xl text-theme-primary -ml-5 tracking-tight">
                                Insurance<span className="text-gradient"> Clarity</span>
                            </span>
                        </Link>

                        {/* Desktop Navigation — keyboard accessible dropdowns */}
                        <nav className="hidden xl:flex items-center h-full gap-x-4 2xl:gap-x-8" aria-label="Main navigation">

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
                            <NavDropdown
                                label="Knowledge Center"
                                id="knowledge-center"
                                items={knowledgeCenter}
                                activeDropdown={activeDropdown}
                                setActiveDropdown={setActiveDropdown}
                            />
                        </nav>

                        {/* Right side Actions */}
                        <div className="flex items-center gap-3 xl:gap-4 pl-4 ml-auto xl:ml-0">

                            <div className="hidden md:block">
                                <ThemeToggle />
                            </div>

                            {/* Secondary CTA: Scan Policy */}
                            <Link
                                href="/scan"
                                className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap shrink-0
                                         bg-accent hover:bg-emerald-700 text-white
                                         transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-accent/20
                                         active:scale-95 hover:-translate-y-0.5"
                            >
                                <Sparkles className="w-4 h-4" />
                                Scan Policy
                            </Link>

                            {/* Auth / Account — Desktop */}
                            <div className="hidden sm:block relative" ref={userMenuRef}>
                                {status === 'authenticated' ? (
                                    <>
                                        <button
                                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl
                                                 bg-accent/10 hover:bg-accent/20 text-accent
                                                 border border-accent/20 hover:border-accent/40
                                                 transition-all duration-300 font-semibold text-sm whitespace-nowrap shrink-0"
                                            aria-haspopup="true"
                                            aria-expanded={isUserMenuOpen}
                                        >
                                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent to-emerald-700 text-white flex items-center justify-center text-[11px] shadow-sm">
                                                {session.user?.name?.[0] || session.user?.email?.[0]?.toUpperCase()}
                                            </div>
                                            <span>Account</span>
                                            <ChevronDown className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {/* User Dropdown */}
                                        {isUserMenuOpen && (
                                            <div className="absolute top-[calc(100%+0.5rem)] right-0 w-56 glass-strong rounded-2xl border border-default shadow-xl p-2 animate-fade-in-up">
                                                <div className="px-3 py-2 mb-2 border-b border-default">
                                                    <p className="text-sm font-medium text-theme-primary truncate">{session.user?.name || 'User'}</p>
                                                    <p className="text-xs text-theme-muted truncate">{session.user?.email}</p>
                                                </div>
                                                <Link
                                                    href="/dashboard"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-theme-secondary hover:text-accent hover:bg-accent/5 transition-colors font-medium"
                                                >
                                                    <LayoutDashboard className="w-4 h-4" />
                                                    Dashboard
                                                </Link>
                                                <button
                                                    onClick={() => signOut()}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-500/10 transition-colors mt-1"
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
                                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap shrink-0
                                             text-theme-primary border border-default hover:bg-slate-50 dark:hover:bg-slate-800
                                             hover:text-accent hover:border-accent/30 hover:shadow-sm transition-all duration-300 active:scale-95"
                                    >
                                        <UserIcon className="w-4 h-4" />
                                        Sign In
                                    </button>
                                )}
                            </div>

                            {/* Mobile Menu Button */}
                            <button
                                ref={mobileMenuBtnRef}
                                className="xl:hidden w-11 h-11 flex items-center justify-center glass rounded-xl
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

                {/* Mobile Menu — Full screen overlay — Premium Transitions */}
                <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        id="mobile-menu"
                        ref={mobileMenuRef}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Navigation menu"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="xl:hidden fixed inset-0 top-0 z-[100] bg-card-bg
                                flex flex-col overflow-hidden"
                    >
                        {/* Internal Header for Mobile Menu — Premium Glass Effect */}
                        <div className="sticky top-0 z-10 flex items-center justify-between h-20 px-6 bg-card-bg/80 backdrop-blur-xl border-b border-default/50 shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
                                    <Menu className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-display font-bold text-xl text-theme-primary tracking-tight">
                                    Navigation
                                </span>
                            </div>
                            <button
                                onClick={closeMobileMenu}
                                className="w-11 h-11 flex items-center justify-center glass rounded-xl border-hover transition-all active:scale-90"
                                aria-label="Close menu"
                            >
                                <X className="w-6 h-6 text-theme-primary" />
                            </button>
                        </div>

                        {/* Scrollable Content Container */}
                        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
                            {/* Top Utility Bar (Compact & Premium) */}
                            <div className="flex items-center justify-between p-4 mb-8 rounded-2xl bg-slate-50/80 dark:bg-slate-900/50 border border-default shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                                        <Sparkles className="w-4.5 h-4.5 text-accent" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-theme-muted uppercase tracking-widest leading-none mb-1">Preferences</p>
                                        <p className="text-xs font-bold text-theme-primary">Personalize</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3.5">
                                    <ThemeToggle />
                                    <div className="h-6 w-px bg-default opacity-50" />
                                    {!session ? (
                                        <button
                                            onClick={() => {
                                                closeMobileMenu()
                                                setIsLoginModalOpen(true)
                                            }}
                                            className="px-4 py-2 rounded-xl text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 font-bold text-xs shadow-sm active:scale-95 transition-all"
                                        >
                                            Sign In
                                        </button>
                                    ) : (
                                        <Link href="/dashboard" onClick={closeMobileMenu} className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-bold border border-accent/20">
                                            {session.user?.name?.[0] || 'U'}
                                        </Link>
                                    )}
                                </div>
                            </div>

                            <Link
                                href="/scan"
                                className="flex items-center justify-center gap-3 w-full py-5 mb-10 rounded-2xl bg-accent text-white shadow-xl shadow-accent/25 active:scale-95 transition-all font-black text-lg group"
                                onClick={closeMobileMenu}
                            >
                                <Sparkles className="w-6 h-6 flex-shrink-0 group-hover:animate-pulse" />
                                <span>SCAN MY POLICY</span>
                            </Link>

                            <nav aria-label="Mobile navigation" className="space-y-2">
                                {/* Personal Section */}
                                <div className="group/cat">
                                    <button
                                        onClick={() => toggleCategory('personal')}
                                        className={`flex items-center justify-between w-full py-4 px-2 text-left rounded-xl transition-all duration-300
                                                 ${openCategory === 'personal' ? 'bg-slate-50 dark:bg-slate-900' : 'hover:bg-slate-50/50 dark:hover:bg-slate-900/50'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-2 h-2 rounded-full transition-all duration-300 ${openCategory === 'personal' ? 'bg-accent scale-125 shadow-[0_0_8px_rgba(var(--color-accent),0.5)]' : 'bg-slate-300'}`} />
                                            <span className={`text-xs font-black uppercase tracking-[0.2em] transition-colors ${openCategory === 'personal' ? 'text-accent' : 'text-theme-muted'}`}>Personal Protection</span>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 text-theme-muted transition-transform duration-300 ${openCategory === 'personal' ? 'rotate-180 text-accent' : ''}`} />
                                    </button>
                                    <AnimatePresence>
                                        {openCategory === 'personal' && (
                                            <motion.ul
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: 'circOut' }}
                                                className="overflow-hidden grid grid-cols-1 gap-1.5 pt-2 pb-6 px-2"
                                            >
                                                {insuranceTypes.map((item) => (
                                                    <li key={item.href} className="list-none">
                                                        <Link
                                                            href={item.href}
                                                            className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-all group/item"
                                                            onClick={closeMobileMenu}
                                                        >
                                                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color}
                                                                         flex items-center justify-center shrink-0 shadow-sm group-hover/item:scale-110 transition-transform`} aria-hidden="true">
                                                                <item.icon className="w-5 h-5 text-white" strokeWidth={2} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <span className="block font-bold text-sm text-theme-primary group-hover/item:text-accent transition-colors">{item.label}</span>
                                                                <span className="block text-[10px] text-theme-muted truncate">{item.description}</span>
                                                            </div>
                                                        </Link>
                                                    </li>
                                                ))}
                                            </motion.ul>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Business Section */}
                                <div className="group/cat">
                                    <button
                                        onClick={() => toggleCategory('business')}
                                        className={`flex items-center justify-between w-full py-4 px-2 text-left rounded-xl transition-all duration-300
                                                 ${openCategory === 'business' ? 'bg-slate-50 dark:bg-slate-900' : 'hover:bg-slate-50/50 dark:hover:bg-slate-900/50'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-2 h-2 rounded-full transition-all duration-300 ${openCategory === 'business' ? 'bg-accent scale-125 shadow-[0_0_8px_rgba(var(--color-accent),0.5)]' : 'bg-slate-300'}`} />
                                            <span className={`text-xs font-black uppercase tracking-[0.2em] transition-colors ${openCategory === 'business' ? 'text-accent' : 'text-theme-muted'}`}>Business Solutions</span>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 text-theme-muted transition-transform duration-300 ${openCategory === 'business' ? 'rotate-180 text-accent' : ''}`} />
                                    </button>
                                    <AnimatePresence>
                                        {openCategory === 'business' && (
                                            <motion.ul
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: 'circOut' }}
                                                className="overflow-hidden grid grid-cols-1 gap-1.5 pt-2 pb-6 px-2"
                                            >
                                                {businessTypes.map((item) => (
                                                    <li key={item.href} className="list-none">
                                                        <Link
                                                            href={item.href}
                                                            className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-all group/item"
                                                            onClick={closeMobileMenu}
                                                        >
                                                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color}
                                                                         flex items-center justify-center shrink-0 shadow-sm group-hover/item:scale-110 transition-transform`} aria-hidden="true">
                                                                <item.icon className="w-5 h-5 text-white" strokeWidth={2} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <span className="block font-bold text-sm text-theme-primary group-hover/item:text-accent transition-colors">{item.label}</span>
                                                                <span className="block text-[10px] text-theme-muted truncate">{item.description}</span>
                                                            </div>
                                                        </Link>
                                                    </li>
                                                ))}
                                            </motion.ul>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Tools Section */}
                                <div className="group/cat">
                                    <button
                                        onClick={() => toggleCategory('tools')}
                                        className={`flex items-center justify-between w-full py-4 px-2 text-left rounded-xl transition-all duration-300
                                                 ${openCategory === 'tools' ? 'bg-slate-50 dark:bg-slate-900' : 'hover:bg-slate-50/50 dark:hover:bg-slate-900/50'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-2 h-2 rounded-full transition-all duration-300 ${openCategory === 'tools' ? 'bg-accent scale-125 shadow-[0_0_8px_rgba(var(--color-accent),0.5)]' : 'bg-slate-300'}`} />
                                            <span className={`text-xs font-black uppercase tracking-[0.2em] transition-colors ${openCategory === 'tools' ? 'text-accent' : 'text-theme-muted'}`}>Smart Toolkit</span>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 text-theme-muted transition-transform duration-300 ${openCategory === 'tools' ? 'rotate-180 text-accent' : ''}`} />
                                    </button>
                                    <AnimatePresence>
                                        {openCategory === 'tools' && (
                                            <motion.ul
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: 'circOut' }}
                                                className="overflow-hidden grid grid-cols-2 gap-3 pt-3 pb-6 px-1"
                                            >
                                                {tools.map((item) => (
                                                    <li key={item.href} className="list-none">
                                                        <Link
                                                            href={item.href}
                                                            className="flex flex-col items-center text-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-default hover:border-accent transition-all active:scale-[0.98] group/item"
                                                            onClick={closeMobileMenu}
                                                        >
                                                            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color}
                                                                         flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover/item:scale-110`} aria-hidden="true">
                                                                <item.icon className="w-5 h-5 text-white" strokeWidth={2} />
                                                            </div>
                                                            <span className="block font-bold text-[11px] leading-tight line-clamp-2 text-theme-primary">{item.label}</span>
                                                        </Link>
                                                    </li>
                                                ))}
                                            </motion.ul>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Knowledge Section — Premium Grid */}
                                <div className="pt-10 pb-6">
                                    <p className="text-[10px] text-theme-muted uppercase tracking-[0.3em] mb-8 font-black text-center opacity-70">Reference Hub</p>
                                    <ul className="grid grid-cols-3 gap-6">
                                        {knowledgeCenter.map((item) => (
                                            <li key={item.href} className="list-none">
                                                <Link
                                                    href={item.href}
                                                    className="flex flex-col items-center gap-3 group/item"
                                                    onClick={closeMobileMenu}
                                                >
                                                    <div className={`w-15 h-15 rounded-2xl bg-gradient-to-br ${item.color}
                                                                 flex items-center justify-center shrink-0 shadow-lg ring-4 ring-white dark:ring-slate-950 transition-all group-hover/item:scale-110 group-hover/item:shadow-xl active:scale-95`} aria-hidden="true">
                                                        <item.icon className="w-7 h-7 text-white" strokeWidth={2} />
                                                    </div>
                                                    <span className="block font-extrabold text-[10px] text-theme-primary uppercase tracking-wider group-hover/item:text-accent transition-colors">{item.label.split(' ')[0]}</span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </nav>

                            <div className="mt-12 mb-8 flex flex-col gap-4">
                                <a
                                    href="https://buymeacoffee.com/insuranceclarity"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl
                                           bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-black shadow-xl
                                           active:scale-95 transition-all outline-none"
                                >
                                    <Coffee className="w-5 h-5 flex-shrink-0" />
                                    SUPPORT PROJECT
                                </a>
                                <p className="text-center text-[11px] font-bold text-theme-muted tracking-widest uppercase opacity-60">
                                    Insurance transparency for everyone
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
                </AnimatePresence>
            </header>

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
            />
        </>
    )
}
