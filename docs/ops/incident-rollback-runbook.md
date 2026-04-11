# Incident and Rollback Runbook

## Severity Levels

- SEV-1: checkout/auth/scan unavailable for most users.
- SEV-2: partial outage, major degradation, or sustained error spikes.
- SEV-3: isolated failures with workaround.

## First 15 Minutes

1. Confirm impact: check `/api/health/plans` and `/api/health/runtime`.
2. Triage failing surface: scan, auth, payment, or cron.
3. Post incident channel update with blast radius and mitigation ETA.
4. Freeze deploys until owner marks incident stable.

## Rollback Decision Checklist

- Is customer impact ongoing after mitigation attempts?
- Did the issue begin after a recent deployment?
- Can we safely disable only the affected feature flag/path?

If "yes" to any two conditions, initiate rollback.

## Rollback Steps (Vercel)

1. Promote previous known-good deployment.
2. Re-run smoke checks:
   - homepage
   - `/scan`
   - payment status endpoint
   - runtime health endpoint
3. Verify alerts clear for 10 minutes.
4. Publish incident update with rollback version and next steps.

## Post-Incident Actions

- Create root-cause analysis issue within 24 hours.
- Add regression test for the specific failure.
- Update SLO/alert thresholds if needed.
