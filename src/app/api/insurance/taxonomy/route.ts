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

import { NextResponse } from "next/server";
import { getCachedResponse, cacheResponse } from '@/lib/cache/response-cache';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Phase 11 Week 2: Try to get cached response first
        const cacheKey = '/api/insurance/taxonomy';
        const cachedResult = await getCachedResponse(cacheKey);

        if (cachedResult) {
            logger.info({
                action: 'insurance.taxonomy.cache_hit',
                cacheKey,
            });

            return NextResponse.json(cachedResult, {
                headers: {
                    'X-Cache-Status': 'HIT',
                    'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
                },
            });
        }

        // Cache miss - fetch from database
        const { prisma } = await import("@/lib/prisma");

        const categories = await (prisma as any).insuranceCategory.findMany({
            include: {
                subcat: {
                    include: {
                        types: {
                            include: {
                                relatedTo: true,
                                relatedFrom: true
                            }
                        }
                    }
                }
            }
        });

        // Shape the data for the knowledge graph
        const knowledgeGraph = categories.map((cat: any) => ({
            id: cat.id,
            category: cat.name,
            slug: cat.slug,
            subcategories: cat.subcat.map((sub: any) => ({
                id: sub.id,
                name: sub.name,
                products: sub.types.map((type: any) => ({
                    id: type.id,
                    name: type.name,
                    links_to: type.relatedTo.map((rel: any) => ({
                        typeId: rel.toId,
                        relation: rel.relationType
                    })),
                    links_from: type.relatedFrom.map((rel: any) => ({
                        typeId: rel.fromId,
                        relation: rel.relationType
                    }))
                }))
            }))
        }));

        const responseData = { success: true, graph: knowledgeGraph };

        logger.info({
            action: 'insurance.taxonomy.cache_miss',
            categoriesCount: categories.length,
            totalProducts: knowledgeGraph.reduce((sum: number, cat: any) =>
                sum + cat.subcategories.reduce((subSum: number, sub: any) =>
                    subSum + sub.products.length, 0), 0),
        });

        // Phase 11 Week 2: Cache the response for 1 hour
        await cacheResponse(cacheKey, {}, responseData, 3600);

        return NextResponse.json(responseData, {
            headers: {
                'X-Cache-Status': 'MISS',
                'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
            },
        });

    } catch (error: any) {
        logger.error({
            action: 'insurance.taxonomy.error',
            error: error.message,
        });

        return NextResponse.json(
            { success: false, error: "Failed to retrieve the global taxonomy." },
            { status: 500 }
        );
    }
}
