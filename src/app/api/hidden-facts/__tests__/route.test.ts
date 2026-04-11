import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from '../route'

const { mockGetCachedResponse, mockCacheResponse, mockFindAll } = vi.hoisted(() => ({
    mockGetCachedResponse: vi.fn(),
    mockCacheResponse: vi.fn(),
    mockFindAll: vi.fn(),
}))

vi.mock('@/lib/cache/response-cache', () => ({
    getCachedResponse: mockGetCachedResponse,
    cacheResponse: mockCacheResponse,
}))

vi.mock('@/repositories/hidden-fact.repository', () => ({
    hiddenFactRepository: {
        findAll: mockFindAll,
    },
}))

vi.mock('@/lib/logger', () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
    },
}))

describe('GET /api/hidden-facts', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockGetCachedResponse.mockResolvedValue(null)
        mockCacheResponse.mockResolvedValue(undefined)
    })

    it('returns cached hidden facts when cache entry exists', async () => {
        const cachedFacts = [{ id: 'fact_1', title: 'Cached Fact' }]
        mockGetCachedResponse.mockResolvedValue(cachedFacts)

        const response = await GET()
        const json = await response.json()

        expect(response.status).toBe(200)
        expect(response.headers.get('X-Cache-Status')).toBe('HIT')
        expect(json).toEqual(cachedFacts)
        expect(mockFindAll).not.toHaveBeenCalled()
    })

    it('loads from repository and stores cache on miss', async () => {
        const dbFacts = [{ id: 'fact_2', title: 'DB Fact' }]
        mockFindAll.mockResolvedValue(dbFacts)

        const response = await GET()
        const json = await response.json()

        expect(response.status).toBe(200)
        expect(response.headers.get('X-Cache-Status')).toBe('MISS')
        expect(json).toEqual(dbFacts)
        expect(mockFindAll).toHaveBeenCalledTimes(1)
        expect(mockCacheResponse).toHaveBeenCalledWith('/api/hidden-facts', {}, dbFacts, 1800)
    })

    it('returns 500 when repository read fails', async () => {
        mockFindAll.mockRejectedValue(new Error('db failed'))

        const response = await GET()
        const json = await response.json()

        expect(response.status).toBe(500)
        expect(json).toEqual({ error: 'Failed to fetch hidden facts' })
    })
})
