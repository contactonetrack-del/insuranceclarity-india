# Runtime Error Monitoring & Debugging Guide

Guide for monitoring, diagnosing, and debugging runtime errors in the Insurance Clarity platform.

## Table of Contents
- [Error Monitoring Setup](#error-monitoring-setup)
- [Error Logging Infrastructure](#error-logging-infrastructure)
- [Debugging Techniques](#debugging-techniques)
- [Common Error Patterns](#common-error-patterns)
- [Performance Monitoring](#performance-monitoring)
- [Alert Configuration](#alert-configuration)

---

## Error Monitoring Setup

### Sentry Integration

Insurance Clarity uses Sentry for error tracking with separate configurations for client, server, and edge environments.

**Configuration Files:**
- `sentry.client.config.ts` - Browser/client-side errors
- `sentry.server.config.ts` - Server/API errors
- `sentry.edge.config.ts` - Edge function errors

**Key Features:**
- ✅ Source map uploads for stacktrace accuracy
- ✅ Performance monitoring (Web Vitals)
- ✅ Session replay for error reproduction
- ✅ Custom context attachment
- ✅ Error grouping and deduplication

### Enable Sentry in Your Code

**Server-side (API routes):**
```typescript
import * as Sentry from "@sentry/nextjs";

export async function POST(req: Request) {
  try {
    // Your handler logic
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  }
}
```

**Client-side (React components):**
```typescript
import * as Sentry from "@sentry/nextjs";

export default function Component() {
  return (
    <Sentry.ErrorBoundary errorComponent={ErrorFallback}>
      <YourComponent />
    </Sentry.ErrorBoundary>
  );
}
```

---

## Error Logging Infrastructure

### Error Database Schema

Errors are logged with comprehensive context:

```sql
-- Table: error_logs
CREATE TABLE error_logs (
  id UUID PRIMARY KEY,
  error_code VARCHAR(50),
  status_code INT,
  route VARCHAR(255),
  method VARCHAR(10),
  user_id UUID,
  session_id VARCHAR(255),
  ip_address INET,
  severity VARCHAR(20),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  error_context JSONB,
  stacktrace TEXT,
  user_agent TEXT,
  affected_scans INT DEFAULT 0,
  affected_users INT DEFAULT 0
);

-- Index for fast queries
CREATE INDEX idx_error_logs_error_code ON error_logs(error_code);
CREATE INDEX idx_error_logs_route ON error_logs(route);
CREATE INDEX idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX idx_error_logs_severity ON error_logs(severity);
```

### Log Retention Policy

| Severity | Retention | Sampling |
|----------|-----------|----------|
| CRITICAL | 90 days | 100% |
| HIGH | 60 days | 100% |
| MEDIUM | 30 days | 50% |
| LOW | 14 days | 10% |

### Structured Logging Format

```typescript
interface ErrorLog {
  timestamp: string; // ISO 8601
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  errorCode: string;
  message: string;
  userId?: string;
  sessionId?: string;
  context: {
    route?: string;
    method?: string;
    statusCode?: number;
    duration?: number; // ms
    stack?: string;
    userAgent?: string;
    browser?: CaptureBrowserContext;
    network?: CaptureNetworkContext;
    request?: CaptureRequestContext;
  };
}
```

---

## Debugging Techniques

### 1. Using Error Context Capture

The SDK automatically captures context with every error:

```typescript
import { captureErrorContext } from '@/lib/client/error-context';

catch (error) {
  // Automatically includes:
  // - Browser info (Chrome, Safari, etc.)
  // - Network type (4G, WiFi, etc.)
  // - Request details (method, URL, headers)
  // - Response details (status, timing)
  const context = captureErrorContext({
    userAgent: navigator.userAgent,
    network: navigator.connection,
  });

  console.error('Full error context:', context);
}
```

### 2. Error Boundary with Fallback UI

Catch errors before they crash the entire app:

```typescript
import { ErrorBoundary } from '@/components/error-boundary';

export default function Page() {
  return (
    <ErrorBoundary
      fallback={<ErrorFallback />}
      onError={(error, context) => {
        // Log to Sentry with context
        Sentry.captureException(error, {
          contexts: { react: context },
        });
      }}
    >
      <YourComponent />
    </ErrorBoundary>
  );
}
```

### 3. Debugging Rate Limit Issues

**Problem:** User gets 429 errors frequently

```typescript
// Check rate limit status
import { getRateLimitStatus } from '@/lib/client/rate-limiter';

const status = getRateLimitStatus('uploads');
console.log({
  currentRequests: status.current,
  limit: status.limit,
  windowSeconds: status.windowSeconds,
  resetAt: status.resetAt,
  retryAfterSeconds: status.retryAfterSeconds,
});

// Result:
// {
//   currentRequests: 11,
//   limit: 10,
//   windowSeconds: 3600,
//   resetAt: "2026-04-08T10:15:30Z",
//   retryAfterSeconds: 3540
// }
```

**Solution:** Implement request queuing:
```typescript
const requestQueue = [];
const isProcessing = false;

async function queueRequest(fn) {
  requestQueue.push(fn);
  if (!isProcessing) {
    processQueue();
  }
}

async function processQueue() {
  while (requestQueue.length > 0) {
    const fn = requestQueue.shift();
    try {
      await fn();
    } catch (error) {
      if (error.code === 'RATE_LIMIT_EXCEEDED') {
        // Wait and retry
        await new Promise(r => 
          setTimeout(r, error.retryAfterSeconds * 1000)
        );
        requestQueue.unshift(fn);
      }
    }
    // Respect rate limits
    await new Promise(r => setTimeout(r, 1000));
  }
}
```

### 4. Debugging Payment Failures

**Problem:** `/api/payment/verify` returns 500 error

```typescript
// Check payment status
const { data } = await client.get(
  '/api/payment/status?scanId=scan_12345'
);

console.log(data);
// {
//   status: 'PENDING',
//   canRetry: true,
//   message: 'Payment not captured',
//   retryAfterSeconds: 30
// }

// Check Razorpay webhook logs
// 1. Verify signature: razorpaySignature matches
// 2. Check order status in Razorpay dashboard
// 3. Verify merchant credentials in environment
```

### 5. Using Browser DevTools

**Console API:**
```javascript
// Check client error handler
window.__errorHandler?.getErrors()

// Get circuit breaker status
window.__circuitBreaker?.getStatus()

// Get rate limit status
window.__rateLimiter?.getStatus('uploads')
```

**Network Tab:**
- Filter by `Status` to find errors
- Check `Response` headers for `Retry-After`
- Compare `Request` timestamp with error timestamp

**Performance Tab:**
- Record Long Tasks (>50ms)
- Check Core Web Vitals
- Identify network bottlenecks

---

## Common Error Patterns

### Pattern 1: Cascading Rate Limit Errors

**Symptoms:**
```
429 RATE_LIMIT_EXCEEDED (first request)
429 RATE_LIMIT_EXCEEDED (retry in 5s)
429 RATE_LIMIT_EXCEEDED (retry in 10s)
Circuit breaker OPEN - fast failing
```

**Root Causes:**
1. Burst of requests from multiple tabs
2. Retry storm from previous session
3. Load spike from new user batch

**Solution:**
```typescript
// Implement request batching
import { RequestBatcher } from '@/lib/client/request-batcher';

const batcher = new RequestBatcher({
  batchSize: 5,
  batchIntervalMs: 1000,
  maxRetries: 2,
});

// Requests auto-batch and respect rate limits
await batcher.add(() => client.post('/api/upload', data));
```

### Pattern 2: Payment Verification Fails

**Symptoms:**
```
200 - Order created
201 - Payment captured
500 - Verification failed
```

**Root Causes:**
1. Signature mismatch (time drift or key mismatch)
2. Concurrent verification requests
3. Database write conflict

**Solution:**
```typescript
// Add idempotency key
const idempotencyKey = `${scanId}-${paymentId}`;

const response = await client.post('/api/payment/verify', 
  paymentData,
  {
    headers: {
      'Idempotency-Key': idempotencyKey,
    },
  }
);

// If called twice, server returns same result
// No double-charging
```

### Pattern 3: Authentication Fails for Some Users

**Symptoms:**
```
200 - Login works
200 - Dashboard loads
401 - API request fails
```

**Root Causes:**
1. Session expired
2. Token not included in request
3. CSRF validation failed
4. Cross-site cookie issue

**Solution:**
```typescript
// Check session before API calls
import { getSession } from '@/auth';

const session = await getSession();
if (!session) {
  // Redirect to login
  redirect('/auth/signin');
}

// Ensure token is in request headers
const client = createApiClient(session.accessToken);
```

---

## Performance Monitoring

### Web Vitals Tracking

```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export function registerWebVitals() {
  getCLS(metric => {
    console.log('CLS:', metric.value);
    Sentry.captureMessage(`CLS: ${metric.value}`);
  });

  getFID(metric => {
    console.log('FID:', metric.value);
  });

  getFCP(metric => {
    console.log('FCP:', metric.value);
  });

  getLCP(metric => {
    console.log('LCP:', metric.value);
  });

  getTTFB(metric => {
    console.log('TTFB:', metric.value);
  });
}
```

### Performance Budgets

| Metric | Budget | Threshold |
|--------|--------|-----------|
| FCP | 1.8s | Red: >2.5s |
| LCP | 2.5s | Red: >4s |
| CLS | 0.1 | Red: >0.25 |
| FID | 100ms | Red: >300ms |
| TTFB | 600ms | Red: >800ms |

### Request Timing Analysis

```typescript
interface RequestTiming {
  total: number; // Total duration
  dns: number; // DNS lookup
  tcp: number; // TCP connection
  tls: number; // TLS handshake
  ttfb: number; // Time to first byte
  download: number; // Response download
  processing: number; // Response processing
}

// Analyze slow requests
const slowThreshold = 5000; // 5 seconds
const timing = analyzeTiming(response);

if (timing.total > slowThreshold) {
  if (timing.dns > 500) console.log('Slow DNS');
  if (timing.ttfb > 2000) console.log('Slow server');
  if (timing.download > 2000) console.log('Slow network');
}
```

---

## Alert Configuration

### Alert Thresholds

```typescript
const alertConfig = {
  errorRate: {
    threshold: 5, // 5% of requests
    window: '5m',
    severity: 'HIGH',
  },
  rateLimit: {
    threshold: 100, // 100 errors in period
    window: '1h',
    perScope: true,
    severity: 'MEDIUM',
  },
  paymentFails: {
    threshold: 10, // 10 failures
    window: '15m',
    severity: 'CRITICAL',
  },
  circuitBreaker: {
    eventType: 'OPEN',
    severity: 'CRITICAL',
    auto_resolve: '5m',
  },
};
```

### Creating PagerDuty Integration

```bash
# In Sentry Project Settings:
# 1. Go to Integrations
# 2. Search "PagerDuty"
# 3. Click "Configure"
# 4. Create alert rule
# 5. Trigger: Error > 5 events
# 6. Action: Send to PagerDuty
```

### Slack Notifications

```typescript
// Sentry webhook to Slack
const slackWebhook = process.env.SLACK_WEBHOOK_URL;

async function notifySlack(error) {
  await fetch(slackWebhook, {
    method: 'POST',
    body: JSON.stringify({
      text: `🚨 Error Alert: ${error.code}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${error.code}*\n${error.message}`,
          },
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Status: \`${error.status}\` • Route: \`${error.route}\` • Time: \`${error.timestamp}\``,
            },
          ],
        },
      ],
    }),
  });
}
```

---

## Production Debugging Checklist

When investigating production errors:

- [ ] Check error rate trend (increasing/stable/decreasing)
- [ ] Identify affected percentage of users
- [ ] Check if error correlates with deployment
- [ ] Review error stacktrace and context
- [ ] Check Sentry for similar grouped errors
- [ ] Review database query performance
- [ ] Check external API status (Razorpay, Meilisearch, etc.)
- [ ] Review infrastructure metrics (CPU, memory, disk)
- [ ] Check rate limit status for all scopes
- [ ] Review recent code changes
- [ ] Test reproduction in staging environment
- [ ] Create issue with reproduction steps
- [ ] Set up monitoring/alerting for this error type
- [ ] Document resolution for future reference

---

## Resources

- Sentry Documentation: https://docs.sentry.io
- Next.js Error Handling: https://nextjs.org/docs/app/building-your-application/routing/error-handling
- Web Vitals: https://web.dev/vitals
- Browser DevTools: https://developer.chrome.com/docs/devtools
