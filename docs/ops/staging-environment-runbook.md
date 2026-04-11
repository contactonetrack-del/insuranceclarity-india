# Staging Environment Runbook

## Purpose

Use staging to validate schema, queue, cron, payments, and critical user journeys before promoting changes to production.

## Staging Readiness Checklist

1. Pull the current environment variables for the staging target.
2. Confirm the staging database is reachable and isolated from production.
3. Run migrations before any smoke or E2E pass:
   - `npx prisma migrate deploy`
4. Confirm queue and cron secrets are configured:
   - `QSTASH_TOKEN` or the HTTP queue secret
   - cron auth secret
   - Redis credentials if queue dead-letter telemetry depends on it
5. Confirm payment sandbox credentials are active and webhook secrets match staging endpoints.

## Pre-Promotion Validation

Run this sequence on staging:

1. `npm run architecture:audit:strict`
2. `npm run theme:audit:strict`
3. `npm run i18n:audit:strict`
4. `npm run i18n:locale:audit:strict`
5. `npm run hotspot:audit:strict`
6. `npm run performance:audit:strict`
7. `npm run typecheck`
8. `npm run test:coverage:critical`
9. `npm run test:e2e:critical`

## Staging Smoke Checks

Verify these manually or via automation:

1. Homepage loads and primary navigation works on desktop and mobile widths.
2. Locale-prefixed routes work for `en` and `hi`.
3. Sign-in and protected dashboard access work.
4. Scan upload flow reaches analysis and result states.
5. Payment order creation, webhook processing, and paid-state unlock work with sandbox credentials.
6. Admin runtime and business-readiness surfaces load without server errors.
7. Cron and queue health cards show expected telemetry after synthetic jobs or test events.

## Promotion Gate

Promote staging only when all of the following are true:

1. Required CI checks are green.
2. Staging migrations have been applied successfully.
3. Critical E2E and smoke checks pass.
4. No unresolved high-severity Sentry or runtime-health regressions are open for the release.

## If Staging Fails

1. Stop promotion immediately.
2. Capture the failing route, job, or payment step.
3. Check `/api/health/runtime` and `/api/health/plans`.
4. Review admin queue/cron health and recent logs.
5. Fix forward if the issue is isolated and low-risk.
6. If the issue is deployment-induced or broad, follow [incident-rollback-runbook.md](/C:/Users/chauh/Downloads/Insurance%20Website/nextjs-app/docs/ops/incident-rollback-runbook.md).
