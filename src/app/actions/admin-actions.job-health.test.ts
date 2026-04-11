import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getAdminBusinessReadiness, getAdminJobHealth } from './admin-actions'

const { mockAuth } = vi.hoisted(() => ({
    mockAuth: vi.fn(),
}))

const { mockGetAdminJobHealthData } = vi.hoisted(() => ({
    mockGetAdminJobHealthData: vi.fn(),
}))

const { mockGetAdminBusinessReadinessData } = vi.hoisted(() => ({
    mockGetAdminBusinessReadinessData: vi.fn(),
}))

vi.mock('@/auth', () => ({
    auth: mockAuth,
}))

vi.mock('@/services/admin.service', () => ({
    getAdminStatsData: vi.fn(),
    getRecentLeads: vi.fn(),
    setLeadStatus: vi.fn(),
    getAdminJobHealthData: mockGetAdminJobHealthData,
    getAdminBusinessReadinessData: mockGetAdminBusinessReadinessData,
}))

vi.mock('@/lib/logger', () => ({
    logger: {
        error: vi.fn(),
    },
}))

describe('admin-actions getAdminJobHealth', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('returns auth error when session is missing', async () => {
        mockAuth.mockResolvedValue(null)

        const result = await getAdminJobHealth()

        expect(result).toEqual({ error: 'Unauthenticated' })
        expect(mockGetAdminJobHealthData).not.toHaveBeenCalled()
    })

    it('returns job health payload for admin users', async () => {
        mockAuth.mockResolvedValue({ user: { role: 'ADMIN' } })
        mockGetAdminJobHealthData.mockResolvedValue({
            pendingPaymentReconciliation: 0,
            staleCreatedPayments: 0,
            staleScans: 1,
            deadLetterJobs: 0,
            recentCronErrors1h: 1,
            recentCronErrors24h: 0,
            recentCronErrors7d: 2,
            recentQueueErrors1h: 0,
            recentQueueErrors24h: 2,
            recentQueueErrors7d: 5,
            cronHourlyBaseline24h: 0,
            queueHourlyBaseline24h: 0.08,
            cronDailyBaseline7d: 0.29,
            queueDailyBaseline7d: 0.71,
            cronSpike: false,
            queueSpike: false,
            cronAlertLevel: 'warning',
            queueAlertLevel: 'ok',
            queueProvider: 'http',
            redisConfigured: false,
            generatedAt: '2026-04-11T00:00:00.000Z',
        })

        const result = await getAdminJobHealth()

        expect(mockGetAdminJobHealthData).toHaveBeenCalledTimes(1)
        expect(result).toEqual({
            pendingPaymentReconciliation: 0,
            staleCreatedPayments: 0,
            staleScans: 1,
            deadLetterJobs: 0,
            recentCronErrors1h: 1,
            recentCronErrors24h: 0,
            recentCronErrors7d: 2,
            recentQueueErrors1h: 0,
            recentQueueErrors24h: 2,
            recentQueueErrors7d: 5,
            cronHourlyBaseline24h: 0,
            queueHourlyBaseline24h: 0.08,
            cronDailyBaseline7d: 0.29,
            queueDailyBaseline7d: 0.71,
            cronSpike: false,
            queueSpike: false,
            cronAlertLevel: 'warning',
            queueAlertLevel: 'ok',
            queueProvider: 'http',
            redisConfigured: false,
            generatedAt: '2026-04-11T00:00:00.000Z',
        })
    })
})

describe('admin-actions getAdminBusinessReadiness', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('returns auth error when session is missing', async () => {
        mockAuth.mockResolvedValue(null)

        const result = await getAdminBusinessReadiness()

        expect(result).toEqual({ error: 'Unauthenticated' })
        expect(mockGetAdminBusinessReadinessData).not.toHaveBeenCalled()
    })

    it('returns business readiness payload for admin users', async () => {
        mockAuth.mockResolvedValue({ user: { role: 'ADMIN' } })
        mockGetAdminBusinessReadinessData.mockResolvedValue({
            days: 30,
            totals: { signup: 10, scan: 6, pay: 3, retain: 2 },
            conversion: { signupToScan: 0.6, scanToPay: 0.5, payToRetain: 0.6667 },
            supporting: {
                totalLeads: 45,
                scansInWindow: 18,
                capturedPaymentsInWindow: 9,
                activeSubscriptions: 4,
            },
            generatedAt: '2026-04-11T00:00:00.000Z',
        })

        const result = await getAdminBusinessReadiness(30)

        expect(mockGetAdminBusinessReadinessData).toHaveBeenCalledWith(30)
        expect(result).toEqual({
            days: 30,
            totals: { signup: 10, scan: 6, pay: 3, retain: 2 },
            conversion: { signupToScan: 0.6, scanToPay: 0.5, payToRetain: 0.6667 },
            supporting: {
                totalLeads: 45,
                scansInWindow: 18,
                capturedPaymentsInWindow: 9,
                activeSubscriptions: 4,
            },
            generatedAt: '2026-04-11T00:00:00.000Z',
        })
    })
})
