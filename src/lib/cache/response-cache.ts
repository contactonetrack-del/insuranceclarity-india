/**
 * Response Cache — API Response Caching Layer
 *
 * Phase 11 Week 2: Implements Redis-based response caching for GET endpoints.
 * Reduces database load and improves response times for frequently accessed data.
 *
 * Cache strategy:
 *   Key      : response:v1:<endpoint>:<params_hash>
 *   TTL      : Configurable per endpoint (default 5 minutes)
 *   Backend  : Upstash Redis (HTTP-based, serverless-safe)
 *   Fallback : If Redis unavailable, serves fresh data
 *
 * Performance impact:
 *   - Cache hit: ~5ms response time
 *   - Cache miss: Normal database query time
 *   - Target hit rate: >70% for cached endpoints
 */

import { createHash } from 'node:crypto';
import { redisClient } from '@/lib/cache/redis';
import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';

const RESPONSE_CACHE_VERSION = 'v1';
const DEFAULT_TTL_SECONDS = 300; // 5 minutes

// ─── Key Builder ──────────────────────────────────────────────────────────────

function buildCacheKey(endpoint: string, params: Record<string, unknown>): string {
    // Create deterministic hash of parameters
    const paramsString = JSON.stringify(params, Object.keys(params).sort());
    const paramsHash = createHash('sha256').update(paramsString).digest('hex').slice(0, 16);

    return `response:${RESPONSE_CACHE_VERSION}:${endpoint}:${paramsHash}`;
}

// ─── Cache Configuration ──────────────────────────────────────────────────────

interface CacheConfig {
    ttl?: number;        // TTL in seconds (default: 300)
    enabled?: boolean;   // Whether caching is enabled (default: true)
    varyBy?: string[];   // Request headers to vary cache by (e.g., ['user-agent'])
}

const endpointCacheConfig: Record<string, CacheConfig> = {
    // Health endpoints - cache for 1 minute
    '/api/health/plans': { ttl: 60 },

    // Taxonomy endpoints - cache for 1 hour (rarely changes)
    '/api/insurance/taxonomy': { ttl: 3600 },

    // Hidden facts - cache for 30 minutes
    '/api/hidden-facts': { ttl: 1800 },

    // Search results - cache for 10 minutes (with user context)
    '/api/search': { ttl: 600, varyBy: ['user-id'] },

    // Claims search - cache for 15 minutes
    '/api/search/claims': { ttl: 900 },

    // User calculations - cache for 5 minutes (personalized)
    '/api/user/calculations': { ttl: 300, varyBy: ['user-id'] },
};

// ─── Cache API ────────────────────────────────────────────────────────────────

/**
 * Get cached response data for a GET endpoint.
 * Returns null on cache miss or if caching is disabled.
 */
export async function getCachedResponse<T = unknown>(
    endpoint: string,
    params: Record<string, unknown> = {}
): Promise<T | null> {
    if (!redisClient.isConfigured()) return null;

    const config = endpointCacheConfig[endpoint];
    if (!config?.enabled && config?.enabled !== undefined) return null;

    const key = buildCacheKey(endpoint, params);

    try {
        const cached = await redisClient.get<T>(key);

        if (cached !== null) {
            logger.info({
                action: 'responseCache.hit',
                endpoint,
                key,
                cacheVersion: RESPONSE_CACHE_VERSION,
            });
        }

        return cached;
    } catch (err) {
        logger.warn({
            action: 'responseCache.get.error',
            endpoint,
            error: String(err),
        });
        return null;
    }
}

/**
 * Cache response data for a GET endpoint.
 * Silently no-ops if Redis is not configured or caching disabled.
 */
