# Audit Implementation TODO (Validated)

Last validated: 2026-04-11  
Source audit baseline: `full_audit_report.md.resolved`

## Closed Milestones

- [x] P0-I18N-ERROR-PAGES
- [x] P0-TEST-AUTH
- [x] P0-TEST-PAYMENT
- [x] P0-TEST-SCAN-FLOW
- [x] P0-TEST-SUBSCRIPTION (core + remaining slices)
- [x] P0-CI-PIPELINE hardening
- [x] P0-DEPENDENCY-AUDIT-CRITICAL
- [x] P1-MIDDLEWARE-CENTRAL-GUARD
- [x] P1-LOCALE-ROUTING
- [x] P1-HEADER-DECOMPOSITION
- [x] P1-DASHBOARD-DECOMPOSITION
- [x] P1-RBAC-SESSION-PERMISSION
- [x] P2-SCAN-CSS-MIGRATION
- [x] P2-REPO-CLEANUP
- [x] P2-LEGACY-AUTH-SCHEMA-CLEANUP
- [x] P2-HOTSPOT-DECOMPOSITION-FOLLOWTHROUGH
- [x] P2-I18N-SWEEP for current audit scope
  - Repo strict i18n audit: `0`
  - Python skill i18n audit: `0`
  - Added final closure coverage in:
    - `src/components/onboarding/ProductTour.test.tsx`
    - `src/features/advisor/hooks/useAdvisorChat.test.tsx`
- [x] P2-DEPENDENCY-LUCIDE-UPGRADE

## In Progress

- [~] P2-REPOSITORY-PATTERN-EXPANSION (narrow residual)
  - Runtime app/service/lib repository-boundary closure is complete in this patch series.
  - Intentional direct Prisma exceptions remain:
    - `src/auth.ts` (auth runtime wiring)
    - `src/services/e2e-test.service.ts` (E2E deterministic fixture harness)
  - Any future expansion is optional breadth cleanup, not a current blocker.

## Follow-Up Queue

- [x] Hindi localization quality pass for newer `auditI18n.*` namespaces (brand/legal/technical terms intentionally preserved where needed).
- [~] Failure-path test expansion for remaining payment, webhook, queue, and cron variants outside the currently covered set.
  - Added in this pass:
    - `src/app/api/payment/webhook/__tests__/route.test.ts` (missing-order + unsupported-event branches)
    - `src/app/api/subscription/webhook/__tests__/route.test.ts` (missing-subscription-id + unhandled-event branches)
    - `src/app/api/jobs/document-worker/failure/__tests__/route.test.ts` (signature auth + dead-letter + scan-failover branches)
  - Remaining items are breadth-only non-critical variants and are not blocking the backend score upgrade.
- [x] Optional maintainability follow-through closed for current baseline (`Header.tsx` and `dashboard/page.tsx` now bounded); keep watchlist-only monitoring for regressions.
- [x] Coverage governance hardened:
  - `vitest.config.ts` now enforces global coverage thresholds (`statements:24`, `branches:18`, `functions:23`, `lines:24`).
  - `vitest.config.ts` now uses `testTimeout: 15000` to stabilize coverage runs.
  - `.github/workflows/ci.yml` quality gate now runs `npm run test:coverage -- --run`.
- [ ] Separate API contract lifecycle documentation from the audit tracker if contract governance becomes active work.

## Validation Standard

- Keep each milestone scoped.
- Require typecheck plus targeted tests before closing a checkbox.
- Keep strict audit gates at zero for architecture, theme, and i18n in CI.

## Latest Incremental Update (2026-04-11)

- [x] Closed the final repo strict i18n backlog (`39 -> 0`).
- [x] Localized the remaining metadata and shared UI strings in:
  - `src/app/auth/signin/page.tsx`
  - `src/app/dashboard/admin/errors/page.tsx`
  - `src/app/insurance/[slug]/page.tsx`
  - `src/app/scan/bulk/page.tsx`
  - `src/app/tools/compare/page.tsx`
  - `src/components/dashboard/ErrorMonitoringDashboard.tsx`
  - `src/components/dashboard/ScanActivityChart.tsx`
  - `src/components/error/ErrorBoundary.tsx`
  - `src/components/header/MobileMenuUtilityBar.tsx`
  - `src/components/Header.tsx`
  - `src/components/onboarding/ProductTour.tsx`
  - `src/components/payment/RazorpayCheckout.tsx`
  - `src/components/report/PaywallGate.tsx`
  - `src/features/advisor/hooks/useAdvisorChat.ts`
