import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ThemeProvider } from '@/components/ThemeProvider'
import PageTransition from '@/components/PageTransition'

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
    return (
        <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
            <body className="font-sans antialiased">
                <ThemeProvider>
                    <Header />
                    <PageTransition>
                        <main>{children}</main>
                    </PageTransition>
                    <Footer />
                </ThemeProvider>
                <SpeedInsights />
            </body>
        </html>
    )
}