export async function cacheResponse<T = unknown>(
    endpoint: string,
    params: Record<string, unknown>,
    data: T,
    customTtl?: number
): Promise<void> {
    if (!redisClient.isConfigured()) return;

    const config = endpointCacheConfig[endpoint];
    if (!config?.enabled && config?.enabled !== undefined) return;

    const ttl = customTtl || config?.ttl || DEFAULT_TTL_SECONDS;
    const key = buildCacheKey(endpoint, params);

    try {
        await redisClient.set(key, data, { ex: ttl });

        logger.info({
            action: 'responseCache.set',
            endpoint,
            ttlSeconds: ttl,
            key,
        });
    } catch (err) {
        logger.warn({
            action: 'responseCache.set.error',
            endpoint,
            error: String(err),
        });
    }
}

/**
 * Invalidate cached responses for an endpoint (e.g., after data changes).
 */
export async function invalidateEndpointCache(endpoint: string): Promise<void> {
    if (!redisClient.isConfigured()) return;

    try {
        const pattern = `response:${RESPONSE_CACHE_VERSION}:${endpoint}:*`;
        const keys = await redisClient.keys(pattern);

        if (keys.length > 0) {
            // Redis doesn't have a direct DEL with pattern, so we delete individually
            await Promise.all(keys.map(key => redisClient.del(key)));

            logger.info({
                action: 'responseCache.invalidate',
                endpoint,
                keysInvalidated: keys.length,
            });
        }
    } catch (err) {
        logger.warn({
            action: 'responseCache.invalidate.error',
            endpoint,
            error: String(err),
        });
    }
}

// ─── Next.js Integration ──────────────────────────────────────────────────────

/**
 * Higher-order function to add caching to Next.js API routes.
 * Wraps GET handlers with automatic caching logic.
 */
export function withResponseCache<T extends Record<string, unknown>>(
    handler: (request: NextRequest, context: T) => Promise<NextResponse>,
    endpoint: string
) {
    return async (request: NextRequest, context: T): Promise<NextResponse> => {
        // Only cache GET requests
        if (request.method !== 'GET') {
            return handler(request, context);
        }

        const config = endpointCacheConfig[endpoint];
        if (!config?.enabled && config?.enabled !== undefined) {
            return handler(request, context);
        }

        // Build cache parameters from request
        const params: Record<string, unknown> = {};

        // Add query parameters
        const url = new URL(request.url);
        url.searchParams.forEach((value, key) => {
            params[key] = value;
        });

        // Add headers specified in varyBy
        if (config?.varyBy) {
            config.varyBy.forEach(header => {
                const value = request.headers.get(header);
                if (value) params[`header_${header}`] = value;
            });
        }

        // Try to get cached response
        const cachedData = await getCachedResponse(endpoint, params);
        if (cachedData !== null) {
            return NextResponse.json(cachedData, {
                headers: {
                    'X-Cache-Status': 'HIT',
                    'X-Cache-TTL': String(config?.ttl || DEFAULT_TTL_SECONDS),
                },
            });
        }

        // Cache miss - execute handler
        const response = await handler(request, context);

        // Only cache successful JSON responses
        if (response.status === 200 && response.headers.get('content-type')?.includes('application/json')) {
            try {
                const data = await response.clone().json();
                await cacheResponse(endpoint, params, data);
            } catch (err) {
                // If we can't parse the response, don't cache it
                logger.warn({
                    action: 'responseCache.parse.error',
                    endpoint,
                    error: String(err),
                });
            }
        }

        // Add cache status header
        const newResponse = new NextResponse(response.body, response);
        newResponse.headers.set('X-Cache-Status', 'MISS');

        return newResponse;
    };
}

/**
 * Get cache statistics for monitoring.
 */
export async function getCacheStats(): Promise<{
    configured: boolean;
    hitRate?: number;
    totalKeys?: number;
}> {
    const configured = redisClient.isConfigured();

    if (!configured) {
        return { configured: false };
    }

    try {
        const keys = await redisClient.keys('response:v1:*');
        return {
            configured: true,
            totalKeys: keys.length,
        };
    } catch (_err) {
        return {
            configured: true,
            // hitRate calculation would require additional tracking
        };
    }
}
