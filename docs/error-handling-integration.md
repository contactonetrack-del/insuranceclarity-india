# Error Handling Integration Guide

Complete guide to integrate error handling, rate limiting, and circuit breaker into existing API routes.

## Table of Contents

1. [Basic Integration](#basic-integration)
2. [Route Examples](#route-examples)
3. [Testing](#testing)
4. [Migration Strategy](#migration-strategy)
5. [Troubleshooting](#troubleshooting)

---

## Basic Integration

### Step 1: Create Error Handler Wrapper

```typescript
// src/lib/errors/create-route.ts
import { createApiHandler, withErrorHandler, withRateLimit } from '@/lib/errors';
import { NextRequest, NextResponse } from 'next/server';

export function createErrorHandledRoute(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options?: {
    rateLimitScope?: string;
    rateLimitPerHour?: number;
  }
) {
  let wrapped = withErrorHandler(handler);
  
  if (options?.rateLimitScope) {
    wrapped = withRateLimit(wrapped, {
      scope: options.rateLimitScope,
      maxRequests: options.rateLimitPerHour || 60,
      timeWindowSeconds: 3600, // 1 hour
    });
  }
  
  return wrapped;
}
```

### Step 2: Wrap Existing Handler

**Before:**
```typescript
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Process request
    const result = await processPayment(body);
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { error: 'Payment failed' },
      { status: 500 }
    );
  }
}
```

**After:**
```typescript
import { createErrorHandledRoute, ApiError } from '@/lib/errors';

async function handler(req: NextRequest) {
  const body = await req.json();
  
  // Validate input
  if (!body.amount || body.amount <= 0) {
    throw ApiError.badRequest('Invalid amount');
  }
  
  // Process request
  const result = await processPayment(body);
  
  return NextResponse.json({ success: true, data: result });
}

export const POST = createErrorHandledRoute(handler, {
  rateLimitScope: 'payments',
  rateLimitPerHour: 100,
});
```

---

## Route Examples

### Payment Creation Route

```typescript
// src/app/api/payment/create-order/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createErrorHandledRoute, ApiError, ApiClient } from '@/lib/errors';
import { validatePaymentAmount, createRazorpayOrder } from '@/services/payment';

async function handler(req: NextRequest) {
  const userId = req.userId; // From middleware
  const body = await req.json();

  // Validate request
  if (!userId) {
    throw ApiError.unauthorized('Authentication required');
  }

  const { amount, currency = 'INR', notes } = body;

  // Validate business logic
  if (amount < 100) {
    throw ApiError.badRequest('Minimum amount is ₹100', {
      errorCode: 'PAYMENT_AMOUNT_TOO_LOW',
      minimumAmount: 100,
    });
  }

  // Check rate limiting explicitly
  const rateLimitChecked = await checkPaymentRateLimit(userId);
  if (!rateLimitChecked) {
    throw ApiError.rateLimitExceeded('Too many payment attempts', {
      retryAfter: 3600,
    });
  }

  // Create order (with retry logic via ApiClient)
  const client = new ApiClient(process.env.RAZORPAY_KEY!);
  
  let order;
  try {
    order = await client.post('/orders', {
      amount: amount * 100, // Convert to paise
      currency,
      notes: { userId, ...notes },
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      throw ApiError.conflict('Order already exists');
    }
    throw error;
  }

  // Log successful order creation
  await logAction('payment.order.created', {
    userId,
    orderId: order.id,
    amount,
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json({
    success: true,
    data: {
      orderId: order.id,
      amount,
      currency,
    },
  });
}

export const POST = createErrorHandledRoute(handler, {
  rateLimitScope: 'payments',
  rateLimitPerHour: 50,
});
```

### File Upload Route

```typescript
// src/app/api/upload/document/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createErrorHandledRoute, ApiError } from '@/lib/errors';
import { uploadToStorage } from '@/services/storage';
import { validateDocument } from '@/lib/validation';

async function handler(req: NextRequest) {
  const userId = req.userId;

  if (!userId) {
    throw ApiError.unauthorized('Authentication required');
  }

  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    throw ApiError.badRequest('No file provided', {
      errorCode: 'FILE_MISSING',
    });
  }

  // Validate file
  try {
    await validateDocument(file);
  } catch (error) {
    throw ApiError.badRequest('Invalid document', {
      errorCode: 'INVALID_DOCUMENT',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  // Upload file
  try {
    const url = await uploadToStorage({
      file,
      userId,
      folder: 'documents',
      maxSize: 10 * 1024 * 1024, // 10MB
    });

    return NextResponse.json({
      success: true,
      data: { url, fileSize: file.size },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('quota')) {
      throw ApiError.paymentRequired('Storage quota exceeded');
    }
    throw error;
  }
}

export const POST = createErrorHandledRoute(handler, {
  rateLimitScope: 'uploads',
  rateLimitPerHour: 10,
});
```

### Search Route with Circuit Breaker

```typescript
// src/app/api/search/insurance/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createErrorHandledRoute, ApiError, ApiClient } from '@/lib/errors';

// Initialize circuit breaker for external search service
const searchClient = new ApiClient(process.env.SEARCH_SERVICE_URL!);

async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');
  const category = searchParams.get('category');

  if (!query || query.length < 2) {
    throw ApiError.badRequest('Query must be at least 2 characters', {
      errorCode: 'QUERY_TOO_SHORT',
      minimumLength: 2,
    });
  }

  try {
    // Circuit breaker will handle retries and fallback
    const results = await searchClient.get('/search', {
      params: { q: query, category },
    });

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 503) {
      // Service temporarily unavailable - return cached results or empty
      return NextResponse.json({
        success: true,
        data: [],
        cached: true,
        message: 'Search service temporarily unavailable, returning cached results',
      });
    }
    throw error;
  }
}

export const GET = createErrorHandledRoute(handler, {
  rateLimitScope: 'ai-requests',
  rateLimitPerHour: 60,
});
```

---

## Testing

### Unit Test Example

```typescript
// src/app/api/payment/create-order/__tests__/route.test.ts

import { NextRequest } from 'next/server';
import { POST } from '../route';
import { ApiError } from '@/lib/errors';

describe('POST /api/payment/create-order', () => {
  it('should reject unauthenticated requests', async () => {
    const req = new NextRequest(
      new URL('http://localhost:3000/api/payment/create-order'),
      {
        method: 'POST',
        body: JSON.stringify({ amount: 500 }),
      }
    );

    const res = await POST(req);
    expect(res.status).toBe(401);
    
    const data = await res.json();
    expect(data.error.code).toBe('UNAUTHORIZED');
  });

  it('should validate amount', async () => {
    const req = new NextRequest(
      new URL('http://localhost:3000/api/payment/create-order'),
      {
        method: 'POST',
        headers: { 'x-user-id': 'user-123' },
        body: JSON.stringify({ amount: 50 }),
      }
    );

    const res = await POST(req);
    expect(res.status).toBe(400);
    
    const data = await res.json();
    expect(data.error.code).toBe('PAYMENT_AMOUNT_TOO_LOW');
  });

  it('should create order successfully', async () => {
    const req = new NextRequest(
      new URL('http://localhost:3000/api/payment/create-order'),
      {
        method: 'POST',
        headers: { 'x-user-id': 'user-123' },
        body: JSON.stringify({ amount: 1000 }),
      }
    );

    const res = await POST(req);
    expect(res.status).toBe(200);
    
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.orderId).toBeDefined();
  });
});
```

### Integration Test Example

```typescript
// tests/e2e/api/payment.test.ts

import { test, expect } from '@playwright/test';

test.describe('Payment API', () => {
  test('should handle concurrent requests with rate limiting', async ({ browser }) => {
    const context = await browser.newContext();
    
    const requests = Array.from({ length: 60 }).map(() =>
      fetch('http://localhost:3000/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TEST_TOKEN}`,
        },
        body: JSON.stringify({ amount: 1000 }),
      })
    );

    const responses = await Promise.all(requests);
    
    // Last requests should be rate limited
    const statuses = responses.map(r => r.status);
    expect(statuses.filter(s => s === 429).length).toBeGreaterThan(0);
  });

  test('should retry failed requests automatically', async () => {
    // Mock failed request that succeeds on retry
    const response = await fetch('http://localhost:3000/api/payment/verify', {
      method: 'POST',
      body: JSON.stringify({ orderId: 'order-123' }),
    });

    expect(response.status).toBe(200);
  });
});
```

---

## Migration Strategy

### Phase 1: Non-Critical Routes (Week 1)

Integrate error handling into routes with low user impact:
- Search routes
- Documentation routes
- Utility endpoints

```typescript
// Example: Search util route
export const GET = createErrorHandledRoute(handler, {
  rateLimitScope: 'search',
  rateLimitPerHour: 100,
});
```

### Phase 2: Business-Logic Routes (Week 2)

Migrate core business routes:
- Payment routes
- Upload routes
- Profile update routes

### Phase 3: Auth/Admin Routes (Week 3)

Secure admin and authentication routes:
- Admin dashboard
- Settings routes
- Billing routes

### Rollback Strategy

If issues occur:

```typescript
// Temporarily disable error handling
export const POST = handler; // Direct handler without wrapper

