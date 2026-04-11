/**
 * database-search.ts
 *
 * PostgreSQL-backed search with two layers:
 * 1. Native full-text ranking via `to_tsvector` / `websearch_to_tsquery`
 * 2. Deterministic in-process scoring as a fallback tie-breaker
 *
 * This keeps `/api/search` on Postgres today while preparing the schema for
 * pg_trgm/pgvector rollout in the database layer.
 */

import {
    searchRepository,
} from '@/repositories/search.repository';

export type SearchIndexName = 'products' | 'hiddenFacts' | 'claimCases';

export interface SearchHit {
    id: string;
    type: 'insurance' | 'fact' | 'claim';
    title: string;
    description: string;
    href: string;
    category?: string;
    score: number;
}

export interface ProductSearchMatch {
    id: string;
    name: string;
    description: string;
    href: string;
    category: string;
    subcategory: string;
    score: number;
    benefits: string[];
    exclusions: string[];
}

function normalizeQuery(query: string): string {
    return query.trim().toLowerCase();
}

function tokenize(query: string): string[] {
    return Array.from(new Set(normalizeQuery(query).split(/\s+/).filter(Boolean)));
}

function escapeLikePattern(value: string): string {
    return value.replace(/[\\%_]/g, '\\$&');
}

function scoreMatch(haystack: string, normalizedQuery: string, tokens: string[]): number {
    const h = haystack.toLowerCase();
    let score = 0;

    if (h === normalizedQuery) score += 120;
    else if (h.startsWith(normalizedQuery)) score += 70;
    else if (h.includes(normalizedQuery)) score += 45;

    for (const token of tokens) {
        if (h.includes(token)) {
            score += token.length > 3 ? 12 : 6;
        }
    }

    return score;
}

function scoreFromRank(rank: number | null | undefined, haystack: string, normalizedQuery: string, tokens: string[]): number {
    const normalizedRank = Number.isFinite(rank) ? Math.round((rank ?? 0) * 1000) : 0;
    return normalizedRank + scoreMatch(haystack, normalizedQuery, tokens);
}

function byScoreDescending<T extends { score: number; title?: string; name?: string }>(
    left: T,
    right: T,
): number {
    if (right.score !== left.score) return right.score - left.score;
    const l = left.title ?? left.name ?? '';
    const r = right.title ?? right.name ?? '';
    return l.localeCompare(r);
}

function getExpandedLimit(limit: number): number {
    return Math.max(limit * 4, 24);
}

async function findInsuranceProductMatchesFallback(
    query: string,
    limit: number,
): Promise<ProductSearchMatch[]> {
    const normalizedQuery = normalizeQuery(query);
    if (!normalizedQuery) return [];

    const tokens = tokenize(query);

    const policies = await searchRepository.findInsurancePoliciesByQuery(normalizedQuery, getExpandedLimit(limit));

    return policies
        .map((policy) => {
            const category = policy.type.subcategory.category.name;
            const subcategory = policy.type.subcategory.name;
            const typeName = policy.type.name;
            const name = `${policy.providerName} ${policy.productName}`.trim();
            const benefitsSummary = policy.benefits.slice(0, 2).join(', ');
            const description = benefitsSummary || `${typeName} coverage from ${policy.providerName}`;

            const haystack = [
                name,
                policy.providerName,
                policy.productName,
                policy.seoSlug,
                typeName,
                subcategory,
                category,
                ...policy.benefits,
                ...policy.exclusions,
            ].join(' ');

            return {
                id: policy.id,
                name,
                description,
                href: `/insurance/${policy.seoSlug}`,
                category,
                subcategory,
                score: scoreMatch(haystack, normalizedQuery, tokens),
                benefits: policy.benefits,
                exclusions: policy.exclusions,
            } satisfies ProductSearchMatch;
        })
        .filter((match) => match.score > 0)
        .sort(byScoreDescending)
        .slice(0, limit);
}

async function searchHiddenFactsFallback(query: string, limit: number): Promise<SearchHit[]> {
    const normalizedQuery = normalizeQuery(query);
    if (!normalizedQuery) return [];

    const tokens = tokenize(query);

    const facts = await searchRepository.findHiddenFactsByQuery(normalizedQuery, getExpandedLimit(limit));

    return facts
        .map((fact) => {
            const haystack = [
                fact.title,
                fact.category,
                fact.description,
                fact.realCase,
                fact.whatToCheck,
                ...fact.affectedPolicies,
            ].join(' ');

            return {
                id: fact.id,
                type: 'fact',
                title: fact.title,
                description: fact.description,
                href: '/tools/hidden-facts',
                category: fact.category,
                score: scoreMatch(haystack, normalizedQuery, tokens),
            } satisfies SearchHit;
        })
        .filter((fact) => fact.score > 0)
        .sort(byScoreDescending)
        .slice(0, limit);
}

