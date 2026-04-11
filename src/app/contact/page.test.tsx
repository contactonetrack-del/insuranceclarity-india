/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ContactPage from './page'

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => {
        const messages: Record<string, string> = {
            'hero.badge': 'Localized Contact Badge',
            'hero.titlePrefix': 'Localized Contact',
            'hero.titleHighlight': 'Title',
            'hero.description': 'Localized contact hero description.',
            'form.title': 'Localized Form Title',
            'form.fields.name.label': 'Localized Name Label',
            'form.fields.name.placeholder': 'Localized Name Placeholder',
            'form.fields.email.label': 'Localized Email Label',
            'form.fields.email.placeholder': 'Localized Email Placeholder',
            'form.fields.message.label': 'Localized Message Label',
            'form.fields.message.placeholder': 'Localized Message Placeholder',
            'form.actions.send': 'Localized Send Message',
            'form.actions.sending': 'Localized Sending',
            'channels.email.title': 'Localized Email Title',
            'channels.email.description': 'Localized Email Description',
            'channels.location.title': 'Localized Location Title',
            'channels.location.value': 'Localized Location Value',
            'channels.location.description': 'Localized Location Description',
            'channels.responseTime.title': 'Localized Response Time Title',
            'channels.responseTime.value': 'Localized Response Time Value',
            'channels.responseTime.description': 'Localized Response Time Description',
            'important.title': 'Localized Important Title',
            'important.description': 'Localized Important Description',
            'officialLinks.title': 'Localized Official Links Title',
            'officialLinks.irdai.label': 'Localized IRDAI Label',
            'officialLinks.irdai.description': 'Localized IRDAI Description',
            'officialLinks.ombudsman.label': 'Localized Ombudsman Label',
            'officialLinks.ombudsman.description': 'Localized Ombudsman Description',
        }

        return messages[key] ?? key
    },
}))

describe('ContactPage', () => {
    it('renders translated content', () => {
        render(<ContactPage />)

        expect(screen.getByText('Localized Contact Badge')).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: /Localized Contact Title/i })).toBeInTheDocument()
        expect(screen.getByText('Localized contact hero description.')).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Localized Form Title' })).toBeInTheDocument()
        expect(screen.getByLabelText('Localized Name Label')).toBeInTheDocument()
        expect(screen.getByLabelText('Localized Email Label')).toBeInTheDocument()
        expect(screen.getByLabelText('Localized Message Label')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Localized Send Message/i })).toBeInTheDocument()
        expect(screen.getByText('Localized Email Title')).toBeInTheDocument()
        expect(screen.getByText('Localized Location Title')).toBeInTheDocument()
        expect(screen.getByText('Localized Response Time Title')).toBeInTheDocument()
        expect(screen.getByText('Localized Important Title')).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Localized Official Links Title' })).toBeInTheDocument()
        expect(screen.getByText('Localized IRDAI Label')).toBeInTheDocument()
        expect(screen.getByText('Localized Ombudsman Label')).toBeInTheDocument()
    })
})
