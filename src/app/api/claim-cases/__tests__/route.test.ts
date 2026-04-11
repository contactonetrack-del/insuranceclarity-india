import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from '../route'

const { mockFindAll } = vi.hoisted(() => ({
    mockFindAll: vi.fn(),
}))

const { mockIsExpectedDbFallbackError, mockGetDbFallbackErrorMessage } = vi.hoisted(() => ({
    mockIsExpectedDbFallbackError: vi.fn(),
    mockGetDbFallbackErrorMessage: vi.fn(() => 'db unavailable'),
}))

vi.mock('@/repositories/claim.repository', () => ({
    claimRepository: {
        findAll: mockFindAll,
    },
}))

vi.mock('@/lib/prisma-fallback', () => ({
    isExpectedDbFallbackError: mockIsExpectedDbFallbackError,
    getDbFallbackErrorMessage: mockGetDbFallbackErrorMessage,
}))

vi.mock('@/lib/logger', () => ({
    logger: {
        warn: vi.fn(),
        error: vi.fn(),
    },
}))

describe('GET /api/claim-cases', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockIsExpectedDbFallbackError.mockReturnValue(false)
    })

    it('loads claim cases via repository', async () => {
        mockFindAll.mockResolvedValue([{ id: 'case_1', title: 'Delayed settlement' }])

        const response = await GET()
        const json = await response.json()

        expect(response.status).toBe(200)
        expect(json).toEqual([{ id: 'case_1', title: 'Delayed settlement' }])
        expect(mockFindAll).toHaveBeenCalledTimes(1)
    })

    it('returns fallback empty list for expected db fallback errors', async () => {
        mockFindAll.mockRejectedValue(new Error('db offline'))
        mockIsExpectedDbFallbackError.mockReturnValue(true)

        const response = await GET()
        const json = await response.json()

        expect(response.status).toBe(200)
        expect(response.headers.get('x-data-source')).toBe('fallback')
        expect(json).toEqual([])
    })

    it('returns 500 for unexpected repository failures', async () => {
        mockFindAll.mockRejectedValue(new Error('unexpected'))

        const response = await GET()
        const json = await response.json()

        expect(response.status).toBe(500)
        expect(json).toEqual({ error: 'Failed to fetch claim cases' })
    })
})
