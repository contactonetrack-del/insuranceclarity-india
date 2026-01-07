import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ThemeProvider } from '@/components/ThemeProvider'
import PageTransition from '@/components/PageTransition'
import ErrorBoundary from '@/components/ErrorBoundary'
import CookieConsent from '@/components/CookieConsent'
import SchemaMarkup from '@/components/SchemaMarkup'

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap', // Improve font loading performance
})

const outfit = Outfit({
    subsets: ['latin'],
    variable: '--font-outfit',
    display: 'swap',
})

export const metadata: Metadata = {
    title: 'InsuranceClarity India - Compare Insurance | Discover Hidden Facts',
    description: 'India\'s most transparent insurance platform. Compare Life, Health, Motor, Home & Travel insurance. Discover hidden exclusions and understand claim settlements.',
    keywords: 'insurance India, health insurance, life insurance, motor insurance, policy comparison, claim settlement ratio',
    authors: [{ name: 'InsuranceClarity India' }],
    metadataBase: new URL('https://insuranceclarity.in'),
    openGraph: {
        title: 'InsuranceClarity India - Compare Insurance | Discover Hidden Facts',
        description: 'India\'s most transparent insurance platform. Compare policies, discover hidden exclusions.',
        url: 'https://insuranceclarity.in',
        siteName: 'InsuranceClarity India',
        locale: 'en_IN',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'InsuranceClarity India',
        description: 'India\'s most transparent insurance platform.',
    },
    robots: {
        index: true,
        follow: true,
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
            <body className="font-sans antialiased">
                {/* Skip Navigation Link for Accessibility */}
                <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-[var(--color-accent)] focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-accent)]"
                >
                    Skip to main content
                </a>

                <SchemaMarkup schema={{
                    "@context": "https://schema.org",
                    "@type": "Organization",
                    "name": "InsuranceClarity India",
                    "url": "https://insuranceclarity.in",
                    "logo": "https://insuranceclarity.in/logo.png",
                    "sameAs": [
                        "https://twitter.com/insuranceclarity",
                        "https://linkedin.com/company/insuranceclarity"
                    ],
                    "contactPoint": {
                        "@type": "ContactPoint",
                        "telephone": "+91-1800-123-4567",
                        "contactType": "customer service",
                        "areaServed": "IN",
                        "availableLanguage": ["en", "hi"]
                    }
                }} />

                <ThemeProvider>
                    <ErrorBoundary>
                        <Header />
                        <PageTransition>
                            <main id="main-content" role="main" tabIndex={-1}>
                                {children}
                            </main>
                        </PageTransition>
                        <Footer />
                        <CookieConsent />
                    </ErrorBoundary>
                </ThemeProvider>
            </body>
        </html>
    )
}
