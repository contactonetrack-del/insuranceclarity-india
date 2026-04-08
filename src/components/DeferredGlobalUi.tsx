'use client'

import dynamic from 'next/dynamic'
import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { isRuntimeAnalyticsDisabled } from '@/lib/runtime-flags'
import { hasConsentCookie } from '@/lib/analytics/consent'

const AnalyticsBootstrap = dynamic(() => import('@/components/AnalyticsBootstrap'), { ssr: false })
const CookieBanner = dynamic(() => import('@/components/CookieBanner'), { ssr: false })
const ClarityAdvisor = dynamic(() => import('@/components/ClarityAdvisor'), { ssr: false })
const ProductTour = dynamic(() => import('@/components/onboarding/ProductTour'), { ssr: false })

interface DeferredGlobalUiProps {
    nonce?: string
}

export default function DeferredGlobalUi({ nonce }: DeferredGlobalUiProps) {
    const pathname = usePathname()
    const [hasStoredConsent, setHasStoredConsent] = useState<boolean | null>(null)

    useEffect(() => {
        if (typeof document === 'undefined') return
        setHasStoredConsent(hasConsentCookie(document.cookie))
    }, [pathname])

    useEffect(() => {
        const syncConsent = () => {
            setHasStoredConsent(hasConsentCookie(document.cookie))
        }

        window.addEventListener('ic-consent-updated', syncConsent)
        return () => {
            window.removeEventListener('ic-consent-updated', syncConsent)
        }
    }, [])

    const routeFlags = useMemo(() => {
        const currentPath = pathname || '/'
        const isStudioRoute = currentPath.startsWith('/studio')
        const isAdminRoute = currentPath.startsWith('/admin') || currentPath.startsWith('/dashboard/admin')
        const isDashboardRoute = currentPath.startsWith('/dashboard')
        const isLegalRoute =
            currentPath.startsWith('/privacy') ||
            currentPath.startsWith('/terms') ||
            currentPath.startsWith('/cookies')

        const isAdvisorEligibleRoute =
            currentPath === '/' ||
            currentPath === '/pricing' ||
            currentPath === '/about' ||
            currentPath === '/contact' ||
            currentPath.startsWith('/insurance') ||
            currentPath.startsWith('/tools') ||
            currentPath.startsWith('/blog') ||
            currentPath.startsWith('/hubs') ||
            currentPath.startsWith('/scan')

        return {
            showAnalytics: !isRuntimeAnalyticsDisabled() && !isStudioRoute && hasStoredConsent === true,
            showCookieBanner: !isStudioRoute && hasStoredConsent === false,
            showAdvisor: isAdvisorEligibleRoute && !isAdminRoute && !isDashboardRoute && !isLegalRoute && currentPath !== '/tools/ai-advisor',
            showProductTour: currentPath === '/',
        }
    }, [hasStoredConsent, pathname])

    return (
        <>
            {routeFlags.showAnalytics ? <AnalyticsBootstrap nonce={nonce} /> : null}
            {routeFlags.showCookieBanner ? <CookieBanner /> : null}
            {routeFlags.showAdvisor ? <ClarityAdvisor /> : null}
            {routeFlags.showProductTour ? <ProductTour /> : null}
        </>
    )
}