- [x] Fixed the repo strict i18n wrapper false positive in `scripts/i18n-audit.mjs`.
- [x] Tightened `.github/workflows/ci.yml` i18n baseline from `130` to `0`.
- [x] Expanded repository/service usage for `src/app/api/calculations/route.ts` and added focused route tests in `src/app/api/calculations/__tests__/route.test.ts`.
- [x] Added focused cron failure-path coverage for `src/app/api/cron/reset-scans/route.ts` in `src/app/api/cron/reset-scans/__tests__/route.test.ts`.
- [x] Added focused cron failure-path coverage for `src/app/api/cron/cleanup-stale-scans/route.ts` in `src/app/api/cron/cleanup-stale-scans/__tests__/route.test.ts`.
- [x] Added focused payment+cron failure-path coverage for `src/app/api/cron/payment-cleanup/route.ts` in `src/app/api/cron/payment-cleanup/__tests__/route.test.ts`.
- [x] Added focused payment+cron failure-path coverage for `src/app/api/cron/payment-reconciliation/route.ts` in `src/app/api/cron/payment-reconciliation/__tests__/route.test.ts`.
- [x] Finalized Hindi copy quality for `auditI18n.*` entries in `messages/hi.json` while preserving required brand/technical terms.
- [x] Expanded repository/service usage for `src/app/api/user/calculations/route.ts` and added focused route tests in `src/app/api/user/calculations/__tests__/route.test.ts`.
- [x] Expanded repository/service usage for `src/app/api/advisor/history/route.ts` by moving to `src/services/advisor-history.service.ts`.
- [x] Added focused localization-surface coverage for `src/components/header/MobileMenuUtilityBar.tsx`.
- [x] Added focused localization-surface coverage for `src/components/error/ErrorBoundary.tsx`.
- [x] Added one more bounded Header decomposition extraction: `src/components/header/HeaderBrand.tsx`.
- [x] Expanded repository usage for newsletter lead operations by routing `findNewsletterLeadByEmail` and `createNewsletterLead` through `src/repositories/lead.repository.ts`.
- [x] Expanded repository usage for scan-notify lead operations by routing `findScanNotifyLead` and `createScanNotifyLead` through `src/repositories/lead.repository.ts`.
- [x] Added focused cron failure-path coverage for `src/app/api/cron/anomaly-alerts/route.ts` in `src/app/api/cron/anomaly-alerts/__tests__/route.test.ts`.
- [x] Added focused route coverage for `src/app/api/newsletter/route.ts` in `src/app/api/newsletter/__tests__/route.test.ts`.
- [x] Added focused localization-surface coverage for `src/components/header/HeaderBrand.tsx`.
- [x] Added focused localization-surface coverage for:
  - `src/components/header/MobileMenuHeader.tsx`
  - `src/components/header/MobileMenuFooter.tsx`
- [x] Added focused repository-delegation coverage in `src/services/__tests__/engagement.service.test.ts`.
- [x] Realigned `src/app/api/cron/subscription-downgrade/__tests__/route.test.ts` to the current `ops.service` boundary and added unsupported-status skip coverage.
- [x] Expanded `src/app/api/payment/status/__tests__/route.test.ts` with anonymous claim-token access coverage and internal-error handling coverage.
- [x] Hardened tech-stack dependency line with security patch upgrades:
  - `next` -> `16.2.3`
  - `next-intl` -> `4.9.1`
  - `react` / `react-dom` -> `19.2.5`
  - `better-auth` -> `1.6.2`
  - `@sentry/nextjs` / `@sentry/react` -> `10.48.0`
  - `posthog-js` -> `1.367.0`
  - `vitest` / `@vitest/coverage-v8` -> `4.1.4`
  - plus aligned supporting dependency ranges in `package.json`
- [x] Removed unused direct dependency `styled-components` from app dependencies.
- [x] Enforced server-only ML fallback boundary in `src/services/embedding.service.ts` (`server-only` + lazy dynamic import for `@huggingface/transformers` pipeline).
- [x] Removed legacy NextAuth schema debris from Prisma (`Account`, `Session`, `VerificationToken`) and added migration `prisma/migrations/20260411111834_drop_legacy_nextauth_models/migration.sql`.
- [x] Closed Point 10 maintainability hotspots with bounded extraction:
  - `src/components/Header.tsx` -> extracted `src/components/header/HeaderMobileMenuDialog.tsx`
  - `src/app/dashboard/page.tsx` -> extracted `src/app/dashboard/_lib/build-dashboard-copy.ts` and `src/app/dashboard/_lib/build-dashboard-view-model.ts`
  - Added focused tests:
    - `src/components/header/HeaderMobileMenuDialog.test.tsx`
    - `src/app/dashboard/_lib/build-dashboard-copy.test.ts`
    - `src/app/dashboard/_lib/build-dashboard-view-model.test.ts`
  - Added strict regression guard script + CI step:
    - `scripts/hotspot-audit.mjs`
    - `npm run hotspot:audit:strict`
    - `.github/workflows/ci.yml` quality gate entry

