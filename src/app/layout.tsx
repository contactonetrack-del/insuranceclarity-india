import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CookieBanner from '@/components/CookieBanner'
import { ThemeProvider } from '@/components/ThemeProvider'
import PageTransition from '@/components/PageTransition'
import ClarityAdvisor from '@/components/ClarityAdvisor'

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
})

const outfit = Outfit({
    subsets: ['latin'],
    variable: '--font-outfit',
})

export const metadata: Metadata = {
    title: 'InsuranceClarity India - Compare Insurance | Discover Hidden Facts',
    description: 'India\'s most transparent insurance platform. Compare Life, Health, Motor, Home & Travel insurance. Discover hidden exclusions and understand claim settlements.',
    keywords: 'insurance India, health insurance, life insurance, motor insurance, policy comparison, claim settlement ratio',
    authors: [{ name: 'InsuranceClarity India' }],
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
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const jsonLd = [
        {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'InsuranceClarity India',
            url: 'https://insuranceclarity.in',
            description: "India's most transparent insurance platform.",
            potentialAction: {
                '@type': 'SearchAction',
                target: 'https://insuranceclarity.in/?q={search_term_string}',
                'query-input': 'required name=search_term_string'
            }
        },
        {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'InsuranceClarity India',
            url: 'https://insuranceclarity.in',
            logo: 'https://insuranceclarity.in/logo.png',
            description: "India's most transparent insurance comparison and advisory platform.",
            contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer support',
                availableLanguage: ['English', 'Hindi']
            },
            sameAs: [
                'https://github.com/contactonetrack-del/insuranceclarity-india'
            ]
        }
    ]

    return (
        <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </head>
            <body className="font-sans antialiased">
                <ThemeProvider>
                    <Header />
                    <PageTransition>
                        <main>{children}</main>
                    </PageTransition>
                    <Footer />
                    <CookieBanner />
                    <ClarityAdvisor />
                </ThemeProvider>
            </body>
        </html>
    )
}

