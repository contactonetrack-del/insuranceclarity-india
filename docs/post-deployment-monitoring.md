# Post-Deployment Monitoring Guide

Current production verification is script-driven and aligned with the live platform surface.

## Source of truth

- [MASTER-PLAN-STATUS.md](../MASTER-PLAN-STATUS.md)
- [README.md](../README.md)
- `npm run verify:deploy`
- `npm run monitor:prod`

## Standard checks

Run these after every production deployment:

```bash
npm run monitor:prod
npm run verify:deploy
```

Optional live probes:

```bash
npm run verify:deploy -- --check-payment
npm run verify:deploy -- --check-sentry
```

## What `monitor:prod` verifies

- Homepage responds successfully
- `/api/health/plans` returns healthy
- `/api/health/runtime` returns healthy
- CSRF bootstrap succeeds

## What `verify:deploy` verifies

- Homepage responds successfully
- `/api/health/plans` returns healthy
- `/api/health/runtime` returns healthy
- CSRF bootstrap succeeds
- Sample PDF upload succeeds
- Scan processing completes
- Report retrieval succeeds

## When to investigate immediately

- `/api/health/runtime` returns degraded
- Upload creates a scan but the scan stays `PENDING` or turns `FAILED`
- Report retrieval returns `404`, `422`, or `500`
- Queue callbacks resolve to a non-canonical deployment URL
- Gemini or other AI-provider quotas cause repeated fallback or hard failure

## Current canonical routes

- `/api/upload`
- `/api/result/[id]`
- `/api/payment/create-order`
- `/api/payment/verify`
- `/api/health/plans`
- `/api/health/runtime`

Deprecated `*-integrated` routes are no longer part of the supported production surface.