## Latest Incremental Update (2026-04-11, Point-1 Coverage/Scale Pass)

- [x] Restored `src/services/ops.service.ts` with repository delegation to recover cron/admin/result route stability.
- [x] Expanded repository pattern on high-traffic dashboard reads:
  - added `src/repositories/dashboard.repository.ts`
  - migrated `src/services/dashboard.service.ts` to repository-backed reads
  - added focused delegation test `src/services/__tests__/dashboard.service.test.ts`
- [x] Added background-job monitoring visibility in Admin dashboard:
  - `src/services/admin.service.ts` (`getAdminJobHealthData`)
  - `src/app/actions/admin-actions.ts` (`getAdminJobHealth`)
  - `src/app/admin/components/AdminJobHealthCard.tsx`
  - `src/app/admin/page.tsx` wiring
  - focused action test `src/app/actions/admin-actions.job-health.test.ts`
- [x] Validation snapshot for this pass:
  - `npm run test -- --run src/services/__tests__/dashboard.service.test.ts src/app/actions/admin-actions.job-health.test.ts src/app/api/payment/webhook/__tests__/route.test.ts src/app/api/subscription/webhook/__tests__/route.test.ts src/app/api/jobs/document-worker/failure/__tests__/route.test.ts` -> PASS (20/20)
  - `npm run typecheck` -> PASS
  - `npm run test:coverage -- --run` -> PASS (89 files, 281 tests)
  - `npm run i18n:audit:strict` -> PASS
  - `npm run architecture:audit:strict` -> PASS
  - `npm run theme:audit:strict` -> PASS
  - `python ..\\.agents\\skills\\insurance-compliance\\scripts\\audit-i18n.py --target src` -> PASS

## Latest Incremental Update (2026-04-11, Testing + Payment E2E Reliability Pass)

- [x] Added deterministic test-fixture API for payment lifecycle E2E:
  - `src/app/api/test-utils/payment-fixture/route.ts`
  - strict guardrails: disabled in production + header secret gate via `E2E_TEST_SECRET`
- [x] Replaced `e2e/payment.spec.ts` with critical-path coverage for:
  - webhook failure -> retry status transition
  - webhook captured unlock transition
  - duplicate webhook idempotency (`x-razorpay-event-id`)
  - invalid webhook signature rejection
  - paywall UI checkout simulation with create-order + verify request assertions
- [x] Hardened CI E2E runtime for real payment lifecycle tests:
  - `.github/workflows/ci.yml` e2e job now provisions `pgvector/pgvector:pg16`
  - applies schema migrations via `npx prisma migrate deploy`
  - injects `E2E_TEST_SECRET` and `RAZORPAY_WEBHOOK_SECRET` for deterministic webhook verification
- [x] Added local env guidance for deterministic E2E in `.env.example` (`E2E_TEST_SECRET`).

## Latest Incremental Update (2026-04-11, Payment Failure-Path Follow-Up)

- [x] Added one more user-visible payment failure-path E2E in `e2e/payment.spec.ts`.
  - Covers verify-failure -> error alert -> retry CTA transition in the paywall unlock UI.
  - Validation: `npx playwright test e2e/payment.spec.ts -g "surfaces verification failure and switches to retry state" --reporter=line` -> PASS
- [x] Revalidated deterministic auth/admin harness locally with a temporary `E2E_TEST_SECRET`.
  - `npm run typecheck` -> PASS
  - `npx playwright test e2e/auth.spec.ts --reporter=line` with temporary `E2E_TEST_SECRET` -> PASS
  - `npm run test:e2e:critical` -> PASS (6/6)
  - Auth OTP deterministic harness now validates session establishment and protected dashboard rendering without navigation-race instability.

## Latest Incremental Update (2026-04-11, Breadth Follow-Through Pass)

- [x] Expanded repository rollout on compare read-heavy surface:
  - added `src/repositories/compare.repository.ts`
  - routed compare reads through repository in `src/services/compare.service.ts`
  - added focused test `src/services/__tests__/compare.service.test.ts`
