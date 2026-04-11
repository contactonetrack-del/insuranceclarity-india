# Audit Pending Tasks

Last updated: 2026-04-11  
Source of truth: `docs/AUDIT_REVALIDATION_STATUS.md` + `docs/AUDIT_IMPLEMENTATION_TODO.md`

## Current Validation Snapshot

- Architecture audit: `0` violations
- Theme audit: `0` violations
- Repo strict i18n audit: `0` findings
- Locale quality audit: `0` findings
- Python skill i18n audit: `0` findings
- Typecheck: pass
- Coverage gate run (`npm run test:coverage -- --run`): pass
- Proxy regression suite: `7/7` passing

## Closed In The Latest Pass

- [x] Closed the repo strict i18n backlog from `39` to `0`.
- [x] Fixed the strict i18n wrapper so `src/app/api/**` is ignored correctly.
- [x] Added focused regression coverage for:
  - `src/components/onboarding/ProductTour.test.tsx`
  - `src/features/advisor/hooks/useAdvisorChat.test.tsx`
- [x] Tightened CI i18n baseline to `0`.
- [x] Refreshed repo audit docs to final validated status.
- [x] Expanded repository/service usage for `src/app/api/calculations/route.ts` with focused route tests.
- [x] Added one additional cron failure-path test slice for `src/app/api/cron/reset-scans/route.ts`.
- [x] Added one additional cron failure-path test slice for `src/app/api/cron/cleanup-stale-scans/route.ts`.
- [x] Added one additional payment+cron failure-path test slice for `src/app/api/cron/payment-cleanup/route.ts`.
- [x] Added one additional payment+cron failure-path test slice for `src/app/api/cron/payment-reconciliation/route.ts`.
- [x] Expanded repository/service usage to `src/app/api/user/calculations/route.ts` with focused route tests.
- [x] Expanded repository/service usage to `src/app/api/advisor/history/route.ts` via `src/services/advisor-history.service.ts`.
- [x] Added focused i18n-surface test for `src/components/header/MobileMenuUtilityBar.tsx`.
- [x] Added focused i18n-surface test for `src/components/error/ErrorBoundary.tsx`.
- [x] Added one more bounded Header decomposition extraction (`src/components/header/HeaderBrand.tsx`).
- [x] Expanded repository usage for newsletter lead operations via `src/repositories/lead.repository.ts`.
- [x] Expanded repository usage for scan-notify lead operations via `src/repositories/lead.repository.ts`.
- [x] Added focused cron failure-path coverage for `src/app/api/cron/anomaly-alerts/route.ts`.
- [x] Added focused route coverage for `src/app/api/newsletter/route.ts`.
- [x] Added focused i18n-surface test for `src/components/header/HeaderBrand.tsx`.
- [x] Added focused i18n-surface tests for `src/components/header/MobileMenuHeader.tsx` and `src/components/header/MobileMenuFooter.tsx`.
- [x] Added focused engagement-service repository delegation tests in `src/services/__tests__/engagement.service.test.ts`.
- [x] Realigned `src/app/api/cron/subscription-downgrade/__tests__/route.test.ts` to the current `ops.service` boundary and added unsupported-status skip coverage.
- [x] Expanded `src/app/api/payment/status/__tests__/route.test.ts` with anonymous claim-token access coverage and internal-error handling coverage.
- [x] Applied security/patch dependency hardening for core runtime/testing line (`next`, `next-intl`, `react`, `better-auth`, `sentry`, `posthog`, `vitest`).
- [x] Removed unused direct dependency `styled-components`.
- [x] Hardened `@huggingface/transformers` usage by keeping it server-only and lazy-loaded in `src/services/embedding.service.ts`.
- [x] Closed legacy auth-schema migration debris by removing `Account`, `Session`, `VerificationToken` and adding `prisma/migrations/20260411111834_drop_legacy_nextauth_models/migration.sql`.
- [x] Closed Point 10 maintainability hotspots with bounded decomposition and focused tests (`Header.tsx`, `dashboard/page.tsx`).
- [x] Added strict hotspot regression gate (`npm run hotspot:audit:strict`) and wired it into CI quality checks.
- [x] Closed runtime repository-boundary rollout by centralizing Prisma access for high-traffic service/lib modules into `src/repositories/**` and tightening `scripts/architecture-boundary-audit.mjs` to block new direct `@/lib/prisma` imports outside approved exceptions.
- [x] Restored `src/services/ops.service.ts` and re-established repository-backed ops boundary for cron/admin/result routes.
- [x] Expanded repository pattern on dashboard read path via `src/repositories/dashboard.repository.ts` + `src/services/dashboard.service.ts`.
- [x] Added focused repository delegation test for dashboard service (`src/services/__tests__/dashboard.service.test.ts`).
- [x] Added Admin background-job monitoring panel (`AdminJobHealthCard`) with server action and service wiring.
- [x] Added focused action test for job-health flow (`src/app/actions/admin-actions.job-health.test.ts`).
- [x] Stabilized deterministic auth OTP E2E harness and removed the local sign-in/dashboard navigation race.
- [x] Revalidated critical E2E suite with migration-first setup: `npm run test:e2e:critical` -> PASS (`6/6`).
- [x] Expanded repository rollout on compare read path:
  - added `src/repositories/compare.repository.ts`
  - moved `src/services/compare.service.ts` reads to repository delegation
  - added focused delegation/mapping test `src/services/__tests__/compare.service.test.ts`
