import { describe, it, expect, vi } from 'vitest'
import { generateMetadata } from './page'

vi.mock('next-intl/server', () => ({
    getTranslations: vi.fn(async () => (key: string) => {
        const messages: Record<string, string> = {
            'metadata.title': 'Localized About Title',
            'metadata.description': 'Localized About Description',
            'metadata.openGraphTitle': 'Localized About OG Title',
            'metadata.openGraphDescription': 'Localized About OG Description',
        }

        return messages[key] ?? key
    }),
}))

describe('about/page metadata', () => {
    it('uses localized metadata strings', async () => {
        const metadata = await generateMetadata()

        expect(metadata.title).toBe('Localized About Title')
        expect(metadata.description).toBe('Localized About Description')
        expect(metadata.openGraph?.title).toBe('Localized About OG Title')
        expect(metadata.openGraph?.description).toBe('Localized About OG Description')
        expect(metadata.alternates?.canonical).toBe('/about')
    })
})
