/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import LeadCaptureForm from './LeadCaptureForm'

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => {
        const messages: Record<string, string> = {
            titleDefault: 'Localized Lead Title',
            subtitleDefault: 'Localized Lead Subtitle',
            defaultInsuranceType: 'Localized Insurance Type',
            badge: 'Localized No Spam Badge',
            'benefits.compareTopInsurers': 'Localized Benefit One',
            'benefits.unbiasedAdvice': 'Localized Benefit Two',
            'benefits.freeClaimAssistance': 'Localized Benefit Three',
            'fields.name.label': 'Localized Full Name',
            'fields.name.placeholder': 'Localized Name Placeholder',
            'fields.phone.label': 'Localized Mobile Number',
            'fields.phone.placeholder': 'Localized Phone Placeholder',
            'fields.email.label': 'Localized Email Optional',
            'fields.email.placeholder': 'Localized Email Placeholder',
            'actions.submit': 'Localized Submit CTA',
            'actions.processing': 'Localized Processing',
            consent: 'Localized Consent Copy',
            'validation.nameTooShort': 'Localized Name Error',
            'validation.invalidEmail': 'Localized Email Error',
            'validation.invalidPhone': 'Localized Phone Error',
            'validation.insuranceTypeRequired': 'Localized Insurance Type Error',
            'errors.requestFailed': 'Localized Request Failed',
            'errors.submitFailed': 'Localized Submit Failed',
            'errors.unexpected': 'Localized Unexpected Error',
            'success.title': 'Localized Success Title',
            'success.description': 'Localized Success Description',
        }
        return messages[key] ?? key
    },
}))

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: { children: ReactNode; [key: string]: unknown }) => <div {...props}>{children}</div>,
    },
}))

describe('LeadCaptureForm', () => {
    it('renders localized default copy for form shell', () => {
        render(<LeadCaptureForm />)

        expect(screen.getByText('Localized No Spam Badge')).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Localized Lead Title' })).toBeInTheDocument()
        expect(screen.getByText('Localized Lead Subtitle')).toBeInTheDocument()
        expect(screen.getByText('Localized Benefit One')).toBeInTheDocument()
        expect(screen.getByText('Localized Benefit Two')).toBeInTheDocument()
        expect(screen.getByText('Localized Benefit Three')).toBeInTheDocument()
        expect(screen.getByText('Localized Full Name')).toBeInTheDocument()
        expect(screen.getByText('Localized Mobile Number')).toBeInTheDocument()
        expect(screen.getByText('Localized Email Optional')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Localized Submit CTA/i })).toBeInTheDocument()
        expect(screen.getByText('Localized Consent Copy')).toBeInTheDocument()
    })
})

