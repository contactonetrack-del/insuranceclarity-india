/**
 * GET /api/search?q=query&index=indexName
 *
 * Search across insurance products, hidden facts, and claim cases.
 *
 * Uses PostgreSQL-backed search for the public runtime path.
 *
 * Query parameters:
 * - q: Search query string
 * - index: Search index (products|hiddenFacts|claimCases)
 *
 * Returns: { hits: [], estimatedTotalHits: number, source: string }
 */

import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { getDbFallbackErrorMessage, isExpectedDbFallbackError } from '@/lib/prisma-fallback';
import { searchSiteIndexInDatabase, type SearchIndexName } from '@/lib/search/database-search';
import { getCachedResponse, cacheResponse } from '@/lib/cache/response-cache';

export const dynamic = 'force-dynamic';

const VALID_SEARCH_INDEXES: SearchIndexName[] = ['products', 'hiddenFacts', 'claimCases'];

type SearchPayload = {
    hits?: unknown[];
    estimatedTotalHits?: number;
    processingTimeMs?: number;
    query?: string;
    source: 'postgres' | 'fallback';
} & Record<string, unknown>;

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const indexName = (searchParams.get('index') as SearchIndexName) || 'products';

    if (!q) {
        return NextResponse.json({ hits: [] });
    }

    if (!VALID_SEARCH_INDEXES.includes(indexName)) {
        return NextResponse.json({ error: 'Invalid search index requested.' }, { status: 400 });
    }

    try {
        // Phase 11 Week 2: Try to get cached response first
        const cacheKey = `/api/search?q=${encodeURIComponent(q)}&index=${indexName}`;
        const cachedResult = await getCachedResponse(cacheKey);

        if (cachedResult) {
            logger.info({
                action: 'search.cache_hit',
                cacheKey,
                indexName,
            });

            return NextResponse.json(cachedResult, {
                headers: {
                    'X-Cache-Status': 'HIT',
                    'x-search-backend': 'cache',
                    'Cache-Control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=1800',
                },
            });
        }

        // Cache miss - perform search
        let payload: SearchPayload;
        let searchSource: 'postgres' | 'fallback' = 'fallback';

        try {
            const hits = await searchSiteIndexInDatabase(indexName, q, 12);
            payload = {
                hits,
                estimatedTotalHits: hits.length,
                processingTimeMs: 0,
                query: q,
                source: 'postgres',
            };
            searchSource = 'postgres';
        } catch (error) {
            if (isExpectedDbFallbackError(error)) {
                const message = getDbFallbackErrorMessage(error);
                if (process.env.NODE_ENV !== 'production') {
                    logger.warn({
                        action: 'search.database_fallback_skipped',
                        indexName,
                        error: message,
                    });
                }

                payload = {
                    hits: [],
                    estimatedTotalHits: 0,
                    processingTimeMs: 0,
                    query: q,
                    source: 'fallback',
                };
                searchSource = 'fallback';
            } else {
                throw error;
            }
        }

        logger.info({
            action: 'search.cache_miss',
            indexName,
            queryLength: q.length,
            hitsCount: Array.isArray(payload?.hits) ? payload.hits.length : 0,
            searchSource,
        });

        // Phase 11 Week 2: Cache the response for 10 minutes
        await cacheResponse(cacheKey, {}, payload, 600);

        return NextResponse.json(payload, {
            headers: {
                'X-Cache-Status': 'MISS',
                'x-search-backend': searchSource,
                'Cache-Control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=1800',
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error({
            action: 'search.unavailable',
            indexName,
            error: message,
        });

        return NextResponse.json({ hits: [], source: 'fallback' });
    }
}
