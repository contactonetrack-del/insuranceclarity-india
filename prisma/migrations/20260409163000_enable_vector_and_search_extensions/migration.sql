CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE "InsurancePolicy"
    ADD COLUMN IF NOT EXISTS "embedding" vector(768);

ALTER TABLE "HiddenFact"
    ADD COLUMN IF NOT EXISTS "embedding" vector(768);

ALTER TABLE "ClaimCase"
    ADD COLUMN IF NOT EXISTS "embedding" vector(768);
