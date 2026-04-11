# Production SLO Targets

This document defines baseline service level objectives for critical product journeys.

## SLOs

| Journey | SLI | Target |
|---|---|---|
| API availability | Successful 2xx/3xx API responses | 99.9% per 30 days |
| Scan pipeline latency | Upload accepted -> report completed | p95 <= 120s |
| Payment verification | Successful verification after checkout | >= 99.5% per 30 days |
| Error budget burn | 5xx responses across public APIs | <= 0.1% per 30 days |

## Alert Thresholds

- API availability drops below 99.9% over rolling 1h.
- Runtime health endpoint returns degraded/failed for 2 consecutive checks.
- Payment verification success drops below 99% over rolling 1h.
- Scan completion p95 exceeds 180s for 15 minutes.

## Owners

- Platform: API availability, runtime dependencies, cron health.
- Payments: checkout and verification success.
- Product Engineering: scan completion latency and user-facing recovery states.

## Review Cadence

- Weekly review in engineering ops sync.
- Monthly threshold tuning based on production trends.
