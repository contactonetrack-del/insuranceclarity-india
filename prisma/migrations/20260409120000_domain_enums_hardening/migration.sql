DO $$ BEGIN
    CREATE TYPE "UserRole" AS ENUM ('GUEST', 'CUSTOMER', 'AGENT', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "UserPlan" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "PaymentPlan" AS ENUM ('SCAN_UNLOCK', 'PRO', 'ENTERPRISE');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "SubscriptionPlan" AS ENUM ('PRO', 'ENTERPRISE');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "QuoteStatus" AS ENUM ('PENDING', 'READY', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'CLOSED', 'LOST');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "LeadSource" AS ENUM ('ORGANIC', 'REFERRAL', 'PAID', 'SOCIAL', 'EMAIL');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "User"
    ALTER COLUMN "plan" DROP DEFAULT,
    ALTER COLUMN "plan" TYPE "UserPlan"
    USING (
        CASE
            WHEN UPPER(COALESCE("plan", 'FREE')) IN ('FREE', 'PRO', 'ENTERPRISE')
                THEN UPPER(COALESCE("plan", 'FREE'))::"UserPlan"
            ELSE 'FREE'::"UserPlan"
        END
    ),
    ALTER COLUMN "plan" SET DEFAULT 'FREE';

ALTER TABLE "User"
    ALTER COLUMN "role" DROP DEFAULT,
    ALTER COLUMN "role" TYPE "UserRole"
    USING (
        CASE
            WHEN UPPER(COALESCE("role", 'CUSTOMER')) IN ('GUEST', 'CUSTOMER', 'AGENT', 'ADMIN')
                THEN UPPER(COALESCE("role", 'CUSTOMER'))::"UserRole"
            ELSE 'CUSTOMER'::"UserRole"
        END
    ),
    ALTER COLUMN "role" SET DEFAULT 'CUSTOMER';

ALTER TABLE "Payment"
    ALTER COLUMN "plan" DROP DEFAULT,
    ALTER COLUMN "plan" TYPE "PaymentPlan"
    USING (
        CASE
            WHEN UPPER(COALESCE("plan", 'SCAN_UNLOCK')) IN ('SCAN_UNLOCK', 'PRO', 'ENTERPRISE')
                THEN UPPER(COALESCE("plan", 'SCAN_UNLOCK'))::"PaymentPlan"
            ELSE 'SCAN_UNLOCK'::"PaymentPlan"
        END
    ),
    ALTER COLUMN "plan" SET DEFAULT 'SCAN_UNLOCK';

ALTER TABLE "Subscription"
    ALTER COLUMN "plan" TYPE "SubscriptionPlan"
    USING (
        CASE
            WHEN UPPER(COALESCE("plan", 'PRO')) = 'ENTERPRISE'
                THEN 'ENTERPRISE'::"SubscriptionPlan"
            ELSE 'PRO'::"SubscriptionPlan"
        END
    );

ALTER TABLE "Quote"
    ALTER COLUMN "status" DROP DEFAULT,
    ALTER COLUMN "status" TYPE "QuoteStatus"
    USING (
        CASE
            WHEN UPPER(COALESCE("status", 'PENDING')) = 'COMPLETED'
                THEN 'READY'::"QuoteStatus"
            WHEN UPPER(COALESCE("status", 'PENDING')) IN ('PENDING', 'READY', 'FAILED')
                THEN UPPER(COALESCE("status", 'PENDING'))::"QuoteStatus"
            ELSE 'PENDING'::"QuoteStatus"
        END
    ),
    ALTER COLUMN "status" SET DEFAULT 'PENDING';

ALTER TABLE "Lead"
    ALTER COLUMN "status" DROP DEFAULT,
    ALTER COLUMN "status" TYPE "LeadStatus"
    USING (
        CASE
            WHEN UPPER(COALESCE("status", 'NEW')) IN ('NEW', 'CONTACTED', 'QUALIFIED', 'CLOSED', 'LOST')
                THEN UPPER(COALESCE("status", 'NEW'))::"LeadStatus"
            ELSE 'NEW'::"LeadStatus"
        END
    ),
    ALTER COLUMN "status" SET DEFAULT 'NEW';

ALTER TABLE "Lead"
    ALTER COLUMN "source" DROP DEFAULT,
    ALTER COLUMN "source" TYPE "LeadSource"
    USING (
        CASE
            WHEN "source" IS NULL OR BTRIM("source") = '' THEN 'ORGANIC'::"LeadSource"
            WHEN "source" ~* '(gclid|fbclid|utm_medium=(cpc|ppc|paid|display)|paid|ads?|adwords|campaign)'
                THEN 'PAID'::"LeadSource"
            WHEN "source" ~* '(referral|refer|affiliate|partner)'
                THEN 'REFERRAL'::"LeadSource"
            WHEN "source" ~* '(instagram|facebook|linkedin|twitter|x\.com|youtube|whatsapp|social)'
                THEN 'SOCIAL'::"LeadSource"
            WHEN "source" ~* '(newsletter|email|mailchimp|resend|subscriber)'
                THEN 'EMAIL'::"LeadSource"
            ELSE 'ORGANIC'::"LeadSource"
        END
    ),
    ALTER COLUMN "source" SET DEFAULT 'ORGANIC';
