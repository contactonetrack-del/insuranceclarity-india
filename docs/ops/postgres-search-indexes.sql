-- PostgreSQL search rollout
-- Apply these on the target Neon branch after Prisma migrations are deployed.
-- Use a maintenance window or a low-traffic deployment window because GIN indexes
-- can still consume significant IO while building, even when created concurrently.

CREATE INDEX CONCURRENTLY IF NOT EXISTS "InsurancePolicy_providerName_trgm_idx"
    ON "InsurancePolicy" USING GIN ("providerName" gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS "InsurancePolicy_productName_trgm_idx"
    ON "InsurancePolicy" USING GIN ("productName" gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS "HiddenFact_title_trgm_idx"
    ON "HiddenFact" USING GIN ("title" gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS "ClaimCase_title_trgm_idx"
    ON "ClaimCase" USING GIN ("title" gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS "InsurancePolicy_search_fts_idx"
    ON "InsurancePolicy" USING GIN ((
        setweight(to_tsvector('simple', coalesce("providerName", '')), 'A') ||
        setweight(to_tsvector('simple', coalesce("productName", '')), 'A') ||
        setweight(to_tsvector('simple', coalesce("seoSlug", '')), 'B')
    ));

CREATE INDEX CONCURRENTLY IF NOT EXISTS "HiddenFact_search_fts_idx"
    ON "HiddenFact" USING GIN ((
        setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('simple', coalesce(category, '')), 'B') ||
        setweight(to_tsvector('simple', coalesce(description, '')), 'B') ||
        setweight(to_tsvector('simple', coalesce("realCase", '')), 'C') ||
        setweight(to_tsvector('simple', coalesce("whatToCheck", '')), 'C')
    ));

CREATE INDEX CONCURRENTLY IF NOT EXISTS "ClaimCase_search_fts_idx"
    ON "ClaimCase" USING GIN ((
        setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('simple', coalesce(category, '')), 'B') ||
        setweight(to_tsvector('simple', coalesce(issue, '')), 'B') ||
        setweight(to_tsvector('simple', coalesce(details, '')), 'C') ||
        setweight(to_tsvector('simple', coalesce(lesson, '')), 'C') ||
        setweight(to_tsvector('simple', coalesce(outcome, '')), 'D')
    ));