async function searchClaimCasesFallback(query: string, limit: number): Promise<SearchHit[]> {
    const normalizedQuery = normalizeQuery(query);
    if (!normalizedQuery) return [];

    const tokens = tokenize(query);

    const claimCases = await searchRepository.findClaimCasesByQuery(normalizedQuery, getExpandedLimit(limit));

    return claimCases
        .map((claimCase) => {
            const haystack = [
                claimCase.title,
                claimCase.category,
                claimCase.issue,
                claimCase.details,
                claimCase.lesson,
                claimCase.outcome,
            ].join(' ');

            return {
                id: claimCase.id,
                type: 'claim',
                title: claimCase.title,
                description: claimCase.issue,
                href: '/tools/claim-cases',
                category: claimCase.category,
                score: scoreMatch(haystack, normalizedQuery, tokens),
            } satisfies SearchHit;
        })
        .filter((claimCase) => claimCase.score > 0)
        .sort(byScoreDescending)
        .slice(0, limit);
}

export async function findInsuranceProductMatchesInDatabase(
    query: string,
    limit: number,
): Promise<ProductSearchMatch[]> {
    const normalizedQuery = normalizeQuery(query);
    if (!normalizedQuery) return [];

    const tokens = tokenize(query);
    const likePattern = `%${escapeLikePattern(normalizedQuery)}%`;

    try {
        const rows = await searchRepository.searchProductRows(normalizedQuery, likePattern, getExpandedLimit(limit));

        return rows
            .map((row) => {
                const benefits = row.benefits ?? [];
                const exclusions = row.exclusions ?? [];
                const name = `${row.providerName} ${row.productName}`.trim();
                const description =
                    benefits.slice(0, 2).join(', ') ||
                    `${row.typeName} coverage from ${row.providerName}`;
                const haystack = [
                    name,
                    row.providerName,
                    row.productName,
                    row.seoSlug,
                    row.typeName,
                    row.subcategory,
                    row.category,
                    ...benefits,
                    ...exclusions,
                ].join(' ');

                return {
                    id: row.id,
                    name,
                    description,
                    href: `/insurance/${row.seoSlug}`,
                    category: row.category,
                    subcategory: row.subcategory,
                    score: scoreFromRank(row.rank, haystack, normalizedQuery, tokens),
                    benefits,
                    exclusions,
                } satisfies ProductSearchMatch;
            })
            .filter((match) => match.score > 0)
            .sort(byScoreDescending)
            .slice(0, limit);
    } catch {
        return findInsuranceProductMatchesFallback(query, limit);
    }
}

async function searchHiddenFactsInDatabase(query: string, limit: number): Promise<SearchHit[]> {
    const normalizedQuery = normalizeQuery(query);
    if (!normalizedQuery) return [];

    const tokens = tokenize(query);
    const likePattern = `%${escapeLikePattern(normalizedQuery)}%`;

    try {
        const rows = await searchRepository.searchHiddenFactRows(normalizedQuery, likePattern, getExpandedLimit(limit));

        return rows
            .map((row) => {
                const haystack = [
                    row.title,
                    row.category,
                    row.description,
                    row.realCase,
                    row.whatToCheck,
                    ...(row.affectedPolicies ?? []),
                ].join(' ');

                return {
                    id: row.id,
                    type: 'fact',
                    title: row.title,
                    description: row.description,
                    href: '/tools/hidden-facts',
                    category: row.category,
                    score: scoreFromRank(row.rank, haystack, normalizedQuery, tokens),
                } satisfies SearchHit;
            })
            .filter((fact) => fact.score > 0)
            .sort(byScoreDescending)
            .slice(0, limit);
    } catch {
        return searchHiddenFactsFallback(query, limit);
    }
}

async function searchClaimCasesInDatabase(query: string, limit: number): Promise<SearchHit[]> {
    const normalizedQuery = normalizeQuery(query);
    if (!normalizedQuery) return [];

    const tokens = tokenize(query);
    const likePattern = `%${escapeLikePattern(normalizedQuery)}%`;

    try {
        const rows = await searchRepository.searchClaimCaseRows(normalizedQuery, likePattern, getExpandedLimit(limit));

        return rows
            .map((row) => {
                const haystack = [
                    row.title,
                    row.category,
                    row.issue,
                    row.details,
                    row.lesson,
                    row.outcome,
                ].join(' ');

                return {
                    id: row.id,
                    type: 'claim',
                    title: row.title,
                    description: row.issue,
                    href: '/tools/claim-cases',
                    category: row.category,
                    score: scoreFromRank(row.rank, haystack, normalizedQuery, tokens),
                } satisfies SearchHit;
            })
            .filter((claimCase) => claimCase.score > 0)
            .sort(byScoreDescending)
            .slice(0, limit);
    } catch {
        return searchClaimCasesFallback(query, limit);
    }
}

export async function searchSiteIndexInDatabase(
    indexName: SearchIndexName,
    query: string,
    limit: number,
): Promise<SearchHit[]> {
    switch (indexName) {
        case 'products':
            return (await findInsuranceProductMatchesInDatabase(query, limit)).map((product) => ({
                id: product.id,
                type: 'insurance',
                title: product.name,
                description: product.description,
                href: product.href,
                category: product.category,
                score: product.score,
            }));
        case 'hiddenFacts':
            return searchHiddenFactsInDatabase(query, limit);
        case 'claimCases':
            return searchClaimCasesInDatabase(query, limit);
        default:
            return [];
    }
}
