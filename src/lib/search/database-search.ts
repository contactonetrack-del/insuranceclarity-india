import { prisma } from '@/lib/prisma';

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

function scoreMatch(haystack: string, normalizedQuery: string, tokens: string[]): number {
    const normalizedHaystack = haystack.toLowerCase();
    let score = 0;

    if (normalizedHaystack === normalizedQuery) score += 120;
    if (normalizedHaystack.startsWith(normalizedQuery)) score += 70;
    if (normalizedHaystack.includes(normalizedQuery)) score += 45;

    for (const token of tokens) {
        if (normalizedHaystack.includes(token)) {
            score += token.length > 3 ? 12 : 6;
        }
    }

    return score;
}

function byScoreDescending<T extends { score: number; title?: string; name?: string }>(left: T, right: T): number {
    if (right.score !== left.score) {
        return right.score - left.score;
    }

    const leftLabel = left.title ?? left.name ?? '';
    const rightLabel = right.title ?? right.name ?? '';
    return leftLabel.localeCompare(rightLabel);
}

export async function findInsuranceProductMatchesInDatabase(query: string, limit: number): Promise<ProductSearchMatch[]> {
    const normalizedQuery = normalizeQuery(query);
    if (!normalizedQuery) return [];

    const tokens = tokenize(query);
    const policies = await prisma.insurancePolicy.findMany({
        where: {
            OR: [
                { productName: { contains: normalizedQuery, mode: 'insensitive' } },
                { providerName: { contains: normalizedQuery, mode: 'insensitive' } },
                { seoSlug: { contains: normalizedQuery, mode: 'insensitive' } },
                { type: { name: { contains: normalizedQuery, mode: 'insensitive' } } },
                { type: { subcategory: { name: { contains: normalizedQuery, mode: 'insensitive' } } } },
                { type: { subcategory: { category: { name: { contains: normalizedQuery, mode: 'insensitive' } } } } },
            ],
        },
        include: {
            type: {
                include: {
                    subcategory: {
                        include: {
                            category: true,
                        },
                    },
                },
            },
        },
        take: Math.max(limit * 4, 24),
    });

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

async function searchHiddenFactsInDatabase(query: string, limit: number): Promise<SearchHit[]> {
    const normalizedQuery = normalizeQuery(query);
    if (!normalizedQuery) return [];

    const tokens = tokenize(query);
    const facts = await prisma.hiddenFact.findMany({
        where: {
            OR: [
                { title: { contains: normalizedQuery, mode: 'insensitive' } },
                { category: { contains: normalizedQuery, mode: 'insensitive' } },
                { description: { contains: normalizedQuery, mode: 'insensitive' } },
                { realCase: { contains: normalizedQuery, mode: 'insensitive' } },
                { whatToCheck: { contains: normalizedQuery, mode: 'insensitive' } },
            ],
        },
        take: Math.max(limit * 4, 24),
        orderBy: { updatedAt: 'desc' },
    });

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

async function searchClaimCasesInDatabase(query: string, limit: number): Promise<SearchHit[]> {
    const normalizedQuery = normalizeQuery(query);
    if (!normalizedQuery) return [];

    const tokens = tokenize(query);
    const claimCases = await prisma.claimCase.findMany({
        where: {
            OR: [
                { title: { contains: normalizedQuery, mode: 'insensitive' } },
                { category: { contains: normalizedQuery, mode: 'insensitive' } },
                { issue: { contains: normalizedQuery, mode: 'insensitive' } },
                { details: { contains: normalizedQuery, mode: 'insensitive' } },
                { lesson: { contains: normalizedQuery, mode: 'insensitive' } },
            ],
        },
        take: Math.max(limit * 4, 24),
        orderBy: { updatedAt: 'desc' },
    });

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

export async function searchSiteIndexInDatabase(indexName: SearchIndexName, query: string, limit: number): Promise<SearchHit[]> {
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
