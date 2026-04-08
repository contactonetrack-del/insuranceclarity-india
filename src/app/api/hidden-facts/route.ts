/**
 * GET /api/hidden-facts
 *
 * Returns all hidden facts for the insurance knowledge base.
 *
 * Phase 11 Week 2: Implements response caching for improved performance.
 *
 * Returns: HiddenFact[]
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCachedResponse, cacheResponse } from '@/lib/cache/response-cache';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Phase 11 Week 2: Try to get cached response first
        const cacheKey = '/api/hidden-facts';
        const cachedResult = await getCachedResponse(cacheKey);

        if (cachedResult) {
            logger.info({
                action: 'hidden-facts.cache_hit',
                cacheKey,
            });

            return NextResponse.json(cachedResult, {
                headers: {
                    'X-Cache-Status': 'HIT',
                    'Cache-Control': 'public, max-age=1800, s-maxage=1800, stale-while-revalidate=3600',
                },
            });
        }

        // Cache miss - fetch from database
        const facts = await prisma.hiddenFact.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });

        logger.info({
            action: 'hidden-facts.cache_miss',
            factsCount: facts.length,
        });

        // Phase 11 Week 2: Cache the response for 30 minutes
        await cacheResponse(cacheKey, {}, facts, 1800);

        return NextResponse.json(facts, {
            headers: {
                'X-Cache-Status': 'MISS',
                'Cache-Control': 'public, max-age=1800, s-maxage=1800, stale-while-revalidate=3600',
            },
        });
    } catch (error) {
        logger.error({
            action: 'hidden-facts.error',
            error: error instanceof Error ? error.message : String(error),
        });

        return NextResponse.json({ error: 'Failed to fetch hidden facts' }, { status: 500 });
    }
}
