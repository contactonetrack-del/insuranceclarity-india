# Insurance Clarity API Reference

> Historical note: this document predates the Better Auth cutover and the current browser-first public API surface. For current platform status, use [MASTER-PLAN-STATUS.md](../MASTER-PLAN-STATUS.md) and [README.md](../README.md).

Complete API documentation for Insurance Clarity endpoints with error handling guides and examples.

## Table of Contents
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Endpoints](#endpoints)
- [Client SDK](#client-sdk)
- [Retry Strategies](#retry-strategies)

---

## Authentication

All API requests require a valid API key. Include it in the `Authorization` header:

```bash
Authorization: Bearer YOUR_API_KEY
```

For browser-authenticated endpoints, follow the Better Auth session/cookie flow used by the current app.

---

## Error Handling

### Error Response Format

All errors are returned in a standardized format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "User-friendly error message",
    "details": { /* optional context */ }
  }
}
```

### Error Codes

| Code | Status | Description | Retryable |
|------|--------|-------------|-----------|
| `VALIDATION_ERROR` | 400 | Input validation failed | ❌ No |
| `UNAUTHORIZED` | 401 | Authentication required | ❌ No |
| `FORBIDDEN` | 403 | Insufficient permissions | ❌ No |
| `NOT_FOUND` | 404 | Resource not found | ❌ No |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests | ✅ Yes (with backoff) |
| `PLAN_LIMIT_EXCEEDED` | 402 | Feature requires premium plan | ❌ No |
| `INTERNAL_SERVER_ERROR` | 500 | Server error | ✅ Yes (with backoff) |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily down | ✅ Yes (with backoff) |

### Example Error Response

**Rate Limit Error:**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again in 30 seconds.",
    "details": {
      "retryAfterSeconds": 30
    }
  }
}
```

**Validation Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is invalid"
  }
}
```

---

## Rate Limiting

Rate limits are applied per scope and IP address:

| Scope | Limit | Window |
|-------|-------|--------|
| `leads` | 5 requests | 1 hour |
| `uploads` | 10 requests | 1 hour |
| `ai-requests` | 60 requests (free) / 200 (premium) | 1 hour |
| `otp` | 3 requests | 1 minute |

Rate limit information is included in error responses:

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "details": {
      "retryAfterSeconds": 45
    }
  }
}
```

---

## Endpoints

### Payment API

#### `POST /api/payment/create-order`

Create a Razorpay order for payment.

**Request:**
```json
{
  "scanId": "scan_12345"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "orderId": "order_ABC123",
    "amount": 19900,
    "currency": "INR",
    "keyId": "rzp_test_abcdef"
  }
}
```

**Error Responses:**
- `400`: `VALIDATION_ERROR` - Missing or invalid scanId
- `404`: `NOT_FOUND` - Scan not found
- `429`: `RATE_LIMIT_EXCEEDED` - Too many payment requests
- `500`: `INTERNAL_SERVER_ERROR` - Order creation failed

#### `POST /api/payment/verify`

Verify payment signature and unlock report.

**Request:**
```json
{
  "scanId": "scan_12345",
  "razorpayOrderId": "order_ABC123",
  "razorpayPaymentId": "pay_XYZ789",
  "razorpaySignature": "signature_hash"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Payment verified. Your full report is now unlocked!"
  }
}
```

**Error Responses:**
- `400`: `VALIDATION_ERROR` - Invalid signature or missing fields
- `404`: `NOT_FOUND` - Payment record not found
- `500`: `INTERNAL_SERVER_ERROR` - Verification failed

#### `GET /api/payment/status?scanId=...`

Check payment status for a scan.

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "scanId": "scan_12345",
    "status": "CAPTURED",
    "canRetry": false,
    "message": "Payment captured. Your report is unlocked."
  }
}
```

---

### Subscription API

#### `POST /api/subscription/create`

Create a Razorpay subscription.

**Request:**
```json
{
  "plan": "PRO"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "subscriptionId": "sub_ABC123",
    "shortUrl": "https://rzp.io/...",
    "status": "CREATED"
  }
}
```

**Error Responses:**
- `400`: `VALIDATION_ERROR` - Invalid plan
- `401`: `UNAUTHORIZED` - Authentication required
- `500`: `INTERNAL_SERVER_ERROR` - Creation failed

---

### Admin API

#### `GET /api/admin/errors?days=7&severity=HIGH`

Get error statistics for dashboard (admin only).

**Query Parameters:**
- `days`: Number of days to look back (1-90, default 7)
- `severity`: Filter by severity (CRITICAL, HIGH, MEDIUM, LOW)
- `route`: Filter by API route
- `errorCode`: Filter by error code

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "period": {
      "days": 7,
      "since": "2026-04-01T00:00:00Z",
      "until": "2026-04-07T12:34:56Z"
    },
    "summary": {
      "totalErrors": 245,
      "uniqueErrorCodes": 8,
      "affectedRoutes": 12,
      "affectedUsers": 34
    },
    "distribution": {
      "byErrorCode": [
        { "code": "RATE_LIMIT_EXCEEDED", "severity": "HIGH", "count": 89 },
        { "code": "VALIDATION_ERROR", "severity": "MEDIUM", "count": 67 }
      ],
      "byRoute": [
        { "route": "/api/upload", "method": "POST", "count": 123 }
      ],
      "byStatus": [
        { "status": 429, "count": 89 },
        { "status": 400, "count": 67 }
      ],
      "bySeverity": [
        { "severity": "HIGH", "count": 89 },
        { "severity": "MEDIUM", "count": 156 }
      ]
    },
    "topErrors": [
      {
        "code": "RATE_LIMIT_EXCEEDED",
        "message": "Too many requests",
        "severity": "HIGH"
      }
    ],
    "anomalies": [
      {
        "ip": "192.168.1.100",
        "scope": "uploads",
        "requestCount": 45,
        "windowSeconds": 60,
        "detectedAt": "2026-04-07T10:15:30Z"
      }
    ]
  }
}
```

