/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import type { HTMLAttributes, ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { AdminBusinessReadinessCard } from './AdminBusinessReadinessCard'

vi.mock('next-intl', () => ({
    useLocale: () => 'en-IN',
    useTranslations: () => (key: string, values?: Record<string, string | number>) => {
        const messages: Record<string, string> = {
            aria: 'Localized business readiness visibility',
            badge: 'Localized revenue visibility live',
            title: 'Localized Business Readiness',
            subtitle: `Localized subtitle ${values?.days ?? ''}`,
            generatedAt: 'Localized generated at',
            'funnel.signup': 'Localized Signups',
            'funnel.scan': 'Localized Scans',
            'funnel.pay': 'Localized Payments',
            'funnel.retain': 'Localized Retained',
            'conversion.title': 'Localized Conversion Checkpoints',
            'conversion.signupToScan': 'Localized Signup to Scan',
            'conversion.scanToPay': 'Localized Scan to Pay',
            'conversion.payToRetain': 'Localized Pay to Retain',
            'supporting.title': 'Localized Supporting Signals',
            'supporting.totalLeads': 'Localized Total Leads',
            'supporting.scansInWindow': `Localized Scans ${values?.days ?? ''}`,
            'supporting.capturedPaymentsInWindow': `Localized Captured Payments ${values?.days ?? ''}`,
            'supporting.activeSubscriptions': 'Localized Active Subscriptions',
        }

        return messages[key] ?? key
    },
}))

vi.mock('framer-motion', () => ({
    motion: {
        section: ({ children, ...props }: HTMLAttributes<HTMLElement> & { children: ReactNode }) => <section {...props}>{children}</section>,
        div: ({ children, ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) => <div {...props}>{children}</div>,
    },
}))

describe('AdminBusinessReadinessCard', () => {
    it('renders translated funnel, conversion, and supporting business metrics', () => {
        render(
            <AdminBusinessReadinessCard
                readiness={{
                    days: 30,
                    totals: { signup: 12, scan: 8, pay: 5, retain: 3 },
                    conversion: { signupToScan: 0.6667, scanToPay: 0.625, payToRetain: 0.6 },
                    supporting: {
                        totalLeads: 44,
                        scansInWindow: 18,
                        capturedPaymentsInWindow: 9,
                        activeSubscriptions: 6,
                    },
                    generatedAt: '2026-04-11T08:30:00.000Z',
                }}
            />,
        )

        expect(screen.getByLabelText('Localized business readiness visibility')).toBeInTheDocument()
        expect(screen.getByText('Localized Business Readiness')).toBeInTheDocument()
        expect(screen.getByText('Localized revenue visibility live')).toBeInTheDocument()
        expect(screen.getByText('Localized Signups')).toBeInTheDocument()
        expect(screen.getByText('Localized Scans')).toBeInTheDocument()
        expect(screen.getByText('Localized Payments')).toBeInTheDocument()
        expect(screen.getByText('Localized Retained')).toBeInTheDocument()
        expect(screen.getByText('Localized Conversion Checkpoints')).toBeInTheDocument()
        expect(screen.getByText('Localized Supporting Signals')).toBeInTheDocument()
        expect(screen.getByText('Localized Total Leads')).toBeInTheDocument()
        expect(screen.getByText('66.7%')).toBeInTheDocument()
        expect(screen.getByText('62.5%')).toBeInTheDocument()
        expect(screen.getByText('60.0%')).toBeInTheDocument()
        expect(screen.getByText('44')).toBeInTheDocument()
    })
})