// Or disable rate limiting only
export const POST = withErrorHandler(handler);
```

---

## Troubleshooting

### Issue: 429 Too Many Requests

**Cause:** Rate limit exceeded

**Solution:**
```typescript
// Check rate limit configuration
const limits = {
  payments: 50, // per hour
  uploads: 10,  // per hour
  search: 100,  // per hour
};

// Adjust as needed
export const POST = createErrorHandledRoute(handler, {
  rateLimitScope: 'payments',
  rateLimitPerHour: 100, // Increased from 50
});
```

### Issue: Circuit Breaker Always Open

**Cause:** External service consistently failing

**Solution:**
```typescript
// Reduce failure threshold
const client = new ApiClient(url, {
  circuitBreakerOptions: {
    failureThreshold: 10, // Increased from 5
    timeout: 30000, // 30 seconds
  },
});
```

### Issue: Error Not Logged to Database

**Cause:** Database connection issue

**Solution:**
```typescript
// Check Prisma connection
import { prisma } from '@/lib/prisma';

// Test connection
try {
  await prisma.$executeRawUnsafe('SELECT 1');
  console.log('Database connected');
} catch (error) {
  console.error('Database disconnected:', error);
}
```

### Issue: Sentry Not Capturing Errors

**Cause:** Configuration issue or initialization order

**Solution:**
```typescript
// Ensure Sentry initialized at app start
// src/app/layout.tsx
import * as Sentry from '@sentry/nextjs';

