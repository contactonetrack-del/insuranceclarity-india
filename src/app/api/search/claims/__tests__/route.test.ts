import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '../route'

const { mockClaimSearch } = vi.hoisted(() => ({
    mockClaimSearch: vi.fn(),
}))

const { mockIsExpectedDbFallbackError, mockGetDbFallbackErrorMessage } = vi.hoisted(() => ({
    mockIsExpectedDbFallbackError: vi.fn(),
    mockGetDbFallbackErrorMessage: vi.fn(() => 'db unavailable'),
}))

vi.mock('@/repositories/claim.repository', () => ({
    claimRepository: {
        search: mockClaimSearch,
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

describe('GET /api/search/claims', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockIsExpectedDbFallbackError.mockReturnValue(false)
    })

    it('uses repository search with query and category filters', async () => {
        mockClaimSearch.mockResolvedValue([{ id: 'claim_1', title: 'Case A' }])
        const request = new NextRequest('http://localhost:3000/api/search/claims?q=heart&category=Health%20Insurance')

        const response = await GET(request)
        const json = await response.json()

        expect(response.status).toBe(200)
        expect(json).toEqual([{ id: 'claim_1', title: 'Case A' }])
        expect(mockClaimSearch).toHaveBeenCalledWith({ query: 'heart', category: 'Health Insurance', limit: 20 })
    })

    it('returns fallback empty array for expected db fallback errors', async () => {
        mockClaimSearch.mockRejectedValue(new Error('db offline'))
        mockIsExpectedDbFallbackError.mockReturnValue(true)

        const request = new NextRequest('http://localhost:3000/api/search/claims')
        const response = await GET(request)
        const json = await response.json()

        expect(response.status).toBe(200)
        expect(response.headers.get('x-data-source')).toBe('fallback')
        expect(json).toEqual([])
    })
})
