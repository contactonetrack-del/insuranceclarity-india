import Link from 'next/link'
import { Shield, Heart, Building2, Car, Home, Plane, Search, Scale, Calculator, FileText, MapPin, Globe } from 'lucide-react'

const footerLinks = {
    insurance: [
        { href: '/insurance/life', label: 'Life Insurance', icon: Heart },
        { href: '/insurance/health', label: 'Health Insurance', icon: Building2 },
        { href: '/insurance/motor', label: 'Motor Insurance', icon: Car },
        { href: '/insurance/home', label: 'Home Insurance', icon: Home },
        { href: '/insurance/travel', label: 'Travel Insurance', icon: Plane },
    ],
    tools: [
        { href: '/tools/hidden-facts', label: 'Hidden Facts', icon: Search },
        { href: '/tools/compare', label: 'Compare Policies', icon: Scale },
        { href: '/tools/calculator', label: 'Premium Calculator', icon: Calculator },
        { href: '/tools/claim-cases', label: 'Claim Cases', icon: FileText },
    ],
    company: [
        { href: '/about', label: 'About Us' },
        { href: '/contact', label: 'Contact' },
        { href: '/privacy', label: 'Privacy Policy' },
        { href: '/terms', label: 'Terms of Service' },
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
                            <div className="w-10 h-10 flex items-center justify-center bg-gradient-accent rounded-xl
                            shadow-md group-hover:shadow-glow transition-all duration-300">
                                <Shield className="w-5 h-5 text-white" strokeWidth={2} />
                            </div>
                            <span className="font-display font-bold text-lg text-theme-primary">
                                Insurance<span className="text-gradient">Clarity</span>
                            </span>
                        </Link>
                        <p className="text-theme-secondary text-sm leading-relaxed mb-4">
                            India's most transparent insurance platform.
                            Making insurance understandable for everyone.
                        </p>
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
                <div className="mt-12 pt-8 border-t border-default flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-theme-muted text-sm">
                        © 2026 InsuranceClarity India. All rights reserved.
                    </p>
                    <p className="text-theme-muted text-xs opacity-70">
                        Data sourced from IRDAI, insurer websites, and consumer reports. Not financial advice.
                    </p>
                </div>
            </div>
        </footer>
    )
}
