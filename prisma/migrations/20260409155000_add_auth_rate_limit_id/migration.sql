ALTER TABLE "AuthRateLimit"
ADD COLUMN "id" TEXT;

UPDATE "AuthRateLimit"
SET "id" = md5("key" || ':' || clock_timestamp()::text || ':' || random()::text)
WHERE "id" IS NULL;

ALTER TABLE "AuthRateLimit"
ALTER COLUMN "id" SET NOT NULL;

CREATE UNIQUE INDEX "AuthRateLimit_id_key" ON "AuthRateLimit"("id");
