import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export interface ProductSearchRow {
    id: string;
    providerName: string;
    productName: string;
    seoSlug: string;
    typeName: string;
    subcategory: string;
    category: string;
    benefits: string[] | null;
    exclusions: string[] | null;
    rank: number | null;
}

export interface HiddenFactSearchRow {
    id: string;
    title: string;
    category: string;
    description: string;
    realCase: string;
    whatToCheck: string;
    affectedPolicies: string[] | null;
    rank: number | null;
}

export interface ClaimCaseSearchRow {
    id: string;
    title: string;
    category: string;
    issue: string;
    details: string;
    lesson: string;
    outcome: string;
    rank: number | null;
}

export class SearchRepository {
    findInsurancePoliciesByQuery(normalizedQuery: string, expandedLimit: number) {
        return prisma.insurancePolicy.findMany({
            where: {
                OR: [
                    { productName: { contains: normalizedQuery, mode: 'insensitive' } },
                    { providerName: { contains: normalizedQuery, mode: 'insensitive' } },
                    { seoSlug: { contains: normalizedQuery, mode: 'insensitive' } },
                    { type: { name: { contains: normalizedQuery, mode: 'insensitive' } } },
                    {
                        type: {
                            subcategory: { name: { contains: normalizedQuery, mode: 'insensitive' } },
                        },
                    },
                    {
                        type: {
                            subcategory: {
                                category: { name: { contains: normalizedQuery, mode: 'insensitive' } },
                            },
                        },
                    },
                ],
            },
            include: {
                type: {
                    include: {
                        subcategory: {
                            include: { category: true },
                        },
                    },
                },
            },
            take: expandedLimit,
        });
    }

    findHiddenFactsByQuery(normalizedQuery: string, expandedLimit: number) {
        return prisma.hiddenFact.findMany({
            where: {
                OR: [
                    { title: { contains: normalizedQuery, mode: 'insensitive' } },
                    { category: { contains: normalizedQuery, mode: 'insensitive' } },
                    { description: { contains: normalizedQuery, mode: 'insensitive' } },
                    { realCase: { contains: normalizedQuery, mode: 'insensitive' } },
                    { whatToCheck: { contains: normalizedQuery, mode: 'insensitive' } },
                ],
            },
            take: expandedLimit,
            orderBy: { updatedAt: 'desc' },
        });
    }

    findClaimCasesByQuery(normalizedQuery: string, expandedLimit: number) {
        return prisma.claimCase.findMany({
            where: {
                OR: [
                    { title: { contains: normalizedQuery, mode: 'insensitive' } },
                    { category: { contains: normalizedQuery, mode: 'insensitive' } },
                    { issue: { contains: normalizedQuery, mode: 'insensitive' } },
                    { details: { contains: normalizedQuery, mode: 'insensitive' } },
                    { lesson: { contains: normalizedQuery, mode: 'insensitive' } },
                ],
            },
            take: expandedLimit,
            orderBy: { updatedAt: 'desc' },
        });
    }

    searchProductRows(normalizedQuery: string, likePattern: string, expandedLimit: number) {
        return prisma.$queryRaw<ProductSearchRow[]>(Prisma.sql`
            WITH search_query AS (
                SELECT websearch_to_tsquery('simple', ${normalizedQuery}) AS q
            )
            SELECT
                policy.id,
                policy."providerName",
                policy."productName",
                policy."seoSlug",
                type.name AS "typeName",
                subcategory.name AS "subcategory",
                category.name AS "category",
                policy.benefits,
                policy.exclusions,
                ts_rank_cd(
                    setweight(to_tsvector('simple', coalesce(policy."providerName", '')), 'A') ||
                    setweight(to_tsvector('simple', coalesce(policy."productName", '')), 'A') ||
                    setweight(to_tsvector('simple', coalesce(policy."seoSlug", '')), 'B') ||
                    setweight(to_tsvector('simple', coalesce(type.name, '')), 'B') ||
                    setweight(to_tsvector('simple', coalesce(subcategory.name, '')), 'C') ||
                    setweight(to_tsvector('simple', coalesce(category.name, '')), 'C'),
                    search_query.q
                ) AS rank
            FROM "InsurancePolicy" AS policy
            INNER JOIN "InsuranceType" AS type
                ON type.id = policy."typeId"
            INNER JOIN "InsuranceSubcategory" AS subcategory
                ON subcategory.id = type."subcategoryId"
            INNER JOIN "InsuranceCategory" AS category
                ON category.id = subcategory."categoryId"
            CROSS JOIN search_query
            WHERE
                search_query.q @@ (
                    setweight(to_tsvector('simple', coalesce(policy."providerName", '')), 'A') ||
                    setweight(to_tsvector('simple', coalesce(policy."productName", '')), 'A') ||
                    setweight(to_tsvector('simple', coalesce(policy."seoSlug", '')), 'B') ||
                    setweight(to_tsvector('simple', coalesce(type.name, '')), 'B') ||
                    setweight(to_tsvector('simple', coalesce(subcategory.name, '')), 'C') ||
                    setweight(to_tsvector('simple', coalesce(category.name, '')), 'C')
                )
                OR policy."providerName" ILIKE ${likePattern}
                OR policy."productName" ILIKE ${likePattern}
                OR policy."seoSlug" ILIKE ${likePattern}
                OR type.name ILIKE ${likePattern}
                OR subcategory.name ILIKE ${likePattern}
                OR category.name ILIKE ${likePattern}
            ORDER BY rank DESC, policy."providerName" ASC, policy."productName" ASC
            LIMIT ${expandedLimit}
        `);
    }

