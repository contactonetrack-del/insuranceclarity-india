# Error Handling System Overview

Quick reference guide for the comprehensive error handling system implemented in Insurance Clarity.

## 📚 Documentation Structure

This documentation set includes:

| Document | Purpose | Audience |
|----------|---------|----------|
| **[API Reference](./api-reference.md)** | Complete API endpoints, error codes, and response formats | Developers, QA, Support |
| **[Runtime Monitoring](./runtime-error-monitoring.md)** | Error detection, debugging techniques, and monitoring setup | DevOps, Backend Engineers |
| **[Testing Guide](./error-handling-testing.md)** | Unit, integration, and E2E testing strategies | QA Engineers, Developers |
| **[Maintenance & Troubleshooting](./error-handling-maintenance.md)** | Daily ops, common issues, and support runbooks | On-call Engineers, Managers |

---

## 🎯 Quick Start

### For Frontend Developers

1. **Use the API Client:**
   ```typescript
   import { createApiClient } from '@/lib/client/api-client';

   const client = createApiClient('your-token', {
     maxRetries: 3,
     initialDelayMs: 100,
   });

   try {
     const response = await client.post('/api/payment/create-order', { scanId });
   } catch (error) {
     const userError = createUserError(error);
     showToast(userError.message); // User-friendly message
   }
   ```

2. **Handle Retryable Errors:**
   ```typescript
   if (error.retryable && error.retryAfterSeconds) {
     // Show countdown timer
     const timer = setInterval(() => {
       retryAfterSeconds--;
     }, 1000);
   }
   ```

3. **Wrap Components in Error Boundary:**
   ```typescript
   <ErrorBoundary fallback={<ErrorFallback />}>
     <YourComponent />
   </ErrorBoundary>
   ```

### For Backend Engineers

1. **Return Standardized Errors:**
   ```typescript
   export async function POST(req: Request) {
     try {
       // Your logic
     } catch (error) {
       return ApiError.handle(error, 'INTERNAL_SERVER_ERROR');
     }
   }
   ```

2. **Track Errors in Sentry:**
   ```typescript
   import * as Sentry from '@sentry/nextjs';
   
   Sentry.captureException(error, {
     contexts: {
       route: { path: req.nextUrl.pathname },
     },
   });
   ```

3. **Implement Rate Limiting:**
   ```typescript
   const limiter = new RateLimiter(['uploads'], {
     limit: 10,
     window: 3600,
   });

   if (!limiter.allow(userId)) {
     return ApiError.rateLimitExceeded(30);
   }
   ```

### For DevOps/On-Call

1. **Morning Health Check (5 min):**
   - Check error rate dashboard
   - Verify external services (Razorpay, Meilisearch)
   - Review any critical alerts

2. **Respond to Alert:**
   - Check `/api/admin/errors` endpoint
   - Review error distribution by route
   - Check external service status
   - Scale up if needed