- [x] Expanded queue/cron observability in admin health surface:
  - added `recentCronErrors24h` and `recentQueueErrors24h` to `AdminJobHealth`
  - populated both metrics in `src/services/admin.service.ts` via `countErrorLogs(...)`
  - surfaced metrics in `src/app/admin/components/AdminJobHealthCard.tsx`
  - added translation keys in `messages/en.json` and `messages/hi.json`
  - added focused test `src/services/__tests__/admin.service.test.ts`
  - updated focused action test `src/app/actions/admin-actions.job-health.test.ts`
- [x] Added one more cron failure-path test branch:
  - `src/app/api/cron/payment-reconciliation/__tests__/route.test.ts` now covers per-item order-fetch errors while sweep continues.
- [x] Validation snapshot for this pass:
  - `npm run test -- --run src/services/__tests__/compare.service.test.ts src/services/__tests__/admin.service.test.ts src/app/actions/admin-actions.job-health.test.ts src/app/api/cron/payment-reconciliation/__tests__/route.test.ts` -> PASS (11/11)
  - `npm run typecheck` -> PASS
  - `npm run architecture:audit:strict` -> PASS
  - `npm run i18n:audit:strict` -> PASS

## Latest Incremental Update (2026-04-11, Breadth Continuation Pass)

- [x] Added queue worker route failure-path coverage:
  - new test file `src/app/api/jobs/document-worker/__tests__/route.test.ts`
  - covered invalid HTTP secret auth rejection
  - covered invalid envelope and unknown job handling branches
  - covered runtime scan-analysis failure with `markScanFailed` failover
- [x] Expanded repository rollout on taxonomy service reads:
  - added `src/repositories/taxonomy.repository.ts`
  - migrated `src/services/taxonomy.service.ts` to repository delegation
  - added focused test `src/services/__tests__/taxonomy.service.test.ts`
- [x] Extended queue/cron observability to trend windows:
  - `AdminJobHealth` now includes 1h + 24h cron/queue high-severity error counts
  - wired metrics in `src/services/admin.service.ts`
  - surfaced in `src/app/admin/components/AdminJobHealthCard.tsx`
  - updated action/service tests and i18n keys
- [x] Validation snapshot for this pass:
  - `npm run test -- --run src/app/api/jobs/document-worker/__tests__/route.test.ts src/services/__tests__/taxonomy.service.test.ts src/services/__tests__/admin.service.test.ts src/app/actions/admin-actions.job-health.test.ts` -> PASS (10/10)
  - `npm run typecheck` -> PASS
  - `npm run architecture:audit:strict` -> PASS
  - `npm run i18n:audit:strict` -> PASS

## Latest Incremental Update (2026-04-11, i18n+Theme 10/10 Hardening Pass)

- [x] Added strict locale-quality governance:
  - new script `scripts/i18n-locale-quality-audit.mjs`
  - new commands:
    - `npm run i18n:locale:audit`
    - `npm run i18n:locale:audit:strict`
  - CI gate added with `I18N_LOCALE_MAX_FINDINGS=0`
- [x] Localized remaining Hindi strings in high-impact residual pockets and fixed placeholder parity issue in `messages/hi.json`.
- [x] Expanded strict theme audit scope from selected surfaces to full UI surface:
  - `src/app`, `src/components`, `src/features` (excluding `src/app/api/**`)
  - removed residual hardcoded palette literals from pricing/refer/track/insurance/auth/onboarding/upload surfaces
- [x] Tightened theme CI baseline from `THEME_AUDIT_MAX_FINDINGS=117` to `0`.
- [x] Validation snapshot for this pass:
  - `npm run typecheck` -> PASS
  - `npm run theme:audit:strict` -> PASS
  - `npm run i18n:audit:strict` -> PASS
  - `npm run i18n:locale:audit:strict` -> PASS

## Latest Incremental Update (2026-04-11, Backend Runtime-Health Hardening Pass)

- [x] Hardened runtime dependency-health backend contract in `src/app/api/health/runtime/route.ts`:
  - added explicit `degradedChecks` and `warningChecks` fields to the response payload
  - added resilient queue provider fallback (`unknown`) when provider lookup throws
  - preserved Redis as warning-only signal while keeping critical health semantics stable
- [x] Added deterministic backend failure-path coverage:
  - `src/app/api/health/runtime/__tests__/route.test.ts` (6 tests)
  - covers healthy path, DB failure, queue URL failure, queue provider failure fallback, Redis warning-only branch, AI credential failure
- [x] Validation snapshot for this pass:
  - `npm run test -- src/app/api/health/runtime/__tests__/route.test.ts --run` -> PASS (6/6)
  - `npx eslint src/app/api/health/runtime/route.ts src/app/api/health/runtime/__tests__/route.test.ts --max-warnings 0` -> PASS
  - `npm run typecheck` -> PASS
  - `npm run architecture:audit:strict` -> PASS