**Error Responses:**
- `401`: `UNAUTHORIZED` - Authentication required
- `403`: `FORBIDDEN` - Admin access required
- `500`: `INTERNAL_SERVER_ERROR` - Query failed

---

## Client SDK

### Installation

```typescript
import { createApiClient } from '@/lib/client/api-client';
```

### Usage

```typescript
// Create client
const client = createApiClient('your-api-key', {
  maxRetries: 3,
  initialDelayMs: 100,
  maxDelayMs: 5000,
});

// Make requests
try {
  const response = await client.post('/api/payment/create-order', {
    scanId: 'scan_123',
  });

  console.log('Payment created:', response.data);
} catch (error) {
  // Handle error with automatic retry and circuit breaker
  console.error('Request failed:', error);
}
```

### Features

- **Automatic Retry**: Exponential backoff for retryable errors
- **Circuit Breaker**: Fails fast after threshold is reached
- **Type Safety**: Full TypeScript support
- **Rate Limit Handling**: Respects retry-after headers
- **Error Context**: Captures browser/network/request context

---

## Retry Strategies

### Default Configuration

```typescript
const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 100,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
};
```

### Retry Backoff Calculation

Delay increases exponentially: 100ms → 200ms → 400ms → 800ms

```
delay = initialDelayMs × (backoffMultiplier ^ (attempt - 1))
delay = min(delay, maxDelayMs)
```

### Retryable vs Non-Retryable Errors

**Retryable (will retry automatically):**
- 429 (Rate Limit)
- 502 (Bad Gateway)
- 503 (Service Unavailable)
- 504 (Gateway Timeout)
- `RATE_LIMIT_EXCEEDED`
- `SERVICE_UNAVAILABLE`
- `EXTERNAL_SERVICE_ERROR`

**Non-Retryable (fail immediately):**
- 400 (Bad Request)
- 401 (Unauthorized)
- 403 (Forbidden)
- 404 (Not Found)
- `VALIDATION_ERROR`
- `UNAUTHORIZED`
- `FORBIDDEN`
- `NOT_FOUND`

### Circuit Breaker Pattern

The SDK implements a circuit breaker to prevent cascading failures:

- **CLOSED** (Normal): Requests proceed
- **OPEN** (Failing): Fast-fail after 5 consecutive failures
- **HALF_OPEN** (Recovering): Allow one request after 60 seconds

---

## Common Scenarios

### Handling Rate Limits in UI

```typescript
import { ErrorHandler, createRetryTimer } from '@/lib/client/error-handler';

const errorHandler = new ErrorHandler({
  showToast: (message) => toast.error(message),
});

try {
  await client.post('/api/upload', formData);
} catch (error) {
  const userError = errorHandler.handle(error);

  if (userError.retryable && user ErrorError.retryAfterSeconds) {
    // Show countdown timer
    let remaining = userError.retryAfterSeconds;
    createRetryTimer(
      remaining,
      (seconds) => {
        setCountdown(seconds);
      },
      () => {
        setCountdown(0);
        // Auto-retry or enable retry button
      }
    );
  }
}
```

### Error Reporting with Context

```typescript
import { captureErrorContext, formatErrorContext } from '@/lib/client/error-context';

try {
  await client.post('/api/payment/verify', paymentData);
} catch (error) {
  if ('context' in error) {
    const errorContext = captureErrorContext(error.context);
    const formatted = formatErrorContext(errorContext);

    // Send to support system
    await reportError({
      errorCode: error.code,
      context: formatted,
      userMessage: 'Payment verification failed',
    });
  }
}
```

---

## Best Practices

1. **Always use the SDK** - Ensures you get automatic retry and error handling
2. **Handle retryable errors** - Show countdown timers for rate limits
3. **Log errors with context** - Include browser/network context in support tickets
4. **Respect circuit breaker** - If service is down, back off gracefully
5. **Validate input early** - Validate on client before sending to API
6. **Use exponential backoff** - Default configuration is tuned for production
7. **Don't retry forever** - 3 retries is the default max
8. **Monitor error rates** - Use `/api/admin/errors` to track issues

---

## Support

For API support, include:
- Error code and message
- Request method and endpoint
- HTTP status code
- Browser/device information
- Approximate time of error
- Session ID (from error context)

All sensitive data (authentication tokens, email, payment info) should be excluded.
