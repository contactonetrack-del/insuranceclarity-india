/**
 * @vitest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import LanguageToggle from '@/components/ui/LanguageToggle'

const refresh = vi.fn()

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        refresh,
    }),
}))

vi.mock('next-intl', () => ({
    useLocale: () => 'en',
    useTranslations: () => (key: string) => {
        const messages: Record<string, string> = {
            language: 'Language',
            switchToEnglish: 'Switch language to English',
            switchToHindi: 'Switch language to Hindi',
        }
        return messages[key] ?? key
    },
}))

describe('LanguageToggle', () => {
    beforeEach(() => {
        refresh.mockReset()
        document.cookie = 'NEXT_LOCALE=; Max-Age=0; path=/'
    })

    it('shows the active locale and refreshes after switching', () => {
        render(<LanguageToggle />)

        expect(screen.getByRole('button', { name: 'Switch language to English' })).toHaveAttribute('aria-pressed', 'true')
        expect(screen.getByRole('button', { name: 'Switch language to Hindi' })).toHaveTextContent('हिं')

        fireEvent.click(screen.getByRole('button', { name: 'Switch language to Hindi' }))

        expect(document.cookie).toContain('NEXT_LOCALE=hi')
        expect(refresh).toHaveBeenCalledTimes(1)
    })
})
