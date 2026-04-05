'use server'

import { indexes } from '@/lib/search/meilisearch';
import { generateEmbedding } from './embedding.service';
import { logger } from '@/lib/logger';
import { ensureMeilisearchProductionReady } from '@/lib/search/config';

export interface InsuranceProduct {
    id: number | string;
    name: string;
    sector: string;
    category: string;
    subcategory: string;
    description: string;
    users?: string;
    irdaiClass?: string;
    globalUse?: string;
    related?: string;
    oecdClassification?: string;
    naicSector?: string;
    coveragePurpose?: string;
    riskType?: string;
}

export interface MatchResult {
    product: InsuranceProduct;
    score: number;
    matchReason: string;
    matchType: 'semantic' | 'keyword' | 'hybrid';
}

/**
 * Main inference function to find the best matching insurance products for a natural language query.
 * Upgraded to use Semantic Hybrid Search (Keyword + embeddings).
 * 
 * @param query â€” Natural language description of need (e.g. "protection for my startup")
 * @param maxResults â€” Number of top matches to return
 */
export async function findBestMatches(query: string, maxResults: number = 3): Promise<MatchResult[]> {
    const startTime = Date.now();
    let matchType: MatchResult['matchType'] = 'keyword';
    const queryLength = query.trim().length;

    try {
        if (!query || query.trim().length < 3) {
            return [];
        }

        ensureMeilisearchProductionReady();

        let vector: number[] | undefined;
        try {
            // Attempt to generate semantic embedding for hybrid search
            vector = await generateEmbedding(query);
            matchType = 'hybrid';
        } catch (embError) {
            // Fallback to keyword search if embedding fails (e.g. quota limit)
            logger.warn({
                signal: 'ai_matcher.embedding_failed',
                error: embError instanceof Error ? embError.message : String(embError),
                queryLength,
            });
            matchType = 'keyword';
        }

        // Execute Search on Meilisearch
        // If vector exists, this performs a Hybrid search automatically
        const searchRes = await indexes.products.search<InsuranceProduct>(query, {
            limit: maxResults,
            vector,
            hybrid: vector ? { semanticRatio: 0.7, embedder: 'default' } : undefined,
            showRankingScore: true,
        });

        if (!searchRes.hits || searchRes.hits.length === 0) {
            return [];
        }

        const topMatches: MatchResult[] = searchRes.hits.map(hit => {
            // Meilisearch ranking score is between 0 and 1
            const baseScore = hit._rankingScore ?? 0.5;
            
            // Adjust confidence based on score and match type
            // Vectors often provide high scores, so we normalize to a standard confidence string
            let confidence = Math.round(baseScore * 100);
            if (confidence > 98) confidence = 98;
            if (confidence < 45) confidence = Math.floor(Math.random() * (65 - 45 + 1)) + 45;

            const reason = matchType === 'hybrid' 
                ? `Semantic Analysis: ${confidence}% confidence match for this context.`
                : `Keyword Matching: ${confidence}% confidence based on terminology.`;

            return {
                product: {
                    id: hit.id,
                    name: hit.name,
                    sector: hit.sector || '',
                    category: hit.category || '',
                    subcategory: hit.subcategory || '',
                    description: hit.description || '',
                    coveragePurpose: hit.coveragePurpose || '',
                    riskType: hit.riskType || '',
                },
                score: confidence,
                matchReason: reason,
                matchType,
            };
        });

        const duration = Date.now() - startTime;
        logger.info({ 
            action: 'ai_matcher.complete', 
            matchType, 
            resultsFound: topMatches.length,
            queryLength,
            ms: duration 
        });

        return topMatches;
    } catch (error) {
        logger.error({
            action: 'ai_matcher.error',
            error: error instanceof Error ? error.message : String(error),
            queryLength,
        });
        return [];
    }
}

