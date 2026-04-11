'use server'

import { logger } from '@/lib/logger';
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
    const matchType: MatchResult['matchType'] = 'keyword';
    const queryLength = query.trim().length;

    try {
        if (!query || query.trim().length < 3) {
            return [];
        }

        const databaseMatches = await findInsuranceProductMatchesInDatabase(query, maxResults);
        const topMatches = databaseMatches.map((match) => {
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
                matchReason: `Catalog relevance match (${confidence}%).`,
                matchType,
            } satisfies MatchResult;
        });

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
