import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getAdminDashboardStats, getAdminLeads, updateLeadStatus } from './admin-actions'

const { mockAuth } = vi.hoisted(() => ({
    mockAuth: vi.fn(),
}))

const {
    mockGetAdminStatsData,
    mockGetRecentLeads,
    mockSetLeadStatus,
} = vi.hoisted(() => ({
    mockGetAdminStatsData: vi.fn(),
    mockGetRecentLeads: vi.fn(),
    mockSetLeadStatus: vi.fn(),
}))

vi.mock('@/auth', () => ({
    auth: mockAuth,
}))

vi.mock('@/services/admin.service', () => ({
    getAdminStatsData: mockGetAdminStatsData,
    getRecentLeads: mockGetRecentLeads,
    setLeadStatus: mockSetLeadStatus,
    getAdminJobHealthData: vi.fn(),
    getAdminBusinessReadinessData: vi.fn(),
}))

vi.mock('@/lib/logger', () => ({
    logger: {
        error: vi.fn(),
    },
}))

describe('admin-actions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('returns auth error when admin session is missing', async () => {
        mockAuth.mockResolvedValue(null)

        const result = await getAdminLeads()

        expect(result).toEqual({ error: 'Unauthenticated' })
        expect(mockGetRecentLeads).not.toHaveBeenCalled()
    })

    it('uses service boundaries for admin dashboard and lead operations', async () => {
        mockAuth.mockResolvedValue({ user: { role: 'ADMIN' } })
        mockGetAdminStatsData.mockResolvedValue({
            totalQuotes: 2,
            quotes: [
                { premiumAmount: 1000, coverageAmount: 200000, createdAt: new Date(), id: 'q1' },
                { premiumAmount: 500, coverageAmount: 150000, createdAt: new Date(), id: 'q2' },
            ],
            reportAgg: { _sum: { tokensUsed: 1500 } },
            activeSubscriptions: 3,
        })
        mockGetRecentLeads.mockResolvedValue([{ id: 'lead_1' }])
        mockSetLeadStatus.mockResolvedValue({ id: 'lead_1', status: 'CONTACTED' })

        const stats = await getAdminDashboardStats()
        const leads = await getAdminLeads()
        const updatedLead = await updateLeadStatus('lead_1', 'CONTACTED')

        expect(mockGetAdminStatsData).toHaveBeenCalledTimes(1)
        expect(mockGetRecentLeads).toHaveBeenCalledWith(100)
        expect(mockSetLeadStatus).toHaveBeenCalledWith('lead_1', 'CONTACTED')
        expect(stats).toMatchObject({
            totalQuotes: 2,
            totalPremium: 1500,
            totalCoverage: 350000,
            totalTokens: 1500,
            activeSubscriptions: 3,
        })
        expect(leads).toEqual([{ id: 'lead_1' }])
        expect(updatedLead).toEqual({ id: 'lead_1', status: 'CONTACTED' })
    })
})
