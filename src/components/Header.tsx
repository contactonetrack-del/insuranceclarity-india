'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
    Menu, X, ChevronDown, Shield,
    Heart, Building2, Car, Home, Plane, Gem, UserCheck,
    Search, Scale, Calculator, FileText
} from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { IconContainer } from '@/components/ui/Icon'

const insuranceTypes = [
    { href: '/insurance/life', label: 'Life Insurance', icon: Heart, color: 'from-red-500 to-pink-600' },
    { href: '/insurance/health', label: 'Health Insurance', icon: Building2, color: 'from-emerald-500 to-teal-600' },
    { href: '/insurance/motor', label: 'Motor Insurance', icon: Car, color: 'from-blue-500 to-indigo-600' },
    { href: '/insurance/home', label: 'Home Insurance', icon: Home, color: 'from-amber-500 to-orange-600' },
    { href: '/insurance/travel', label: 'Travel Insurance', icon: Plane, color: 'from-purple-500 to-violet-600' },
    { href: '/insurance/specialized', label: 'Specialized Insurance', icon: Gem, color: 'from-cyan-500 to-blue-600' },
    { href: '/insurance/personal-accident', label: 'Personal Accident', icon: UserCheck, color: 'from-rose-500 to-red-600' },
]

const tools = [
    { href: '/tools/hidden-facts', label: 'Hidden Facts Revealer', icon: Search, color: 'from-red-500 to-rose-600' },
    { href: '/tools/compare', label: 'Policy Comparison', icon: Scale, color: 'from-blue-500 to-indigo-600' },
    { href: '/tools/calculator', label: 'Premium Calculator', icon: Calculator, color: 'from-emerald-500 to-green-600' },
    { href: '/tools/claim-cases', label: 'Claim Cases', icon: FileText, color: 'from-amber-500 to-yellow-600' },
]

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
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
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-300
        ${isScrolled ? 'glass-strong shadow-md' : 'glass-subtle'}`}
        >
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-11 h-11 flex items-center justify-center bg-gradient-accent rounded-xl
                          shadow-md group-hover:shadow-glow transition-all duration-300 group-hover:scale-105">
                            <Shield className="w-6 h-6 text-white" strokeWidth={2} />
                        </div>
                        <span className="font-display font-bold text-xl text-theme-primary">
                            Insurance<span className="text-gradient">Clarity</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-1">
                        <Link href="/" className="nav-link">
                            Home
                        </Link>

                        {/* Insurance Types Dropdown */}
                        <div
                            className="relative"
                            onMouseEnter={() => setActiveDropdown('insurance')}
                            onMouseLeave={() => setActiveDropdown(null)}
                        >
                            <button className="nav-link flex items-center gap-1">
                                Insurance Types
                                <ChevronDown
                                    className={`w-4 h-4 transition-transform duration-200 
                    ${activeDropdown === 'insurance' ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {activeDropdown === 'insurance' && (
                                <div className="absolute top-full left-0 pt-2 w-72">
                                    {/* Invisible bridge to prevent gap issues */}
                                    <div className="absolute top-0 left-0 w-full h-2" />
                                    <div className="p-2 rounded-xl shadow-xl animate-fade-in-up
                                      bg-white dark:bg-slate-900 border border-default">
                                        {insuranceTypes.map((item, index) => (
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
                            <button className="nav-link flex items-center gap-1">
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

                        {/* Mobile Menu Button */}
                        <button
                            className="lg:hidden w-11 h-11 flex items-center justify-center glass rounded-xl
                       hover:border-hover transition-all duration-200"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle menu"
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
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Home
                    </Link>

                    <div className="py-4 border-b border-default">
                        <p className="text-sm text-accent uppercase tracking-wider mb-3 font-medium">
                            Insurance Types
                        </p>
                        {insuranceTypes.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-3 py-3 text-theme-secondary hover:text-accent transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
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
                                onClick={() => setIsMobileMenuOpen(false)}
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
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Resources
                    </Link>
                </div>
            )}
        </header>
    )
}
