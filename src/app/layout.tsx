import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ThemeProvider } from '@/components/ThemeProvider'
import { NextAuthProvider } from '@/components/providers/NextAuthProvider'
import PageTransition from '@/components/PageTransition'
import DeferredGlobalUi from '@/components/DeferredGlobalUi'
import { JsonLd } from '@/components/seo/JsonLd'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages, getTranslations } from 'next-intl/server'
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

export async function generateMetadata(): Promise<Metadata> {
    const [locale, t] = await Promise.all([
        getLocale(),
        getTranslations('layoutMeta'),
    ])

    return {
        metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://insuranceclarity.in'),
        alternates: {
            canonical: '/',
            languages: {
                en: '/en',
                hi: '/hi',
            },
        },
        title: t('title'),
        description: t('description'),
        keywords: t('keywords'),
        authors: [{ name: t('authorName') }],
        openGraph: {
            title: t('openGraph.title'),
            description: t('openGraph.description'),
            url: 'https://insuranceclarity.in',
            siteName: t('openGraph.siteName'),
            locale: locale === 'hi' ? 'hi_IN' : 'en_IN',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: t('twitter.title'),
            description: t('twitter.description'),
        },
        icons: {
            icon: '/icon.png',
            shortcut: '/icon.png',
            apple: '/icon.png',
        },
    }
}

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Validate subscription plan configuration at startup
    await ensurePlansValidated();

    const [locale, messages, tLayout, requestHeaders] = await Promise.all([
        getLocale(),
        getMessages(),
        getTranslations('layoutMeta'),
        headers(),
    ])
    const nonce = requestHeaders.get('x-nonce') || undefined;

    const jsonLd = [
        {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: tLayout('jsonLd.website.name'),
            url: 'https://insuranceclarity.in',
            description: tLayout('jsonLd.website.description'),
            potentialAction: {
                '@type': 'SearchAction',
                target: 'https://insuranceclarity.in/?q={search_term_string}',
                'query-input': 'required name=search_term_string'
            }
        },
        {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: tLayout('jsonLd.organization.name'),
            url: 'https://insuranceclarity.in',
            logo: 'https://insuranceclarity.in/logo.png',
            description: tLayout('jsonLd.organization.description'),
            contactPoint: {
                '@type': 'ContactPoint',
                contactType: tLayout('jsonLd.organization.contactType'),
                availableLanguage: [tLayout('jsonLd.organization.languages.english'), tLayout('jsonLd.organization.languages.hindi')]
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
                    {tLayout('skipToContent')}
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
                            <Header />
                            <PageTransition>
                                <main id="main-content" tabIndex={-1} className="pt-24 focus:outline-none">
                                    {children}
                                </main>
                            </PageTransition>
                            <Footer />
                            <DeferredGlobalUi nonce={nonce} />
                        </NextAuthProvider>
                    </ThemeProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    )
}


