import { NextResponse } from 'next/server';
import { indexes } from '@/lib/search/meilisearch';
import { getOrSetCache } from '@/lib/cache/redis';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const indexName = (searchParams.get('index') as keyof typeof indexes) || 'products';

    if (!q) {
        return NextResponse.json({ hits: [] });
    }

    try {
        // Validate index name
        if (!indexes[indexName]) {
            return NextResponse.json({ error: 'Invalid search index requested.' }, { status: 400 });
        }

        const cacheKey = `search:${indexName}:${q.toLowerCase().trim()}`;

        const results = await getOrSetCache(cacheKey, 60 * 5, async () => {
            return await indexes[indexName].search(q, {
                limit: 12,
                attributesToHighlight: indexName === 'products'
                    ? ['name', 'description', 'category']
                    : ['title', 'content', 'fact'],
                highlightPreTag: '<mark>',
                highlightPostTag: '</mark>',
            });
        });

        return NextResponse.json(results);
    } catch (error) {
        console.error('Search API Error:', error);
        return NextResponse.json(
            { error: 'Search service is currently unavailable.' },
            { status: 503 }
        );
    }
}
