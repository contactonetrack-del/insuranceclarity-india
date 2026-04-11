import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '../route'

const { mockAuth } = vi.hoisted(() => ({
    mockAuth: vi.fn(),
}))

const { mockGetFunnelSummary } = vi.hoisted(() => ({
    mockGetFunnelSummary: vi.fn(),
}))

vi.mock('@/auth', () => ({
    auth: mockAuth,
}))

vi.mock('@/lib/analytics/funnel', () => ({
    getFunnelSummary: mockGetFunnelSummary,
}))

vi.mock('@/lib/logger', () => ({
    logger: {
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
    },
}))

describe('GET /api/analytics/funnel', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('returns forbidden for non-admin users', async () => {
        mockAuth.mockResolvedValue({ user: { role: 'USER' } })

        const response = await GET(new NextRequest('http://localhost:3000/api/analytics/funnel'))
        const json = await response.json()

        expect(response.status).toBe(403)
        expect(json).toMatchObject({
            success: false,
            error: {
                code: 'FORBIDDEN',
                message: 'Forbidden',
            },
        })
        expect(mockGetFunnelSummary).not.toHaveBeenCalled()
    })

    it('returns clamped days, totals, and conversion math for admins', async () => {
        mockAuth.mockResolvedValue({ user: { role: 'ADMIN' } })
        mockGetFunnelSummary.mockResolvedValue([
            { day: '2026-04-10', signup: 10, scan: 4, pay: 2, retain: 1 },
            { day: '2026-04-11', signup: 5, scan: 3, pay: 1, retain: 1 },
        ])

        const response = await GET(new NextRequest('http://localhost:3000/api/analytics/funnel?days=120'))
        const json = await response.json()

        expect(response.status).toBe(200)
        expect(mockGetFunnelSummary).toHaveBeenCalledWith(90)
        expect(json).toEqual({
            days: 90,
            totals: {
                signup: 15,
                scan: 7,
                pay: 3,
                retain: 2,
            },
            conversion: {
                signupToScan: 0.4667,
                scanToPay: 0.4286,
                payToRetain: 0.6667,
            },
            timeline: [
                { day: '2026-04-10', signup: 10, scan: 4, pay: 2, retain: 1 },
                { day: '2026-04-11', signup: 5, scan: 3, pay: 1, retain: 1 },
            ],
        })
    })
})
