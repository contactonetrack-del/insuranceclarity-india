-- Drop legacy NextAuth v4 tables after better-auth cutover.
-- Safe for repeated deploy attempts due to IF EXISTS guards.

DROP TABLE IF EXISTS "VerificationToken";
DROP TABLE IF EXISTS "Session";
DROP TABLE IF EXISTS "Account";

