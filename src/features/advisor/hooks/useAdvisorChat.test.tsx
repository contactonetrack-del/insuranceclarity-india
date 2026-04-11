/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAdvisorChat } from './useAdvisorChat'

const { mockUsePathname } = vi.hoisted(() => ({
    mockUsePathname: vi.fn(() => '/tools/compare'),
}))

vi.mock('next/navigation', () => ({
    usePathname: mockUsePathname,
}))

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => {
        const messages: Record<string, string> = {
            'actions.calculatorGuide': 'Localized Calculator Guide',
            'actions.claimCases': 'Localized Claim Cases',
            'actions.expertGuides': 'Localized Expert Guides',
            'actions.hiddenFacts': 'Localized Hidden Facts',
            'actions.calculator': 'Localized Calculator',
            'actions.calculatePremium': 'Localized Calculate Premium',
        }

        return messages[key] ?? key
    },
}))

vi.mock('@/lib/auth-client', () => ({
    useAuthSession: () => ({ data: null }),
}))

vi.mock('@/lib/api-client', () => ({
    api: {
        advisor: {
            getHistory: vi.fn(),
            getHistoryDetail: vi.fn(),
            sendMessage: vi.fn(),
            saveHistory: vi.fn(),
        },
    },
}))

describe('useAdvisorChat', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        mockUsePathname.mockReturnValue('/tools/compare')
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('uses localized advisor action labels for the current route context', () => {
        const { result } = renderHook(() => useAdvisorChat())

        act(() => {
            vi.advanceTimersByTime(900)
        })

        expect(result.current.messages).toHaveLength(1)
        expect(result.current.messages[0]?.actions?.[0]?.label).toBe('Localized Expert Guides')
    })
})
