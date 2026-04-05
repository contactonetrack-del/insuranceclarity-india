import { NextResponse } from 'next/server';
import { indexes } from '@/lib/search/meilisearch';
import { redisClient } from '@/lib/cache/redis';
import { ensureMeilisearchProductionReady, getMeilisearchHost } from '@/lib/search/config';

export const dynamic = 'force-dynamic';

const SEARCH_CACHE_TTL_SECONDS = 60 * 5; // 5 minutes

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const indexName = (searchParams.get('index') as keyof typeof indexes) || 'products';

    if (!q) {
        return NextResponse.json({ hits: [] });
    }

    try {
        ensureMeilisearchProductionReady();

        // Validate index name
        if (!indexes[indexName]) {
            return NextResponse.json({ error: 'Invalid search index requested.' }, { status: 400 });
        }

        const cacheKey = `search:${indexName}:${q.toLowerCase().trim()}`;

        // Check cache first
        const cached = await redisClient.get<unknown>(cacheKey);
        if (cached !== null) {
            return NextResponse.json(cached);
        }

        // Execute search
        const results = await indexes[indexName].search(q, {
            limit: 12,
            attributesToHighlight: indexName === 'products'
                ? ['name', 'description', 'category']
                : ['title', 'content', 'fact'],
            highlightPreTag: '<mark>',
            highlightPostTag: '</mark>',
        });

        // Cache the response
        await redisClient.set(cacheKey, results, { ex: SEARCH_CACHE_TTL_SECONDS });

        return NextResponse.json(results);
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return NextResponse.json(
            {
                error: `Search service is currently unavailable. ${msg}`,
                host: getMeilisearchHost(),
            },
            { status: 503 }
        );
    }
}
