'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import {
    Menu, X, ChevronDown, Database,
    Heart, Building2, Car, Home, Plane, Gem, UserCheck,
    Search, Scale, Calculator, FileText, Coffee,
    Briefcase, Network, Ship, Zap,
    Activity, HeartPulse, UserCircle, Users, UserX, Baby, Bot
} from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { IconContainer } from '@/components/ui/Icon'
import { useGlobalStore } from '@/store/useGlobalStore'

const insuranceTypes = [
    { href: '/insurance/life', label: 'Life Insurance', icon: Heart, color: 'from-red-500 to-pink-600' },
    { href: '/insurance/term-life', label: 'Term Life Insurance', icon: HeartPulse, color: 'from-blue-500 to-cyan-600' },
    { href: '/insurance/health', label: 'Health Insurance', icon: Building2, color: 'from-emerald-500 to-teal-600' },
    { href: '/insurance/family-floater', label: 'Family Floater', icon: Users, color: 'from-fuchsia-500 to-pink-600' },
    { href: '/insurance/senior-citizen', label: 'Senior Citizen', icon: UserCircle, color: 'from-teal-500 to-emerald-600' },
    { href: '/insurance/critical-illness', label: 'Critical Illness', icon: Activity, color: 'from-rose-500 to-red-600' },
    { href: '/insurance/maternity', label: 'Maternity Insurance', icon: Baby, color: 'from-pink-500 to-rose-600' },
    { href: '/insurance/motor', label: 'Motor Insurance', icon: Car, color: 'from-blue-500 to-indigo-600' },
    { href: '/insurance/home', label: 'Home Insurance', icon: Home, color: 'from-amber-500 to-orange-600' },
    { href: '/insurance/travel', label: 'Travel Insurance', icon: Plane, color: 'from-purple-500 to-violet-600' },
    { href: '/insurance/disability', label: 'Disability Insurance', icon: UserX, color: 'from-indigo-500 to-purple-600' },
    { href: '/insurance/specialized', label: 'Specialized Individual', icon: Gem, color: 'from-cyan-500 to-blue-600' },
    { href: '/insurance/personal-accident', label: 'Personal Accident', icon: UserCheck, color: 'from-rose-500 to-red-600' },
]

const businessTypes = [
    { href: '/insurance/business', label: 'Commercial Package', icon: Briefcase, color: 'from-slate-600 to-gray-800' },
    { href: '/insurance/cyber', label: 'Cyber Security Cover', icon: Network, color: 'from-teal-500 to-emerald-600' },
    { href: '/insurance/liability', label: 'Liability Insurance', icon: Scale, color: 'from-amber-500 to-orange-600' },
    { href: '/insurance/marine', label: 'Marine & Aviation', icon: Ship, color: 'from-blue-500 to-cyan-600' },
    { href: '/insurance/ev', label: 'EV & Emerging Tech', icon: Zap, color: 'from-fuchsia-500 to-purple-600' },
    { href: '/insurance/directory', label: 'Insurance Directory', icon: Database, color: 'from-accent to-accent-hover' },
]

