'use server'

import { indexes } from '@/lib/search/meilisearch';
import { generateEmbedding } from './embedding.service';
import { logger } from '@/lib/logger';
import { ensureMeilisearchProductionReady, getSearchBackend } from '@/lib/search/config';
import { findInsuranceProductMatchesInDatabase } from '@/lib/search/database-search';

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

function normalizeConfidence(score: number): number {
    return Math.min(95, Math.max(45, Math.round(score)));
}

export async function findBestMatches(query: string, maxResults: number = 3): Promise<MatchResult[]> {
    const startTime = Date.now();
    let matchType: MatchResult['matchType'] = 'keyword';
    const queryLength = query.trim().length;

    try {
        if (!query || query.trim().length < 3) {
            return [];
        }

        const backend = getSearchBackend();
        let topMatches: MatchResult[] = [];

        if (backend !== 'postgres') {
            try {
                ensureMeilisearchProductionReady();

                let vector: number[] | undefined;
                try {
                    vector = await generateEmbedding(query);
                    matchType = 'hybrid';
                } catch (embeddingError) {
                    logger.warn({
                        signal: 'ai_matcher.embedding_failed',
                        error: embeddingError instanceof Error ? embeddingError.message : String(embeddingError),
                        queryLength,
                    });
                    matchType = 'keyword';
                }

                const searchResult = await indexes.products.search<InsuranceProduct>(query, {
                    limit: maxResults,
                    vector,
                    hybrid: vector ? { semanticRatio: 0.7, embedder: 'default' } : undefined,
                    showRankingScore: true,
                });

                topMatches = (searchResult.hits ?? []).map((hit) => {
                    const confidence = normalizeConfidence((hit._rankingScore ?? 0.5) * 100);
                    const reason = matchType === 'hybrid'
                        ? `Semantic analysis found a strong contextual match (${confidence}%).`
                        : `Keyword matching found a strong terminology match (${confidence}%).`;

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
                    } satisfies MatchResult;
                });
            } catch (error) {
                logger.warn({
                    action: 'ai_matcher.meilisearch_unavailable',
                    backend,
                    error: error instanceof Error ? error.message : String(error),
                    queryLength,
                });
            }
        }

        if (topMatches.length === 0) {
            const databaseMatches = await findInsuranceProductMatchesInDatabase(query, maxResults);
            topMatches = databaseMatches.map((match) => {
                const confidence = normalizeConfidence(match.score);

                return {
                    product: {
                        id: match.id,
                        name: match.name,
                        sector: match.category,
                        category: match.category,
                        subcategory: match.subcategory,
                        description: match.description,
                        coveragePurpose: match.benefits[0] || '',
                        riskType: match.exclusions[0] || '',
                    },
                    score: confidence,
                    matchReason: `Database-backed relevance match (${confidence}%).`,
                    matchType: 'keyword',
                } satisfies MatchResult;
            });
            matchType = 'keyword';
        }

        const duration = Date.now() - startTime;
        logger.info({
            action: 'ai_matcher.complete',
            matchType,
            resultsFound: topMatches.length,
            queryLength,
            ms: duration,
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