    searchHiddenFactRows(normalizedQuery: string, likePattern: string, expandedLimit: number) {
        return prisma.$queryRaw<HiddenFactSearchRow[]>(Prisma.sql`
            WITH search_query AS (
                SELECT websearch_to_tsquery('simple', ${normalizedQuery}) AS q
            )
            SELECT
                fact.id,
                fact.title,
                fact.category,
                fact.description,
                fact."realCase",
                fact."whatToCheck",
                fact."affectedPolicies",
                ts_rank_cd(
                    setweight(to_tsvector('simple', coalesce(fact.title, '')), 'A') ||
                    setweight(to_tsvector('simple', coalesce(fact.category, '')), 'B') ||
                    setweight(to_tsvector('simple', coalesce(fact.description, '')), 'B') ||
                    setweight(to_tsvector('simple', coalesce(fact."realCase", '')), 'C') ||
                    setweight(to_tsvector('simple', coalesce(fact."whatToCheck", '')), 'C'),
                    search_query.q
                ) AS rank
            FROM "HiddenFact" AS fact
            CROSS JOIN search_query
            WHERE
                search_query.q @@ (
                    setweight(to_tsvector('simple', coalesce(fact.title, '')), 'A') ||
                    setweight(to_tsvector('simple', coalesce(fact.category, '')), 'B') ||
                    setweight(to_tsvector('simple', coalesce(fact.description, '')), 'B') ||
                    setweight(to_tsvector('simple', coalesce(fact."realCase", '')), 'C') ||
                    setweight(to_tsvector('simple', coalesce(fact."whatToCheck", '')), 'C')
                )
                OR fact.title ILIKE ${likePattern}
                OR fact.category ILIKE ${likePattern}
                OR fact.description ILIKE ${likePattern}
                OR fact."realCase" ILIKE ${likePattern}
                OR fact."whatToCheck" ILIKE ${likePattern}
            ORDER BY rank DESC, fact.title ASC
            LIMIT ${expandedLimit}
        `);
    }

    searchClaimCaseRows(normalizedQuery: string, likePattern: string, expandedLimit: number) {
        return prisma.$queryRaw<ClaimCaseSearchRow[]>(Prisma.sql`
            WITH search_query AS (
                SELECT websearch_to_tsquery('simple', ${normalizedQuery}) AS q
            )
            SELECT
                claim.id,
                claim.title,
                claim.category,
                claim.issue,
                claim.details,
                claim.lesson,
                claim.outcome,
                ts_rank_cd(
                    setweight(to_tsvector('simple', coalesce(claim.title, '')), 'A') ||
                    setweight(to_tsvector('simple', coalesce(claim.category, '')), 'B') ||
                    setweight(to_tsvector('simple', coalesce(claim.issue, '')), 'B') ||
                    setweight(to_tsvector('simple', coalesce(claim.details, '')), 'C') ||
                    setweight(to_tsvector('simple', coalesce(claim.lesson, '')), 'C') ||
                    setweight(to_tsvector('simple', coalesce(claim.outcome, '')), 'D'),
                    search_query.q
                ) AS rank
            FROM "ClaimCase" AS claim
            CROSS JOIN search_query
            WHERE
                search_query.q @@ (
                    setweight(to_tsvector('simple', coalesce(claim.title, '')), 'A') ||
                    setweight(to_tsvector('simple', coalesce(claim.category, '')), 'B') ||
                    setweight(to_tsvector('simple', coalesce(claim.issue, '')), 'B') ||
                    setweight(to_tsvector('simple', coalesce(claim.details, '')), 'C') ||
                    setweight(to_tsvector('simple', coalesce(claim.lesson, '')), 'C') ||
                    setweight(to_tsvector('simple', coalesce(claim.outcome, '')), 'D')
                )
                OR claim.title ILIKE ${likePattern}
                OR claim.category ILIKE ${likePattern}
                OR claim.issue ILIKE ${likePattern}
                OR claim.details ILIKE ${likePattern}
                OR claim.lesson ILIKE ${likePattern}
                OR claim.outcome ILIKE ${likePattern}
            ORDER BY rank DESC, claim.title ASC
            LIMIT ${expandedLimit}
        `);
    }
}

export const searchRepository = new SearchRepository();

