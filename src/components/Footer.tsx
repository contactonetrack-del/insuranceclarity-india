import Link from 'next/link'
import Image from 'next/image'
import { Heart, Building2, Car, Home, Plane, Search, Scale, Calculator, FileText, MapPin, Globe, Mail, Coffee, Gem, UserCheck } from 'lucide-react'
import RegulatoryDisclaimer from './RegulatoryDisclaimer'

const footerLinks = {
    insurance: [
        { href: '/insurance/life', label: 'Life Insurance', icon: Heart },
        { href: '/insurance/health', label: 'Health Insurance', icon: Building2 },
        { href: '/insurance/motor', label: 'Motor Insurance', icon: Car },
        { href: '/insurance/home', label: 'Home Insurance', icon: Home },
        { href: '/insurance/travel', label: 'Travel Insurance', icon: Plane },
        { href: '/insurance/specialized', label: 'Specialized Insurance', icon: Gem },
        { href: '/insurance/personal-accident', label: 'Personal Accident', icon: UserCheck },
    ],
    tools: [
        { href: '/tools/hidden-facts', label: 'Hidden Facts', icon: Search },
        { href: '/tools/compare', label: 'Compare Policies', icon: Scale },
        { href: '/tools/calculator', label: 'Premium Calculator', icon: Calculator },
        { href: '/tools/claim-cases', label: 'Claim Cases', icon: FileText },
    ],
    company: [
        { href: '/resources', label: 'Resources & Guides' },
        { href: 'mailto:contact@insuranceclarity.in', label: 'Contact Us' },
        { href: '/privacy', label: 'Privacy Policy' },
        { href: '/terms', label: 'Terms of Service' },
        { href: '/cookies', label: 'Cookie Policy' },
    ],
}

export default function Footer() {
    return (
        <footer className="glass-strong py-16 mt-auto">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div>
                        <Link href="/" className="flex items-center gap-3 mb-4 group">
                            <div className="w-10 h-10 flex items-center justify-center
                            transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-md">
                                <Image
                                    src="/logo.png"
                                    alt="InsuranceClarity Logo"
                                    width={40}
                                    height={40}
                                    className="object-contain"
                                />
                            </div>
                            <span className="font-display font-bold text-lg text-theme-primary">
                                Insurance<span className="text-gradient">Clarity</span>
                            </span>
                        </Link>
                        <p className="text-theme-secondary text-sm leading-relaxed mb-6">
                            India's most transparent insurance platform.
                            Making insurance understandable for everyone.
                        </p>

                        {/* Donation Callout in Footer */}
                        <div className="p-4 rounded-xl bg-accent-5 border border-default mb-6">
                            <p className="text-xs text-theme-secondary mb-3 font-medium">
                                Help us keep this platform independent and ad-free.
                            </p>
                            <a
                                href="https://buymeacoffee.com/insuranceclarity"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm font-bold text-accent hover:underline decoration-2 underline-offset-4"
                            >
                                <Coffee className="w-4 h-4" />
                                Support Our Mission
                            </a>
                        </div>

                        <div className="flex items-center gap-4 text-theme-muted text-sm">
                            <span className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4" />
                                India
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Globe className="w-4 h-4" />
                                insuranceclarity.in
                            </span>
                        </div>
                    </div>

                    {/* Insurance Types */}
                    <div>
                        <h3 className="font-display font-semibold text-theme-primary mb-4">
                            Insurance Types
                        </h3>
                        <ul className="space-y-3">
                            {footerLinks.insurance.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="flex items-center gap-2 text-theme-secondary hover:text-accent 
                             transition-colors duration-200 text-sm group"
                                    >
                                        <link.icon className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Tools */}
                    <div>
                        <h3 className="font-display font-semibold text-theme-primary mb-4">
                            Tools
                        </h3>
                        <ul className="space-y-3">
                            {footerLinks.tools.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="flex items-center gap-2 text-theme-secondary hover:text-accent 
                             transition-colors duration-200 text-sm group"
                                    >
                                        <link.icon className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="font-display font-semibold text-theme-primary mb-4">
                            Company
                        </h3>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-theme-secondary hover:text-accent transition-colors duration-200 text-sm"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-12 pt-8 border-t border-default space-y-4">
                    {/* Regulatory Disclaimer */}
                    <RegulatoryDisclaimer variant="compact" />

                    {/* Transparency Notice */}
                    <p className="text-xs text-theme-muted">
                        <strong>Transparency:</strong> We do not receive commissions from insurers.
                        Data sourced from IRDAI, insurer websites, and consumer reports.
                    </p>

                    {/* Contact & Copyright */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-4">
                        <div className="text-theme-muted text-xs space-y-1">
                            <p className="flex items-center gap-2">
                                <Mail className="w-3 h-3" />
                                <a href="mailto:contact@insuranceclarity.in" className="hover:text-accent">
                                    contact@insuranceclarity.in
                                </a>
                            </p>
                            <p className="flex items-center gap-2">
                                <MapPin className="w-3 h-3" />
                                India
                            </p>
                        </div>
                        <p className="text-theme-muted text-sm">
                            © 2026 InsuranceClarity India. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}
