import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CookieBanner from '@/components/CookieBanner'
import AnalyticsBootstrap from '@/components/AnalyticsBootstrap'
import { ThemeProvider } from '@/components/ThemeProvider'
import { NextAuthProvider } from '@/components/providers/NextAuthProvider'
import { SWRProvider } from '@/components/providers/swr-provider'
import PageTransition from '@/components/PageTransition'
import ClarityAdvisor from '@/components/ClarityAdvisor'
import ProductTour from '@/components/onboarding/ProductTour'
import { JsonLd } from '@/components/seo/JsonLd'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { headers } from 'next/headers'
import { ensurePlansValidated } from '@/lib/subscriptions/plan-validation'

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
})
const outfit = Outfit({
    subsets: ['latin'],
    variable: '--font-outfit',
})

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://insuranceclarity.in'),
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

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Validate subscription plan configuration at startup
    await ensurePlansValidated();

    const locale = await getLocale()
    const messages = await getMessages()
    const nonce = (await headers()).get('x-nonce') || undefined;

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
        <html lang={locale} className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
            <body className="font-sans antialiased">
                {/* Skip to Content — Accessibility (WCAG 2.4.1) */}
                <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:absolute focus:z-[9999]
                               focus:top-4 focus:left-4 focus:px-4 focus:py-2
                               focus:bg-white dark:focus:bg-slate-900
                               focus:text-slate-900 dark:focus:text-white
                               focus:rounded-xl focus:shadow-lg focus:border focus:border-accent
                               focus:font-semibold focus:text-sm"
                >
                    Skip to main content
                </a>
                <JsonLd
                    data={{
                        '@context': 'https://schema.org',
                        '@graph': jsonLd,
                    }}
                    nonce={nonce}
                />
                <NextIntlClientProvider messages={messages} locale={locale}>
                    <ThemeProvider>
                        <NextAuthProvider>
                            <SWRProvider>
                                <Header />
                                <PageTransition>
                                    <main id="main-content" className="pt-24">{children}</main>
                                </PageTransition>
                                <Footer />
                                <AnalyticsBootstrap nonce={nonce} />
                                <CookieBanner />
                                <ClarityAdvisor />
                                <ProductTour />
                            </SWRProvider>
                        </NextAuthProvider>
                    </ThemeProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    )
}


