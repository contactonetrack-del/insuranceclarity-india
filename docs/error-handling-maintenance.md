# Error Handling Maintenance & Troubleshooting

Operational guide for maintaining error handling systems, troubleshooting common issues, and best practices for production support.

## Table of Contents
- [Daily Operations](#daily-operations)
- [Troubleshooting Guide](#troubleshooting-guide)
- [Performance Optimization](#performance-optimization)
- [Security Considerations](#security-considerations)
- [Maintenance Tasks](#maintenance-tasks)
- [Support Runbook](#support-runbook)

---

## Daily Operations

### Morning Health Check

Start each day with this health check (5 minutes):

```bash
#!/bin/bash
# health-check.sh

# 1. Check error rate
echo "Checking error rate..."
curl -s https://api.sentry.io/api/0/projects/ORG/PROJECT/stats/ \
  -H "Authorization: Bearer SENTRY_TOKEN" | jq '.[] | select(.timestamp | fromdateiso8601 > now - 3600)'

# 2. Check API availability
echo "Checking API health..."
curl -s https://yourdomain.com/api/health | jq .

# 3. Check database connectivity
echo "Checking database..."
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT NOW();"

# 4. Check critical service dependencies
echo "Checking Razorpay..."
curl -s https://api.razorpay.com/v1/keys/id -u $RAZORPAY_KEY:$RAZORPAY_SECRET | jq .

echo "Checking Meilisearch..."
curl -s https://meilisearch.example.com/health | jq .
```

### Hourly Monitoring

Monitor these metrics every hour:

| Metric | Healthy | Warning | Critical |
|--------|---------|---------|----------|
| Error Rate | <0.5% | 0.5-2% | >2% |
| P95 Latency | <500ms | 500-1000ms | >1000ms |
| Ray Limit 429s | <10/hour | 10-50/hour | >50/hour |
| Payment Success | >99% | 95-99% | <95% |
| DB Connections | <50% | 50-80% | >80% |

---

## Troubleshooting Guide

### Issue: High Error Rate (>2%)

**Diagnosis:**
```sql
-- Check which endpoint has errors
SELECT route, method, COUNT(*) as error_count
FROM error_logs
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY route, method
ORDER BY error_count DESC
LIMIT 10;

-- Check error distribution
SELECT error_code, COUNT(*) as count
FROM error_logs
WHERE created_at > NOW() - INTERVAL '1 hour'
  AND severity IN ('HIGH', 'CRITICAL')
GROUP BY error_code
ORDER BY count DESC;
```

**Common Causes:**

1. **External Service Down (Razorpay, Meilisearch)**
   ```typescript
   // Check integration status
   const razorpayStatus = await fetch('https://api.razorpay.com/v1/health');
   const meilisearchStatus = await fetch('https://meilisearch.example.com/health');
   ```

2. **Database Connection Pool Exhaustion**
   ```sql
   SELECT state, count(*)
   FROM pg_stat_activity
   GROUP BY state;
   ```

3. **Memory Leak or High Load**
   ```bash
   # Check Node process memory
   ps aux | grep node
   # Check system resources
   top -b -n 1 | head -20
   ```

**Resolution Steps:**

1. Identify affected routes:
   ```bash
   curl -s https://yourdomain.com/api/health?verbose=true
   ```

2. Check external service status:
   ```bash
   # Razorpay
   curl https://status.razorpay.com/api/v2/status.json
   ```

3. Scale up if needed:
   ```bash
   # For Vercel
   vercel env ls
   vercel logs --follow

   # For Docker/Kubernetes
   kubectl scale deployment nextjs-app --replicas=3
   ```

4. Clear cached errors in Sentry:
   ```bash
   # Sentry CLI to resolve error group
   sentry-cli releases files list $RELEASE_VERSION
   ```

### Issue: Rate Limiting False Positives

**Symptoms:**
- Users get 429 errors on first request
- Errors from different IPs for same user
- Pattern suggests shared IP (office/VPN)

**Investigation:**
```sql
-- Check rate limit triggers
SELECT ip_address, scope, COUNT(*) as request_count, 
       MAX(created_at) as last_request
FROM rate_limit_logs
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY ip_address, scope
HAVING COUNT(*) > 10
ORDER BY request_count DESC;
```

**Solutions:**

1. **Whitelist office/VPN IP:**
   ```typescript
   // In rate-limit.ts
   const WHITELISTED_IPS = ['203.0.113.0/24', '198.51.100.0/24'];

   function isWhitelisted(ip: string): boolean {
     return WHITELISTED_IPS.some(cidr => isInRange(ip, cidr));
   }
   ```

2. **Use user-based instead of IP-based:**
   ```typescript
   // Group by user_id instead of ip for authenticated requests
   const key = user ? `user_${user.id}` : `ip_${ip}`;
   ```

3. **Increase limit for premium users:**
   ```typescript
   const limit = user?.isPremium ? 200 : 60;
   ```

### Issue: Payment Verification Failures

**Symptoms:**
```
1. Order created (201)
2. Payment captured (200)
3. Verify endpoint returns 500
```

**Root Causes:**

1. **Signature Verification Failed**
   ```typescript
   // Debug signature
   function debugSignature(payment) {
     const expected = createHmac('sha256', razorpaySecret)
       .update(`${orderId}|${paymentId}`)
       .digest('hex');
     
     console.log({
       expected,
       actual: signature,
       match: expected === signature,
     });
   }
   ```

2. **Database Write Conflict**
   ```sql
   -- Check for duplicate payment records
   SELECT scan_id, COUNT(*) as count
   FROM payments
   WHERE created_at > NOW() - INTERVAL '1 hour'
   GROUP BY scan_id
   HAVING COUNT(*) > 1;
   ```

3. **Service Timeout**
   ```typescript
   // Add timeout wrapper
   const verifyWithTimeout = async (data) => {
     return Promise.race([
       verifyPayment(data),
       new Promise((_, reject) =>
         setTimeout(() => reject(new Error('Timeout')), 30000)
       ),
     ]);
   };
   ```

**Resolution:**

```typescript
// Add idempotency and retry logic
async function verifyPaymentSafely(data, idempotencyKey) {
  // Check if already verified
  const existing = await db.payments.findUnique({
    where: { idempotencyKey },
  });

  if (existing) {
    return existing; // Return cached result
  }

  // Verify new payment
  const verified = await verifyPayment(data);

  // Save with idempotency key
  return await db.payments.create({
    data: {
      ...verified,
      idempotencyKey,
    },
  });
}
```

### Issue: Memory Leak or Slow Performance

**Symptoms:**
- Response time gradually increases
- Memory usage grows over time
- Eventually crashes with OOM

**Debug Steps:**

1. **Take heap snapshot:**
   ```typescript
   // src/app/api/debug/heap.ts
   export async function GET() {
     const heapdump = require('heapdump');
     const filename = `/tmp/heapdump-${Date.now()}.heapsnapshot`;
     heapdump.writeSnapshot(filename);
     return Response.json({ file: filename });
   }
   ```

2. **Check for dangling references:**
   ```typescript
   // Look for circular dependencies
   const circularReferences = findCircular(errorHandler);
   console.log(circularReferences);
   ```

3. **Profile CPU usage:**
   ```bash
   node --prof src/index.ts
   node --prof-process isolate-*.log > profile.txt
   ```

**Common Fixes:**

- Clear interval timers:
  ```typescript
  // Wrong: timer never clears
  setInterval(() => fetchErrors(), 60000);

  // Right: clear interval on unmount
  const intervalId = setInterval(() => fetchErrors(), 60000);
  return () => clearInterval(intervalId);
  ```

- Remove event listeners:
  ```typescript
  // Wrong: listeners accumulate
  window.addEventListener('error', handler);

  // Right: cleanup
  return () => window.removeEventListener('error', handler);
  ```

- Clear cached data:
  ```typescript
  // Wrong: cache grows unbounded
  const cache = {};
  cache[key] = value;

  // Right: limit cache size
  if (Object.keys(cache).length > 1000) {
    delete cache[Object.keys(cache)[0]];
  }
  ```

---

## Performance Optimization

### Error Rate Calculation Optimization

**Current:** O(N) scan every hour

```sql
-- SLOW: Counts all errors
SELECT COUNT(*) 
FROM error_logs 
WHERE created_at > NOW() - INTERVAL '1 hour';
```

**Optimized:** Incremental update

```sql
-- Create error_summary table for fast queries
CREATE TABLE error_summary (
  hour TIMESTAMP,
  error_count INT,
  affected_users INT,
  UNIQUE(hour)
);

-- Update every minute
INSERT INTO error_summary (hour, error_count, affected_users)
SELECT 
  DATE_TRUNC('hour', NOW()),
  COUNT(*),
  COUNT(DISTINCT user_id)
FROM error_logs
WHERE created_at > DATE_TRUNC('hour', NOW())
ON CONFLICT (hour) DO UPDATE
SET error_count = EXCLUDED.error_count;
```

### Query Performance

**Before:** N+1 queries on error dashboard
```typescript
// Gets 100 errors, then fetches user for each = 101 queries
const errors = await db.error.findMany({ take: 100 });
const enriched = await Promise.all(
  errors.map(e => db.user.findUnique({ where: { id: e.userId } }))
);
```

**After:** Single query with join
```typescript
// Single query with JOIN
const enriched = await db.error.findMany({
  take: 100,
  include: { user: true, route: true },
});
```

### Caching Strategy

```typescript
import { createClient } from '@supabase/supabase-js';

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getErrorStats(route?: string) {
  const cacheKey = `error-stats:${route || 'all'}`;

  // Check cache
  if (cache.has(cacheKey)) {
    const { data, timestamp } = cache.get(cacheKey);
    if (Date.now() - timestamp < CACHE_TTL) {
      return data;
    }
  }

  // Query if cache miss
  const data = await query(`
    SELECT error_code, COUNT(*) as count
    FROM error_logs
    WHERE created_at > NOW() - INTERVAL '1 hour'
    ${route ? `AND route = '${route}'` : ''}
    GROUP BY error_code
  `);

  // Cache result
  cache.set(cacheKey, { data, timestamp: Date.now() });

  return data;
}
```

---

## Security Considerations

### Preventing Sensitive Data Leaks

```typescript
// WRONG: Exposes database schema
{
  error: "Column 'users.password' does not exist"
}

// RIGHT: Generic message
{
  error: "An error occurred processing your request"
}

// WRONG: Exposes API structure
{
  error: "/api/admin/payments not found",
  available: ["/api/users", "/api/admin/reports"]
}

// RIGHT: No exposure
{
  error: "Not found"
}
```

### PII in Error Messages

```typescript
// Sanitize errors before client
function sanitizeError(error: any) {
  const sensitive = [
    'email',
    'password',
    'token',
    'key',
    'secret',
    'ssn',
    'credit',
  ];

  const sanitized = JSON.parse(JSON.stringify(error));
  
  function sanitizeKeys(obj: any) {
    for (const key in obj) {
      if (sensitive.some(s => key.toLowerCase().includes(s))) {
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object') {
        sanitizeKeys(obj[key]);
      }
    }
  }

  sanitizeKeys(sanitized);
  return sanitized;
}
```

### CORS and Cross-Origin Errors

```typescript
// Enable CORS for error reporting
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/errors')) {
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set(
      'Access-Control-Allow-Methods',
      'POST, OPTIONS'
    );
    return response;
  }
}
```

---

## Maintenance Tasks

### Weekly Tasks

**Monday Morning (30 min):**
- [ ] Review Sentry error trends
- [ ] Check payment success rate
- [ ] Review customer support tickets for patterns
- [ ] Update error response times dashboard

**Code Changes:**
```bash
# Update error codes if new patterns discovered
npm run scripts:update-error-codes

# Regenerate TypeScript types
npm run types:generate
```

### Monthly Tasks

**First Friday (1 hour):**
- [ ] Database maintenance
  ```sql
  VACUUM ANALYZE error_logs;
  REINDEX TABLE CONCURRENTLY error_logs;
  ```

- [ ] Clean up old error logs
  ```sql
  DELETE FROM error_logs 
  WHERE created_at < NOW() - INTERVAL '90 days'
    AND severity = 'LOW';
  ```

- [ ] Review and update alert thresholds
- [ ] Audit rate limit configurations
- [ ] Review external service SLAs

### Quarterly Tasks

**Every 3 months (2 hours):**
- [ ] Full error handling audit
- [ ] Update documentation
- [ ] Review and refactor error codes
- [ ] Conduct security review
- [ ] Performance tuning
- [ ] Dependency updates

```bash
npm audit fix
npm outdated
```

---

## Support Runbook

### Escalation Path

```
User Report
    ↓
Frontend logs (browser console)
    ↓
API logs (server logs)
    ↓
Database query analysis
    ↓
External service status check
    ↓
Infrastructure metrics
    ↓
Code review (recent changes)
    ↓
Incident post-mortem
```

### Support Ticket Template

**Title:** `[ERROR_CODE] Route: /api/endpoint - 3 failures in last 1 hour`

**Body:**
```
## Issue Summary
- **Error Code:** RATE_LIMIT_EXCEEDED
- **Endpoint:** /api/payment/create-order
- **Status Code:** 429
- **Users Affected:** 12
- **Start Time:** 2026-04-08 10:15 UTC
- **Current Status:** Ongoing

## Quick Diagnostics
```sql
SELECT error_code, COUNT(DISTINCT user_id) as users, COUNT(*) as errors
FROM error_logs
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY error_code
ORDER BY errors DESC;
```

## Recent Changes
- Deployment: 2026-04-08 09:45 UTC
- Changed: /src/lib/client/rate-limiter.ts
- Prev: limit = 10, window = 60s
- New: limit = 5, window = 60s

## Action Items
- [ ] Investigate rate limit change impact
- [ ] Check external service status
- [ ] Review database metrics
- [ ] Update fix
- [ ] Monitor error rate post-fix
```

### Response Times SLA

| Severity | Response | Resolution |
|----------|----------|-----------|
| CRITICAL | 15 min | 1 hour |
| HIGH | 30 min | 4 hours |
| MEDIUM | 2 hours | 1 day |
| LOW | 24 hours | 1 week |

### Post-Mortem Template

```markdown
# Post-Mortem: [Error Code] - [Date]

## Summary
[What happened in 1-2 sentences]

## Timeline
- 10:15 - Error spike detected (5 errors)
- 10:20 - Escalated to on-call
- 10:25 - Root cause identified
- 10:30 - Fix deployed
- 10:35 - System recovered

## Impact
- Duration: 20 minutes
- Users Affected: 45
- Revenue Loss: $200
- Reputation Impact: Low

## Root Cause
[Detailed explanation]

## Contributing Factors
- Insufficient testing
- Missing monitoring
- Delayed alert

## Resolution
[What was done to fix]

## Prevention
- [ ] Add monitoring for this scenario
- [ ] Add integration test
- [ ] Update documentation
- [ ] Code review checklist item

## Learning
[Key takeaways for team]
```

---

## Resources

- Sentry Docs: https://docs.sentry.io/product/
- Next.js Error Handling: https://nextjs.org/docs/app/building-your-application/routing/error-handling
- Incident Management: https://www.pagerduty.com/blog/incident-response/
- On-Call Best Practices: https://www.atlassian.com/incident-management
