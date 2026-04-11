import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import {
    cacheResponse,
    getCachedResponse,
    getCacheStats,
    invalidateEndpointCache,
    withResponseCache,
} from './response-cache';

const {
    mockRedisGet,
    mockRedisSet,
    mockRedisKeys,
    mockRedisDel,
    mockRedisConfigured,
    mockInfo,
    mockWarn,
} = vi.hoisted(() => ({
    mockRedisGet: vi.fn(),
    mockRedisSet: vi.fn(),
    mockRedisKeys: vi.fn(),
    mockRedisDel: vi.fn(),
    mockRedisConfigured: vi.fn(),
    mockInfo: vi.fn(),
    mockWarn: vi.fn(),
}));

vi.mock('@/lib/cache/redis', () => ({
    redisClient: {
        get: mockRedisGet,
        set: mockRedisSet,
        keys: mockRedisKeys,
        del: mockRedisDel,
        isConfigured: mockRedisConfigured,
    },
}));

vi.mock('@/lib/logger', () => ({
    logger: {
        info: mockInfo,
        warn: mockWarn,
    },
}));

describe('lib/cache/response-cache', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockRedisConfigured.mockReturnValue(true);
    });

    it('returns cached data and records cache hits', async () => {
        mockRedisGet.mockResolvedValue({ success: true });

        await expect(getCachedResponse('/api/hidden-facts', { page: '1' })).resolves.toEqual({ success: true });
        expect(mockInfo).toHaveBeenCalledWith(
            expect.objectContaining({ action: 'responseCache.hit', endpoint: '/api/hidden-facts' }),
        );
    });

    it('writes cache entries with endpoint TTL or a custom TTL override', async () => {
        await cacheResponse('/api/hidden-facts', { slug: 'demo' }, { ok: true });
        await cacheResponse('/api/hidden-facts', { slug: 'demo' }, { ok: true }, 45);

        expect(mockRedisSet).toHaveBeenNthCalledWith(
            1,
            expect.stringMatching(/^response:v1:\/api\/hidden-facts:/),
            { ok: true },
            { ex: 1800 },
        );
        expect(mockRedisSet).toHaveBeenNthCalledWith(
            2,
            expect.any(String),
            { ok: true },
            { ex: 45 },
        );
    });

    it('invalidates cache entries for an endpoint', async () => {
        mockRedisKeys.mockResolvedValue(['response:v1:/api/search:key-a', 'response:v1:/api/search:key-b']);

        await invalidateEndpointCache('/api/search');

        expect(mockRedisDel).toHaveBeenCalledTimes(2);
        expect(mockInfo).toHaveBeenCalledWith(
            expect.objectContaining({ action: 'responseCache.invalidate', endpoint: '/api/search', keysInvalidated: 2 }),
        );
    });

    it('serves cached responses on cache hits for GET handlers', async () => {
        mockRedisGet.mockResolvedValue({ payload: 'cached' });
        const handler = vi.fn().mockResolvedValue(NextResponse.json({ payload: 'fresh' }));
        const wrapped = withResponseCache(handler, '/api/search');
        const request = new NextRequest('http://localhost:3000/api/search?q=term', {
            method: 'GET',
            headers: { 'user-id': 'user_1' },
        });

        const response = await wrapped(request, {});

        expect(handler).not.toHaveBeenCalled();
        expect(await response.json()).toEqual({ payload: 'cached' });
        expect(response.headers.get('X-Cache-Status')).toBe('HIT');
    });

    it('caches successful JSON misses and marks them as misses', async () => {
        mockRedisGet.mockResolvedValue(null);
        const handler = vi.fn().mockResolvedValue(NextResponse.json({ payload: 'fresh' }));
        const wrapped = withResponseCache(handler, '/api/search');
        const request = new NextRequest('http://localhost:3000/api/search?q=term', {
            method: 'GET',
            headers: { 'user-id': 'user_1' },
        });

        const response = await wrapped(request, {});

        expect(handler).toHaveBeenCalledTimes(1);
        expect(await response.json()).toEqual({ payload: 'fresh' });
        expect(response.headers.get('X-Cache-Status')).toBe('MISS');
        expect(mockRedisSet).toHaveBeenCalledWith(
            expect.stringMatching(/^response:v1:\/api\/search:/),
            { payload: 'fresh' },
            { ex: 600 },
        );
    });

    it('bypasses cache logic for non-GET requests', async () => {
        const handler = vi.fn().mockResolvedValue(NextResponse.json({ ok: true }, { status: 201 }));
        const wrapped = withResponseCache(handler, '/api/search');
        const request = new NextRequest('http://localhost:3000/api/search', { method: 'POST' });

        const response = await wrapped(request, {});

        expect(handler).toHaveBeenCalledTimes(1);
        expect(await response.json()).toEqual({ ok: true });
        expect(mockRedisGet).not.toHaveBeenCalled();
    });

    it('reports cache stats from redis when configured', async () => {
        mockRedisKeys.mockResolvedValue(['response:v1:/api/search:key-a']);
        await expect(getCacheStats()).resolves.toEqual({ configured: true, totalKeys: 1 });

        mockRedisConfigured.mockReturnValue(false);
        await expect(getCacheStats()).resolves.toEqual({ configured: false });
    });
});
