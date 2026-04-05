'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useTransition } from 'react'
import { Heart, Building2, Car, Home, Plane, Search, Scale, Calculator, FileText, MapPin, Globe, Mail, Coffee, Gem, UserCheck, ShieldCheck, Lock, Loader2, CheckCircle } from 'lucide-react'
import RegulatoryDisclaimer from './RegulatoryDisclaimer'
import { subscribeToNewsletter } from '@/app/actions/newsletter-actions'

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
        { href: '/hubs', label: 'Knowledge Hubs' },
        { href: '/resources', label: 'Resources & Guides' },
        { href: 'mailto:contact@insuranceclarity.in', label: 'Contact Us' },
        { href: '/privacy', label: 'Privacy Policy' },
        { href: '/terms', label: 'Terms of Service' },
        { href: '/cookies', label: 'Cookie Policy' },
    ],
}

export default function Footer() {
    return (
        <footer className="relative bg-theme-primary/5 border-t border-default py-20 mt-auto overflow-hidden">
            {/* Subtle Top Glow Decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent shadow-[0_0_20px_rgba(52,211,153,0.1)]" />
            
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div>
                        <Link href="/" className="flex items-center gap-3 mb-6 group w-fit">
                            <div className="relative w-12 h-12 flex items-center justify-center
                            transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                                {/* Subtle Logo Backdrop Glow */}
                                <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <Image
                                    src="/logo.png"
                                    alt="InsuranceClarity Logo"
                                    width={48}
                                    height={48}
                                    className="object-contain relative z-10"
                                />
                            </div>
                            <span className="font-display font-bold text-2xl text-theme-primary tracking-tight">
                                Insurance<span className="text-gradient">Clarity</span>
                            </span>
                        </Link>
                        <p className="text-theme-secondary text-[15px] leading-relaxed mb-8 max-w-xs">
                            India's most transparent insurance platform.
                            Making insurance understandable for everyone.
                        </p>

                        {/* Patronage Card — Refined Glassmorphism */}
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-accent/10 to-transparent border border-accent/10 mb-8 
                        backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-300 group/donate">
                            <p className="text-[13px] text-theme-secondary mb-4 leading-snug">
                                Help us keep this platform independent, transparent, and 100% ad-free.
                            </p>
                            <a
                                href="https://buymeacoffee.com/insuranceclarity"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm font-bold text-accent group-hover:text-accent-dark transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center group-hover/donate:scale-110 transition-transform">
                                    <Coffee className="w-4 h-4" />
                                </div>
                                <span>Support Our Mission</span>
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
                        <h3 className="font-display font-bold text-theme-primary text-base mb-6 
                        flex items-center gap-2 before:content-[''] before:w-1 before:h-4 before:bg-accent before:rounded-full">
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
                        <h3 className="font-display font-bold text-theme-primary text-base mb-6
                        flex items-center gap-2 before:content-[''] before:w-1 before:h-4 before:bg-accent before:rounded-full">
                            Advanced Tools
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
                        <h3 className="font-display font-bold text-theme-primary text-base mb-6
                        flex items-center gap-2 before:content-[''] before:w-1 before:h-4 before:bg-accent before:rounded-full">
                            Company
                        </h3>
                        <ul className="space-y-3 mb-8">
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

                        {/* Social Links — Premium Minimalist */}
                        <div className="flex items-center gap-4">
                            {['Twitter', 'LinkedIn', 'Instagram'].map((platform) => (
                                <a
                                    key={platform}
                                    href={`https://${platform.toLowerCase()}.com/insuranceclarity`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 rounded-xl bg-accent/5 flex items-center justify-center 
                                    text-theme-muted hover:text-accent hover:bg-accent/10 transition-all duration-300
                                    border border-accent/20 hover:border-accent/30 shadow-sm"
                                    aria-label={`Follow us on ${platform}`}
                                >
                                    <Globe className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ─── Premium Newsletter & Trust Section ─── */}
                <div className="mt-16 p-8 rounded-3xl bg-theme-primary/5 border border-default/50 flex flex-col lg:flex-row items-center justify-between gap-10">
                    <div className="max-w-md">
                        <h4 className="font-display font-bold text-lg text-theme-primary mb-2 flex items-center gap-2">
                             Stay Policy Smart
                        </h4>
                        <p className="text-sm text-theme-secondary">
                            Get weekly deep-dives into policy hidden facts and regulatory changes. No spam, ever.
                        </p>
                    </div>
                    <NewsletterForm />
                </div>

                {/* ─── Bottom Section: Trust & Compliance ─── */}
                <div className="mt-16 pt-10 border-t border-default space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        {/* Legal Disclaimers */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent/60 mb-2">
                                Regulatory Compliance
                            </h4>
                            <RegulatoryDisclaimer variant="compact" className="!text-theme-secondary opacity-80" />
                            <p className="text-xs text-theme-muted leading-relaxed">
                                <strong className="text-theme-secondary font-semibold">Transparency Guarantee:</strong> We do not receive commissions from insurers. 
                                Our analysis is 100% independent, sourced from IRDAI records, insurer public filings, and verified consumer reports.
                            </p>
                        </div>

                        {/* Trust Badges & Links */}
                        <div className="flex flex-col sm:flex-row lg:justify-end items-start sm:items-center gap-6">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/5 border border-emerald-500/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    SSL Secured
                                </div>
                                <div className="flex items-center gap-2 text-accent text-[10px] font-bold uppercase tracking-wider bg-accent/5 border border-accent/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
                                    <Lock className="w-3.5 h-3.5" />
                                    Data Encrypted
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-theme-muted border-l border-default pl-6 hidden sm:flex">
                                <a href="https://bimabharosa.irdai.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors underline decoration-accent/20 underline-offset-4">Bima Bharosa</a>
                                <a href="https://irdai.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors underline decoration-accent/20 underline-offset-4">IRDAI Official</a>
                            </div>
                        </div>
                    </div>

                    {/* Final Copyright & Contact Bar */}
                    <div className="pt-8 border-t border-default/50 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-8 gap-y-2 text-[13px] text-theme-muted">
                            <a href="mailto:contact@insuranceclarity.in" className="flex items-center gap-2 hover:text-accent transition-colors">
                                <Mail className="w-4 h-4 opacity-70" />
                                contact@insuranceclarity.in
                            </a>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 opacity-70" />
                                HQ: India
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                            <p className="text-theme-muted text-xs font-medium">
                                © {new Date().getFullYear()} InsuranceClarity India.
                            </p>
                            <div className="h-4 w-px bg-default hidden sm:block" />
                            <p className="text-[11px] text-theme-muted/60 hidden sm:block uppercase tracking-tighter">
                                Crafted for Transparency
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

function NewsletterForm() {
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    async function action(formData: FormData) {
        setMessage(null);
        startTransition(async () => {
            const result = await subscribeToNewsletter(formData);
            setMessage({ type: result.success ? 'success' : 'error', text: result.message });
        });
    }

    return (
        <form action={action} className="flex flex-col w-full lg:max-w-md gap-2">
            <div className="flex w-full gap-2 relative">
                <input 
                    name="email"
                    type="email" 
                    placeholder="your@email.com" 
                    className="flex-1 bg-white dark:bg-slate-900 border border-default rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all disabled:opacity-50"
                    required
                    disabled={isPending || message?.type === 'success'}
                    aria-label="Email Address"
                />
                <button 
                    disabled={isPending || message?.type === 'success'}
                    className="bg-accent hover:bg-accent-dark disabled:bg-accent/50 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-accent/20 text-sm flex items-center justify-center gap-2 min-w-[120px]"
                >
                    {isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : message?.type === 'success' ? (
                        <CheckCircle className="w-4 h-4" />
                    ) : (
                        'Subscribe'
                    )}
                </button>
            </div>
            {message && (
                <p className={`text-xs mt-1 font-medium ${message.type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {message.text}
                </p>
            )}
        </form>
    );
}