3. **Troubleshoot Issue:**
   - Follow [Troubleshooting Guide](./error-handling-maintenance.md#troubleshooting-guide)
   - Use provided SQL queries to diagnose
   - Execute fix and monitor

---

## 🔑 Key Concepts

### Error Codes

All errors return standardized codes:

```
✅ 2xx Success
❌ 4xx Client Error (usually not retryable)
⚠️ 5xx Server Error (usually retryable)
🔄 Retryable: 429, 502-504, SERVICE_UNAVAILABLE
```

**Common Codes:**
- `VALIDATION_ERROR` (400) - Input validation failed
- `UNAUTHORIZED` (401) - Auth required
- `RATE_LIMIT_EXCEEDED` (429) - Too many requests
- `EXTERNAL_SERVICE_ERROR` (502-504) - 3rd party service down

### Response Format

**Success:**
```json
{
  "success": true,
  "data": { /* user data */ }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "User-friendly message",
    "details": { /* optional context */ }
  }
}
```

### Retry Strategy

- **Exponential backoff:** 100ms → 200ms → 400ms → 800ms
- **Max retries:** 3 by default
- **Retry conditions:** Only retryable errors (429, 5xx)
- **Non-retryable:** 400, 401, 403, 404

### Rate Limiting

```
Scope: leads, uploads, ai-requests, otp
Per: IP address or user ID (if authenticated)
Window: 1 hour (adjustable)
Response: 429 with Retry-After header
```

---

## 🏗️ Architecture

### Client-Side Error Handling

```
Request
  ↓
ApiClient
  ├─ Validation
  ├─ Retry Logic (max 3 attempts)
  └─ Circuit Breaker
     ├─ CLOSED: Normal operation
     ├─ OPEN: Fast fail after 5 errors
     └─ HALF_OPEN: Test recovery after 60s
  ↓
Response / Error
  ↓
ErrorHandler
  ├─ Normalize error
  ├─ Extract user-friendly message
  ├─ Capture context (browser, network, request)
  └─ Report to Sentry
  ↓
UI
  ├─ Show toast/modal
  ├─ Retry button (if retryable)
  └─ Log context for support
```

### Server-Side Error Handling

```
Request
  ↓
Route Handler
  ├─ Validate input
  ├─ Check authentication
  ├─ Check authorization
  ├─ Rate limit check
  └─ Business logic
  ↓
Error / Success
  ↓
ApiError.handle()
  ├─ Categorize error
  ├─ Determine retryable status
  ├─ Add context (user, route, timing)
  └─ Send to Sentry
  ↓
Database (error_logs)
  └─ Stored for analytics
  ↓
Response (standardized format)
```

---

## 📊 Monitoring

### Key Metrics to Monitor

| Metric | Healthy | Warning | Critical |
|--------|---------|---------|----------|
| Error Rate | <0.5% | 0.5-2% | >2% |
| P95 Latency | <500ms | 500-1000ms | >1000ms |
| 429 Errors/hr | <10 | 10-50 | >50 |
| Payment Success | >99% | 95-99% | <95% |

### Dashboards

1. **Sentry Dashboard** - Error trends, user impact
2. **Custom Admin Dashboard** - `/api/admin/errors` endpoint
3. **Uptime Dashboard** - External services, API health
4. **Performance Dashboard** - Web Vitals, latency

### Alerts

- Error rate exceeds 2% → Page on-call
- Payment success <95% → Escalate to manager
- Circuit breaker opens → Immediate notification
- External service down → Alert team

---

## 🧪 Testing

### Test Coverage Requirements

- **Unit Tests:** 60% - Error handling functions
- **Integration Tests:** 30% - API endpoints with errors
- **E2E Tests:** 10% - User workflows with error scenarios

```bash
# Run all tests
npm run test

# Check coverage
npm run test:coverage

# Expected: >85% coverage on error handling code
```

### Testing Common Scenarios

- ✅ Rate limit - request 11 times, expect 429 on 11th
- ✅ Payment verify - wrong signature should fail
- ✅ Network error - should retry and recover
- ✅ Auth expired - should redirect to login
- ✅ Concurrent errors - circuit breaker should open

---

## 🚨 Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| High error rate | External service down | Check status page |
| 429 rate limit errors | Load spike | Implement request batching |
| Payment failures | Signature mismatch | Verify Razorpay key/time |
| OOM crashes | Memory leak | Check heap snapshot |
| Slow responses | Database queries | Add indexes, optimize |

### When to Escalate

- **Error rate >5%** → Page on-call
- **Payment failures >20%** → Critical incident
- **Circuit breaker open >5 min** → Infrastructure issue
- **Customer reports data loss** → Critical severity

**See:** [Troubleshooting Guide](./error-handling-maintenance.md#troubleshooting-guide)

---

## 📋 Production Checklist

Before deploying error handling changes:

- [ ] Unit tests pass (100% coverage for error code)
- [ ] Integration tests pass (including error scenarios)
- [ ] E2E tests pass (complete user workflow)
- [ ] Error messages are user-friendly
- [ ] No PII in error responses
- [ ] Sentry integration tested
- [ ] Load testing includes error scenarios
- [ ] Documentation updated
- [ ] Runbooks updated
- [ ] On-call team notified
- [ ] Rollback plan documented

---

## 🔗 Related Resources

### Internal Documentation
- [Payment Integration Guide](./payment-integration.md)
- [Database Schema](./database-schema.md)
- [API Routes](../src/app/api/)

### External Resources
- [Sentry Docs](https://docs.sentry.io)
- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [HTTP Status Codes](https://httpwg.org/specs/rfc7231.html#status.codes)
- [SLA Best Practices](https://www.atlassian.com/incident-management)

---

## 👥 Who Owns What

| Component | Owner | Escalation |
|-----------|-------|-----------|
| Error Codes | Backend Lead | VP Engineering |
| Client SDK | Frontend Lead | Backend Lead |
| Monitoring | DevOps Lead | VP Engineering |
| On-Call | On-Call Rotation | Manager |
| Documentation | Tech Lead | Team Lead |

---

## 📈 Metrics Dashboard

Monitor these real-time metrics:

```
┌─ Error Rate ─────────────────────┐
│ Last 1h: 0.3% ✅                  │
│ Last 24h: 0.2% ✅                 │
└──────────────────────────────────┘

┌─ Top Errors ──────────────────────┐
│ 1. RATE_LIMIT_EXCEEDED (45)       │
│ 2. VALIDATION_ERROR (23)          │
│ 3. NETWORK_ERROR (12)             │
└──────────────────────────────────┘

┌─ Service Status ──────────────────┐
│ API: 🟢 Healthy                    │
│ Razorpay: 🟢 Healthy              │
│ Meilisearch: 🟢 Healthy           │
│ Database: 🟢 Healthy              │
└──────────────────────────────────┘

┌─ Payment Success ─────────────────┐
│ Last 1h: 99.8% ✅                 │
│ Last 24h: 99.6% ✅                │
└──────────────────────────────────┘
```

---

## 🔄 Feedback Loop

Found an issue with the error handling system?

1. **Report:** Create issue in GitHub with error code
2. **Document:** Add to troubleshooting guide if needed
3. **Fix:** Update error handling code
4. **Test:** Add new test case
5. **Monitor:** Watch error rate post-fix
6. **Reflect:** Update documentation

---

## Quick Links

- **Start here:** [API Reference](./api-reference.md)
- **Debugging:** [Runtime Monitoring](./runtime-error-monitoring.md)
- **Testing:** [Error Handling Testing](./error-handling-testing.md)
- **Production:** [Troubleshooting](./error-handling-maintenance.md#troubleshooting-guide)
- **Support:** [Support Runbook](./error-handling-maintenance.md#support-runbook)

---

**Last Updated:** 2026-04-08  
**Version:** 1.0  
**Status:** Ready for Production