const tools = [
    { href: '/tools/ai-advisor', label: 'AI Risk Advisor', icon: Bot, color: 'from-indigo-500 to-purple-600' },
    { href: '/tools/interactive-quote', label: 'Interactive Quote', icon: Zap, color: 'from-amber-400 to-orange-500' },
    { href: '/tools/hidden-facts', label: 'Hidden Facts Revealer', icon: Search, color: 'from-red-500 to-rose-600' },
    { href: '/tools/compare', label: 'Policy Comparison', icon: Scale, color: 'from-blue-500 to-indigo-600' },
    { href: '/tools/calculator', label: 'Premium Calculator', icon: Calculator, color: 'from-emerald-500 to-green-600' },
    { href: '/tools/claim-cases', label: 'Claim Cases', icon: FileText, color: 'from-amber-500 to-yellow-600' },
]

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false)
    const { mobileMenuOpen: isMobileMenuOpen, setMobileMenuOpen } = useGlobalStore()
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
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
                    <Link href="/" className="flex items-center gap-0 group">
                        <div className="w-[72px] h-[72px] flex items-center justify-center
                          transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-md -ml-3">
                            <Image
                                src="/logo.png"
                                alt="InsuranceClarity Logo"
                                width={72}
                                height={72}
                                className="object-contain"
                                priority
                            />
                        </div>
                        <span className="font-display font-bold text-2xl text-theme-primary -ml-2 tracking-tight">
                            Insurance<span className="text-gradient">Clarity</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-1">
                        <Link href="/" className="nav-link">
                            Home
                        </Link>

                        {/* Personal Insurance Dropdown */}
                        <div
                            className="relative"
                            onMouseEnter={() => setActiveDropdown('personal-insurance')}
                            onMouseLeave={() => setActiveDropdown(null)}
                        >
                            <button
                                className="nav-link flex items-center gap-1"
                                aria-haspopup="true"
                                aria-expanded={activeDropdown === 'personal-insurance'}
                            >
                                Personal Insurance
                                <ChevronDown
                                    className={`w-4 h-4 transition-transform duration-200 
                    ${activeDropdown === 'personal-insurance' ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {activeDropdown === 'personal-insurance' && (
                                <div className="absolute top-full left-0 pt-2 w-[520px]">
                                    <div className="absolute top-0 left-0 w-full h-2" />
                                    <div className="p-3 rounded-xl shadow-xl animate-fade-in-up
                                      bg-white dark:bg-slate-900 border border-default grid grid-cols-2 gap-2">
                                        {insuranceTypes.map((item, index) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className="flex items-center gap-3 px-3 py-3 rounded-lg
                               text-theme-secondary hover:text-accent hover:bg-accent-5
                               transition-all duration-200"
                                                style={{ animationDelay: `${index * 30}ms` }}
                                            >
                                                <div className={`w-9 h-9 shrink-0 rounded-lg bg-gradient-to-br ${item.color} 
                                    flex items-center justify-center shadow-sm`}>
                                                    <item.icon className="w-5 h-5 text-white" strokeWidth={2} />
                                                </div>
                                                <span className="font-medium text-sm">{item.label}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Business & Cyber Dropdown */}
                        <div
                            className="relative"
                            onMouseEnter={() => setActiveDropdown('business-insurance')}
                            onMouseLeave={() => setActiveDropdown(null)}
                        >
                            <button
                                className="nav-link flex items-center gap-1"
                                aria-haspopup="true"
                                aria-expanded={activeDropdown === 'business-insurance'}
                            >
                                Business & Cyber
                                <ChevronDown
                                    className={`w-4 h-4 transition-transform duration-200 
                    ${activeDropdown === 'business-insurance' ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {activeDropdown === 'business-insurance' && (
                                <div className="absolute top-full left-0 pt-2 w-72">
                                    <div className="absolute top-0 left-0 w-full h-2" />
                                    <div className="p-2 rounded-xl shadow-xl animate-fade-in-up
                                      bg-white dark:bg-slate-900 border border-default">
                                        {businessTypes.map((item, index) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className="flex items-center gap-3 px-4 py-3 rounded-lg
                               text-theme-secondary hover:text-accent hover:bg-accent-5
                               transition-all duration-200"
                                                style={{ animationDelay: `${index * 50}ms` }}
                                            >
                                                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${item.color} 
                                    flex items-center justify-center shadow-sm`}>
                                                    <item.icon className="w-5 h-5 text-white" strokeWidth={2} />
                                                </div>
                                                <span className="font-medium">{item.label}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Tools Dropdown */}
                        <div
                            className="relative"
                            onMouseEnter={() => setActiveDropdown('tools')}
                            onMouseLeave={() => setActiveDropdown(null)}
                        >
                            <button
                                className="nav-link flex items-center gap-1"
                                aria-haspopup="true"
                                aria-expanded={activeDropdown === 'tools'}
                            >
                                Tools
                                <ChevronDown
                                    className={`w-4 h-4 transition-transform duration-200 
                    ${activeDropdown === 'tools' ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {activeDropdown === 'tools' && (
                                <div className="absolute top-full left-0 pt-2 w-72">
                                    {/* Invisible bridge to prevent gap issues */}
                                    <div className="absolute top-0 left-0 w-full h-2" />
                                    <div className="p-2 rounded-xl shadow-xl animate-fade-in-up
                                      bg-white dark:bg-slate-900 border border-default">
                                        {tools.map((item, index) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className="flex items-center gap-3 px-4 py-3 rounded-lg
                               text-theme-secondary hover:text-accent hover:bg-accent-5
                               transition-all duration-200"
                                                style={{ animationDelay: `${index * 50}ms` }}
                                            >
                                                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${item.color} 
                                    flex items-center justify-center shadow-sm`}>
                                                    <item.icon className="w-5 h-5 text-white" strokeWidth={2} />
                                                </div>
                                                <span className="font-medium">{item.label}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <Link href="/resources" className="nav-link">
                            Resources
                        </Link>
                    </nav>

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        <ThemeToggle />

                        {/* Donation Button - Desktop */}
                        <a
                            href="https://buymeacoffee.com/insuranceclarity"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl
                                     bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400
                                     border border-emerald-500/20 hover:border-emerald-500/40
                                     transition-all duration-300 group font-medium text-sm"
                        >
                            <Coffee className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span>Support Us</span>
                        </a>

                        {/* Mobile Menu Button */}
                        <button
                            className="lg:hidden w-11 h-11 flex items-center justify-center glass rounded-xl
                       hover:border-hover transition-all duration-200"
                            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle menu"
                            aria-expanded={isMobileMenuOpen}
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-6 h-6 text-theme-primary" />
                            ) : (
                                <Menu className="w-6 h-6 text-theme-primary" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed top-20 left-0 w-full h-[calc(100vh-80px)] 
                      glass-strong p-6 overflow-y-auto animate-slide-in">
                    <Link
                        href="/"
                        className="block py-4 text-lg text-theme-primary border-b border-default"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        Home
                    </Link>

                    <div className="py-4 border-b border-default">
                        <p className="text-sm text-accent uppercase tracking-wider mb-3 font-medium">
                            Personal Insurance
                        </p>
                        {insuranceTypes.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-3 py-3 text-theme-secondary hover:text-accent transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.color} 
                              flex items-center justify-center`}>
                                    <item.icon className="w-4 h-4 text-white" strokeWidth={2} />
                                </div>
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </div>

                    <div className="py-4 border-b border-default">
                        <p className="text-sm text-accent uppercase tracking-wider mb-3 font-medium">
                            Business & Cyber
                        </p>
                        {businessTypes.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-3 py-3 text-theme-secondary hover:text-accent transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.color} 
                              flex items-center justify-center`}>
                                    <item.icon className="w-4 h-4 text-white" strokeWidth={2} />
                                </div>
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </div>

                    <div className="py-4 border-b border-default">
                        <p className="text-sm text-accent uppercase tracking-wider mb-3 font-medium">
                            Tools
                        </p>
                        {tools.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-3 py-3 text-theme-secondary hover:text-accent transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.color} 
                              flex items-center justify-center`}>
                                    <item.icon className="w-4 h-4 text-white" strokeWidth={2} />
                                </div>
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </div>

                    <Link
                        href="/resources"
                        className="block py-4 text-lg text-theme-primary"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        Resources
                    </Link>

                    <div className="mt-6 pt-6 border-t border-default">
                        <a
                            href="https://buymeacoffee.com/insuranceclarity"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-3 w-full py-4 rounded-xl
                                     bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20
                                     active:scale-95 transition-all"
                        >
                            <Coffee className="w-5 h-5" />
                            Support Our Project
                        </a>
                        <p className="text-center text-xs text-theme-muted mt-3">
                            Help us keep insurance transparent & ad-free
                        </p>
                    </div>
                </div>
            )}
        </header>
    )
}