export default function RootLayout({ children }) {
  // Sentry should be initialized in server config
  // Verify in next.config.js
  return <html>{children}</html>;
}
```

---

## Monitoring

### Check Error Dashboard

Visit `/dashboard/admin/errors` to monitor:
- Error rate trends
- Top failing routes
- Rate limit violations
- Affected users

### Set Up Alerts

Configure Sentry alerts:
1. Go to [Sentry Dashboard](https://sentry.io)
2. Create alert rules for CRITICAL errors
3. Configure slack/email notifications

### Common Metrics

| Metric | Alert Threshold | Action |
|--------|-----------------|--------|
| Error Rate | > 5% of requests | Page on-call |
| 5xx Errors | > 100/min | Investigate service health |
| Rate Limit Hits | > 10/min | Scale or investigate abuse |
| Circuit Breaker Open | Any | Check external service |

---

## Performance Tips

1. **Use Rate Limiting per Scope**
   ```typescript
   // ❌ Bad: Single global limit
   globalRateLimiter.check(userId);
   
   // ✅ Good: Scoped limits
   globalRateLimiter.checkScope('payments', userId);
   ```

2. **Implement Caching for Slow Routes**
   ```typescript
   const cached = await redis.get(cacheKey);
   if (cached) return cached;
   ```

3. **Use Circuit Breaker for External Services**
   ```typescript
   const client = new ApiClient(externalUrl);
   // Automatically retries and falls back on failure
   ```

4. **Monitor Admin Dashboard Regularly**
   - Check daily error reports
   - Analyze error trends
   - Identify failed endpoints early

---

## Support

For issues or questions:
1. Check [Error Handling Overview](/docs/ERROR-HANDLING-OVERVIEW.md)
2. Review [API Reference](/docs/api-reference.md)
3. Check [Runtime Monitoring Guide](/docs/runtime-error-monitoring.md)
