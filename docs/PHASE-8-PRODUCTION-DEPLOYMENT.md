# Phase 8: Production Deployment & Monitoring Setup

> Historical archive: this phase document is retained for audit history only. Current deployment verification lives in [post-deployment-monitoring.md](./post-deployment-monitoring.md), [MASTER-PLAN-STATUS.md](../MASTER-PLAN-STATUS.md), and the `verify:deploy` / `monitor:prod` scripts.

**Status:** Ready for Production Deployment  
**Deployment Date:** 2026-04-07  
**Team:** Backend + DevOps + SRE

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Configuration](#environment-configuration)
3. [Sentry Setup](#sentry-setup)
4. [Monitoring Configuration](#monitoring-configuration)
5. [Deployment Steps](#deployment-steps)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Production Runbook](#production-runbook)
8. [On-Call Procedures](#on-call-procedures)

---

## Pre-Deployment Checklist

### Code Review & Testing
- [ ] All Phase 7 integration routes code reviewed (2+ reviewers)
- [ ] Unit tests pass: `npm test` (coverage > 80%)
- [ ] Integration tests pass: `npm run test:integration`
- [ ] E2E tests pass: `npm run test:e2e`
- [ ] Load test performance acceptable: `npm run test:load`
- [ ] Security audit complete: `npm run audit`
- [ ] No high-severity vulnerabilities
- [ ] Accessibility check: `npm run test:a11y`

### Database Preparation
- [ ] Backup main database (point-in-time restore ready)
- [ ] Test migration on staging: `npx prisma migrate deploy`
- [ ] Verify ErrorLog table structure
- [ ] Verify RateLimitAnomaly table structure
- [ ] Confirm all indexes created: `SELECT * FROM pg_stat_indexes`
- [ ] Database replication lag < 1s

### Infrastructure Validation
- [ ] CDN cache settings configured
- [ ] WAF rules updated for new endpoints
- [ ] Rate limiting on edge servers configured
- [ ] DDoS protection enabled
- [ ] SSL certificates valid and renewed
- [ ] Database connection pooling optimized
- [ ] Cache layer (Redis) ready

### Documentation
- [ ] Runbook updated and shared with team
- [ ] On-call procedures documented
- [ ] Incident response template created
- [ ] Team briefed on new error routes
- [ ] Knowledge base updated
- [ ] Status page info prepared

---

## Environment Configuration

### Production `.env.production` File

```bash
# ═══════════════════════════════════════════════════════════════════════════
# DATABASE CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════

# Primary database (PgBouncer pooler for runtime queries)
DATABASE_URL="postgresql://neondb_owner:PASSWORD@ep-XXXXX-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Direct PostgreSQL connection for migrations
DIRECT_URL="postgresql://neondb_owner:PASSWORD@ep-XXXXX.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# ═══════════════════════════════════════════════════════════════════════════
# ERROR HANDLING & MONITORING
# ═══════════════════════════════════════════════════════════════════════════

# Sentry - Error Tracking
SENTRY_DSN="https://KEY@sentry.io/PROJECT_ID"
SENTRY_ENVIRONMENT="production"
SENTRY_TRACES_SAMPLE_RATE="0.1"
SENTRY_PROFILES_SAMPLE_RATE="0.05"

# Error Logging
ERROR_LOGGING_ENABLED="true"
ERROR_LOG_RETENTION_DAYS="90"
ERROR_LOG_BUFFER_SIZE="10000"

# Circuit Breaker
CIRCUIT_BREAKER_ENABLED="true"
CIRCUIT_BREAKER_FAILURE_THRESHOLD="5"
CIRCUIT_BREAKER_TIMEOUT_MS="60000"

# ═══════════════════════════════════════════════════════════════════════════
# RATE LIMITING CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════

# Per-scope rate limits (requests/hour unless specified)
RATE_LIMIT_PAYMENTS="50"           # Payment endpoints
RATE_LIMIT_UPLOADS="10"            # Document uploads
RATE_LIMIT_SEARCH="60"             # Search queries
RATE_LIMIT_OTP="3/minute"          # OTP requests

# Rate Limit Anomaly Detection
RATE_LIMIT_ANOMALY_THRESHOLD="100"
RATE_LIMIT_ANOMALY_WINDOW_MINUTES="5"

# ═══════════════════════════════════════════════════════════════════════════
# ADMIN ACCESS
# ═══════════════════════════════════════════════════════════════════════════

# Secure admin token (from vault/secrets manager)
ADMIN_TOKEN="$(vault read -field=admin_token secret/insurance-clarity/admin)"

# ═══════════════════════════════════════════════════════════════════════════
# PAYMENT PROVIDER (Razorpay)
# ═══════════════════════════════════════════════════════════════════════════

RAZORPAY_KEY_ID="$(vault read -field=key_id secret/razorpay/production)"
RAZORPAY_KEY_SECRET="$(vault read -field=key_secret secret/razorpay/production)"

# ═══════════════════════════════════════════════════════════════════════════
# FEATURE FLAGS
# ═══════════════════════════════════════════════════════════════════════════

FEATURE_ERROR_HANDLING="enabled"
FEATURE_RATE_LIMITING="enabled"
FEATURE_CIRCUIT_BREAKER="enabled"
FEATURE_SENTRY_MONITORING="enabled"

# ═══════════════════════════════════════════════════════════════════════════
# LOGGING & DEBUGGING
# ═══════════════════════════════════════════════════════════════════════════

LOG_LEVEL="info"
LOG_FORMAT="json"
DEBUG="false"
VERBOSE_ERRORS="false"  # Always false in production

# ═══════════════════════════════════════════════════════════════════════════
# SECURITY
# ═══════════════════════════════════════════════════════════════════════════

CSRFProtection="enabled"
SecurityHeaders="enabled"
RateLimitByIp="enabled"
IpMaskingEnabled="true"  # For GDPR compliance
```

### Vault Integration Script

```bash
#!/bin/bash
# scripts/env-from-vault.sh
# Populate .env.production from HashiCorp Vault

set -e

VAULT_ADDR="https://vault.company.com"
VAULT_TOKEN="${VAULT_TOKEN:-$(cat ~/.vault-token)}"

echo "Fetching secrets from Vault..."

# Database credentials
DB_PASSWORD=$(vault kv get -field=password secret/neon/production)
DIRECT_URL_HOST=$(vault kv get -field=direct_url_host secret/neon/production)

# Sentry
SENTRY_DSN=$(vault kv get -field=sentry_dsn secret/sentry/production)

# Razorpay
RAZORPAY_KEY_ID=$(vault kv get -field=key_id secret/razorpay/production)
RAZORPAY_KEY_SECRET=$(vault kv get -field=key_secret secret/razorpay/production)

# Admin Token
ADMIN_TOKEN=$(vault kv get -field=admin_token secret/insurance-clarity/admin)

# Generate .env.production
cat > .env.production << EOF
DATABASE_URL="postgresql://neondb_owner:${DB_PASSWORD}@ep-XXXXX-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://neondb_owner:${DB_PASSWORD}@${DIRECT_URL_HOST}/neondb?sslmode=require"
SENTRY_DSN="${SENTRY_DSN}"
RAZORPAY_KEY_ID="${RAZORPAY_KEY_ID}"
RAZORPAY_KEY_SECRET="${RAZORPAY_KEY_SECRET}"
ADMIN_TOKEN="${ADMIN_TOKEN}"
EOF

echo "✓ .env.production populated from Vault"
chmod 600 .env.production
```

---

## Sentry Setup

### 1. Create Sentry Project

```bash
# Using Sentry CLI
sentry-cli releases create insurance-clarity@1.0.0
sentry-cli releases set-commits insurance-clarity@1.0.0 --auto
```

### 2. Configure Sentry in Next.js

**File:** `next.config.js`

```javascript
const withSentryConfig = require("@sentry/nextjs/config");

const nextConfig = {
  // ... your config
};

module.exports = withSentryConfig(nextConfig, {
  org: "insurance-clarity",
  project: "api",
  // Only show Sentry client logs during development
  silent: !process.env.DEBUG,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  autoSessionTracking: true,
  disableLogger: true,
  tunnelRoute: "/monitoring",
});
```

### 3. Configure Alert Rules

**High Priority Alerts:**

```
Alert Rule 1: CRITICAL Errors
- Condition: error.severity = "CRITICAL"
- Frequency: Every instance
- Action: Page on-call immediately
- Channels: Slack #incidents, PagerDuty

Alert Rule 2: Error Rate Spike
- Condition: error_rate > 5%
- Window: 5 minutes
- Action: Slack notification, then page if sustained
- Channels: Slack #errors

Alert Rule 3: Payment Failures
- Condition: error.route contains "/api/payment"
- Threshold: 10 errors in 5 minutes
- Action: Email on-call
- Channels: Email, Slack #payments

Alert Rule 4: Authentication Failures
- Condition: error.code = UNAUTHORIZED
- Threshold: 50 in 5 minutes
- Action: Investigate potential attack
- Channels: Slack #security
```

### 4. Configure Source Map Upload

```bash
# In CI/CD pipeline
sentry-cli releases files upload-sourcemaps . \
  --release=insurance-clarity@1.0.0 \
  --rewrite \
  --ignore-missing
```

---

## Monitoring Configuration

### Grafana Dashboard Setup

**Dashboard Panels:**

```json
{
  "dashboard": {
    "title": "Insurance Clarity - Error Monitoring",
    "panels": [
      {
        "title": "Error Rate",
        "query": "SELECT rate(error_count[5m]) FROM error_log"
      },
      {
        "title": "Response Time by Route",
        "query": "SELECT route, histogram_quantile(0.95, response_time) FROM metrics"
      },
      {
        "title": "Circuit Breaker Status",
        "query": "SELECT service, state FROM circuit_breaker_metrics"
      },
      {
        "title": "Rate Limit Violations",
        "query": "SELECT scope, count(*) FROM rate_limit_anomaly GROUP BY scope"
      },
      {
        "title": "Database Latency",
        "query": "SELECT percentile(query_time, 95) FROM db_metrics"
      }
    ]
  }
}
```

### CloudWatch Integration

```bash
# Send error logs to CloudWatch
aws logs create-log-group --log-group-name /insurance-clarity/errors
aws logs create-log-stream --log-group-name /insurance-clarity/errors --log-stream-name production

# Set retention
aws logs put-retention-policy \
  --log-group-name /insurance-clarity/errors \
  --retention-in-days 30
```

### Slack Integration

**Channels:**
- `#errors` - General error notifications
- `#critical` - CRITICAL and HIGH severity only
- `#payments` - Payment-specific errors
- `#security` - Security-related incidents
- `#incidents` - Incident management

**Slack Webhook Configuration:**

```bash
# In Sentry UI: Settings → Integrations → Slack

# Notification template
Error in {project}
{title}
Severity: {severity}
Route: {tags[route]}
User: {tags[userId]}
[View in Sentry]({url})
```

---

## Deployment Steps

### Step 1: Pre-Deployment (T-30 minutes)

```bash
# 1. Create release branch
git checkout -b deploy/phase-7-8-$(date +%Y%m%d)

# 2. Verify all tests pass
npm run test:ci
npm run test:e2e

# 3. Build and check for errors
npm run build

# 4. Create backup
pg_dump ${DATABASE_URL} > backup-$(date +%Y%m%d-%H%M%S).sql

# 5. Notify team
echo "🚀 Starting deployment in 30 minutes"
```

### Step 2: Database Migration (T-15 minutes)

```bash
# Run migration against production
NODE_ENV=production npx prisma migrate deploy

# Verify migration
psql $DIRECT_URL -c "\d ErrorLog"
psql $DIRECT_URL -c "\d RateLimitAnomaly"

# Check migration history
```

### Step 3: Application Deployment (T-0)

```bash
# Using Vercel CLI
vercel deploy --prod --yes

# Or using manual deployment
npm run build
npm run start

# Verify health check
curl -s https://api.insurance-clarity.com/health | jq
```

### Step 4: Post-Deployment (T+5 minutes)

```bash
# Smoke tests
npm run test:smoke

# Verify endpoints responding
curl -s https://api.insurance-clarity.com/api/health
curl -s https://api.insurance-clarity.com/api/payment-integrated/status

# Check Sentry for immediate errors
# Navigate to Sentry dashboard
```

---

## Post-Deployment Verification

### 1. Health Checks

```bash
#!/bin/bash
# scripts/post-deploy-checks.sh

echo "🔍 Running post-deployment health checks..."

# Check API responding
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "https://api.insurance-clarity.com/health")
if [ "$HEALTH" -ne 200 ]; then
  echo "❌ Health check failed: $HEALTH"
  exit 1
fi
echo "✓ API health check passed"

# Check database connection
psql $DIRECT_URL -c "SELECT 1" > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "❌ Database connection failed"
  exit 1
fi
echo "✓ Database connection verified"

# Check error logging
ERROR_COUNT=$(psql $DIRECT_URL -t -c "SELECT COUNT(*) FROM \"ErrorLog\" WHERE \"createdAt\" > NOW() - INTERVAL '5 minutes';")
echo "✓ Recent errors: $ERROR_COUNT"

# Check Sentry DSN
if ! grep -q "SENTRY_DSN" .env.production; then
  echo "❌ Sentry DSN not configured"
  exit 1
fi
echo "✓ Sentry configured"

echo "✅ All post-deployment checks passed!"
```

### 2. Error Dashboard

Navigate to: `https://dashboard.insurance-clarity.com/admin/errors`

Check:
- [ ] Dashboard loads without errors
- [ ] Real-time data showing
- [ ] Filters work (days, severity, route)
- [ ] Admin authentication working

### 3. Sentry Events

Check: https://sentry.io/organizations/insurance-clarity/insurance-clarity/

1. Verify events being captured
2. Check for any new error patterns
3. Confirm alert notifications working

### 4. Rate Limiting

Test rate limits:

```bash
# Should succeed
for i in {1..5}; do
  curl -X POST "https://api.insurance-clarity.com/api/payment-integrated/create-order" \
    -H "Authorization: Bearer TOKEN" \
    -d '{"scanId":"test"}'
done

# Should get 429 (too many requests)
curl -X POST "https://api.insurance-clarity.com/api/payment-integrated/create-order" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"scanId":"test"}'
```

---

## Production Runbook

### Issue: High Error Rate

**Detection:** Sentry alert or Slack notification  
**SLA:** Respond within 5 minutes

```sql
-- Query 1: Current error rate
SELECT 
  DATE_TRUNC('minute', "createdAt") as minute,
  COUNT(*) as error_count,
  route,
  severity
FROM "ErrorLog"
WHERE "createdAt" > NOW() - INTERVAL '30 minutes'
GROUP BY DATE_TRUNC('minute', "createdAt"), route, severity
ORDER BY minute DESC, error_count DESC;

-- Query 2: Top error codes
SELECT 
  "errorCode",
  "severity",
  COUNT(*) as count,
  STRING_AGG(DISTINCT "route", ', ') as routes
FROM "ErrorLog"
WHERE "createdAt" > NOW() - INTERVAL '5 minutes'
GROUP BY "errorCode", "severity"
ORDER BY count DESC
LIMIT 10;
```

**Actions:**
1. [ ] Identify affected route
2. [ ] Check service dependencies status
3. [ ] Review recent deployments
4. [ ] Check database performance
5. [ ] Decide: rollback vs. patch

---

## On-Call Procedures

### Escalation Policy

```
Level 1 (Slack): 5 minutes
  - Rule: Error rate > 2%
  - Action: Post in #errors channel

Level 2 (Page): Immediate
  - Rule: Error rate > 5% OR CRITICAL error
  - Action: Page on-call engineer

Level 3 (Manager): 10 minutes
  - Rule: Sustained outage > 15 minutes
  - Action: Escalate to engineering manager

Level 4 (CTO): 20 minutes
  - Rule: Service down > 30 minutes
  - Action: Escalate to CTO
```

### On-Call Checklist

- [ ] Acknowledge alert within 1 minute
- [ ] Check Sentry dashboard
- [ ] Query error database for patterns
- [ ] Check system status page
- [ ] Communicate status in Slack
- [ ] Execute remediation steps
- [ ] Document incident
- [ ] Schedule post-mortem (if needed)

---

## Rollback Procedure

If issues occur after deployment:

```bash
#!/bin/bash
# scripts/rollback.sh

echo "🔄 Rolling back to previous version..."

# Get previous version
PREVIOUS_VERSION=$(git describe --tags --abbrev=0 HEAD^)

# Rollback code
git checkout $PREVIOUS_VERSION
npm run build

# Rollback database (if needed)
if [ -f "backup-latest.sql" ]; then
  psql $DIRECT_URL < backup-latest.sql
  echo "✓ Database rolled back"
fi

# Verify
npm run test:smoke

echo "✅ Rollback complete. Services restored."
```

---

## Success Metrics (KPIs)

**Track after deployment:**

| Metric | Target | Current |
|--------|--------|---------|
| Error Rate | < 0.5% | ? |
| Mean Response Time | < 100ms | ? |
| P95 Latency | < 200ms | ? |
| API Availability | > 99.9% | ? |
| Rate Limit Accuracy | > 99.9% | ? |
| Alert Response Time | < 5min | ? |

---

**Deployment Owner:** `@team`  
**Deployment Date:** `2026-04-07`  
**Status:** ✅ Ready for Production

