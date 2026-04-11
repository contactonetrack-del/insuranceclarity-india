/**
 * GET /api/insurance/taxonomy
 *
 * Returns the complete insurance knowledge graph with categories,
 * subcategories, and product relationships.
 *
 * Phase 11 Week 2: Implements response caching for improved performance.
 *
 * Returns: { success: boolean, graph: KnowledgeGraph[] }
 */

import { NextResponse } from 'next/server';
import { getCachedResponse, cacheResponse } from '@/lib/cache/response-cache';
import { logger } from '@/lib/logger';
import { getTaxonomyGraph } from '@/services/taxonomy.service';

export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// Narrow types for the Prisma query result shapes used in this route.
// These are structural — not imported from Prisma generated types — because
// the query uses a custom `include` shape that doesn't align with the default
// generated types.
// ---------------------------------------------------------------------------

export async function GET() {
    try {
        const cacheKey = '/api/insurance/taxonomy';
        const cachedResult = await getCachedResponse(cacheKey);

        if (cachedResult) {
            logger.info({ action: 'insurance.taxonomy.cache_hit', cacheKey });
            return NextResponse.json(cachedResult, {
                headers: {
                    'X-Cache-Status': 'HIT',
                    'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
                },
            });
        }

        const { categoriesCount, graph: knowledgeGraph } = await getTaxonomyGraph();

        const responseData = { success: true, graph: knowledgeGraph };

        logger.info({
            action: 'insurance.taxonomy.cache_miss',
            categoriesCount,
            totalProducts: knowledgeGraph.reduce(
                (sum, cat) =>
                    sum + cat.subcategories.reduce((subSum, sub) => subSum + sub.products.length, 0),
                0,
            ),
        });

        await cacheResponse(cacheKey, {}, responseData, 3600);

        return NextResponse.json(responseData, {
            headers: {
                'X-Cache-Status': 'MISS',
                'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error({ action: 'insurance.taxonomy.error', error: message });
        return NextResponse.json(
            { success: false, error: 'Failed to retrieve the global taxonomy.' },
            { status: 500 },
        );
    }
}