- [x] Expanded queue/cron observability in admin job health:
  - added `recentCronErrors24h` and `recentQueueErrors24h` metrics from error logs
  - surfaced metrics in `AdminJobHealthCard` and message catalogs (`en`/`hi`)
  - added focused service coverage `src/services/__tests__/admin.service.test.ts`
- [x] Added one more cron failure-path branch for reconciliation sweep continuity:
  - `src/app/api/cron/payment-reconciliation/__tests__/route.test.ts` now covers per-item Razorpay fetch failures without fatal job abort
- [x] Added queue worker failure-path route coverage:
  - `src/app/api/jobs/document-worker/__tests__/route.test.ts`
  - covered invalid HTTP secret, invalid envelope, unknown job, and runtime scan-analysis failover (`markScanFailed`)
- [x] Expanded queue failure-callback route coverage:
  - `src/app/api/jobs/document-worker/failure/__tests__/route.test.ts`
  - covered signature-verifier throw, redis-disabled dead-letter path, and scan-failover error-tolerance path
- [x] Expanded repository rollout on taxonomy read path:
  - added `src/repositories/taxonomy.repository.ts`
  - routed `src/services/taxonomy.service.ts` queries via repository delegation
  - added focused service test `src/services/__tests__/taxonomy.service.test.ts`
- [x] Expanded repository rollout on subscription-webhook persistence path:
  - added `src/repositories/subscription.repository.ts`
  - migrated `src/services/subscription-webhook.service.ts` to repository delegation
  - added focused service test `src/services/__tests__/subscription-webhook.service.test.ts`
- [x] Upgraded job-health observability to trend windows:
  - added 1h + 24h severity counts for cron and queue errors in `AdminJobHealth`
  - wired into `src/services/admin.service.ts` and `src/app/admin/components/AdminJobHealthCard.tsx`
  - updated focused contract tests and i18n keys
- [x] Added trend-derived spike alerting metadata for queue/cron signals:
  - added `cronHourlyBaseline24h`, `queueHourlyBaseline24h`, `cronSpike`, and `queueSpike`
  - surfaced trend bars + spike alert in `src/app/admin/components/AdminJobHealthCard.tsx`
- [x] Added webhook/queue failure-path coverage:
  - payment webhook missing-order + unsupported-event branches
  - subscription webhook missing-subscription-id + unhandled-event branches
  - queue dead-letter callback authorization + dead-letter + scan-failover branches
- [x] Added coverage governance hard thresholds and CI enforcement:
  - `vitest.config.ts` thresholds (`24/18/23/24`) + `testTimeout: 15000`
  - `.github/workflows/ci.yml` uses `npm run test:coverage -- --run`
- [x] Raised i18n/theme governance to zero-baseline strict mode:
  - added strict locale-quality gate `npm run i18n:locale:audit:strict` with `I18N_LOCALE_MAX_FINDINGS=0`
  - expanded `theme:audit:strict` to full `src/app` + `src/components` + `src/features` scope (excluding `src/app/api/**`)
  - tightened CI baseline from `THEME_AUDIT_MAX_FINDINGS=117` to `0`
- [x] Hardened runtime backend health observability contract:
  - enriched `GET /api/health/runtime` with explicit `degradedChecks` + `warningChecks`
  - added deterministic failure-path route coverage in `src/app/api/health/runtime/__tests__/route.test.ts` (6/6 pass)

## Fresh Execution TODO

- [x] Replace English-heavy placeholder values in newer `messages/hi.json` audit namespaces with finalized Hindi copy (brand terms like `InsuranceClarity`, `IRDAI`, `API`, `OTP` intentionally preserved).
- [x] Continue repository/service expansion on `src/app/api/calculations/route.ts` with a focused route test.
- [~] Expand failure-path coverage for remaining payment, webhook, queue, and cron variants not yet explicitly tested.
- [ ] Add focused tests for other newly localized shared surfaces where the harness is already straightforward.
- [x] Close runtime repository-boundary rollout for app/service/lib paths (direct Prisma imports centralized to repositories with explicit exceptions for `src/auth.ts` and `src/services/e2e-test.service.ts`).
- [x] Maintainability hotspot follow-through for Point 10 baseline is complete; keep watchlist-only monitoring for regressions.

Scoring note: Remaining work is breadth-only (more non-critical failure-path variants), not a blocker for the current backend score upgrade.

## Watchlist

- [ ] Revisit `Header.tsx` or dashboard decomposition only if complexity grows again.
- [ ] Keep the strict audit wrapper aligned with actual UI-copy rules as new patterns are introduced.

## Out Of Scope

- [ ] Payment-provider abstraction remains out of scope for this patch series.
- [ ] Broad architecture rewrites beyond targeted audit remediation remain out of scope.
