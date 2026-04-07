# Error Handling Testing Guide

Comprehensive testing strategies for error handling, including unit tests, integration tests, and end-to-end tests.

## Table of Contents
- [Testing Strategy](#testing-strategy)
- [Unit Tests](#unit-tests)
- [Integration Tests](#integration-tests)
- [End-to-End Tests](#end-to-end-tests)
- [Error Simulation](#error-simulation)
- [Test Fixtures](#test-fixtures)
- [Coverage Goals](#coverage-goals)

---

## Testing Strategy

### Test Pyramid

```
        E2E Tests (10%)
       Integration Tests (30%)
        Unit Tests (60%)
```

**Distribution:**
- **Unit Tests** (60%): Test individual functions and error handling logic
- **Integration Tests** (30%): Test components with dependencies
- **E2E Tests** (10%): Test complete user workflows

### Test Framework Stack

```json
{
  "testing": {
    "unitTests": "Vitest + @testing-library/react",
    "integrationTests": "Vitest + MSW (Mock Service Worker)",
    "e2eTests": "Playwright",
    "snapshots": "Vitest snapshots",
    "coverage": "Vitest coverage"
  }
}
```

---

## Unit Tests

### Testing Error Handler

**File:** `src/lib/client/error-handler.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { ErrorHandler, createRequestErrorFromResponse } from './error-handler';
import { ApiError } from './api-error';

describe('ErrorHandler', () => {
  describe('handle()', () => {
    it('should handle validation errors', () => {
      const error = new ApiError({
        code: 'VALIDATION_ERROR',
        message: 'Email is invalid',
        status: 400,
      });

      const handler = new ErrorHandler();
      const result = handler.handle(error);

      expect(result).toEqual({
        code: 'VALIDATION_ERROR',
        message: 'Email is invalid',
        retryable: false,
      });
    });

    it('should handle rate limit errors with retry info', () => {
      const error = new ApiError({
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests',
        status: 429,
        retryAfterSeconds: 30,
      });

      const handler = new ErrorHandler();
      const result = handler.handle(error);

      expect(result.retryable).toBe(true);
      expect(result.retryAfterSeconds).toBe(30);
    });

    it('should normalize internal errors', () => {
      const internalError = {
        code: 'ECONNREFUSED',
        message: 'Connection refused',
      };

      const handler = new ErrorHandler();
      const result = handler.handle(internalError);

      expect(result.code).toBe('INTERNAL_SERVER_ERROR');
      expect(result.message).toContain('temporary');
    });

    it('should attach context to errors', () => {
      const error = new ApiError({
        code: 'PAYMENT_ERROR',
        message: 'Payment failed',
        status: 500,
      });

      const handler = new ErrorHandler({
        context: {
          userId: 'user_123',
          scanId: 'scan_456',
        },
      });

      const result = handler.handle(error);

      expect(result.context).toEqual({
        userId: 'user_123',
        scanId: 'scan_456',
      });
    });

    it('should call onError callback', () => {
      const onError = vi.fn();
      const error = new ApiError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Server error',
        status: 500,
      });

      const handler = new ErrorHandler({ onError });
      handler.handle(error);

      expect(onError).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  describe('createUserError()', () => {
    it('should create user-friendly error message', () => {
      const handler = new ErrorHandler();

      const result = handler.createUserError({
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfterSeconds: 45,
      });

      expect(result.message).toContain('45 seconds');
      expect(result.actionable).toBe(true);
    });

    it('should hide sensitive information', () => {
      const handler = new ErrorHandler();

      const result = handler.createUserError({
        code: 'DATABASE_ERROR',
        details: {
          query: 'SELECT * FROM users',
          password: 'secret123',
        },
      });

      expect(result.message).not.toContain('query');
      expect(result.message).not.toContain('password');
    });
  });
});
```

### Testing API Client Retry Logic

**File:** `src/lib/client/api-client.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createApiClient } from './api-client';

describe('ApiClient - Retry Logic', () => {
  let client;
  let fetchMock;

  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock;
    client = createApiClient('test-token', {
      maxRetries: 3,
      initialDelayMs: 10, // Fast for tests
      maxDelayMs: 100,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should retry on 503 Service Unavailable', async () => {
    // First attempt: 503 error
    fetchMock.mockResolvedValueOnce({
      status: 503,
      json: async () => ({
        success: false,
        error: { code: 'SERVICE_UNAVAILABLE' },
      }),
    });

    // Second attempt: 200 success
    fetchMock.mockResolvedValueOnce({
      status: 200,
      json: async () => ({
        success: true,
        data: { id: '123' },
      }),
    });

    const result = await client.get('/api/test');

    expect(result.data).toEqual({ id: '123' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should respect retry-after header', async () => {
    const retryAfter = 60; // seconds

    fetchMock.mockResolvedValue({
      status: 429,
      headers: new Map([['retry-after', retryAfter.toString()]]),
      json: async () => ({
        success: false,
        error: { code: 'RATE_LIMIT_EXCEEDED' },
      }),
    });

    const startTime = Date.now();

    try {
      await client.get('/api/test');
    } catch (error) {
      // Verify exponential backoff was used (not full 60s)
      const elapsed = Date.now() - startTime;
      expect(elapsed).toBeLessThan(retryAfter * 1000);
    }
  });

  it('should not retry on 400 Bad Request', async () => {
    fetchMock.mockResolvedValue({
      status: 400,
      json: async () => ({
        success: false,
        error: { code: 'VALIDATION_ERROR' },
      }),
    });

    try {
      await client.get('/api/test');
    } catch (error) {
      expect(error.code).toBe('VALIDATION_ERROR');
    }

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should have exponential backoff', async () => {
    const delays = [];

    // Mock fetch to track delays
    let callCount = 0;
    fetchMock.mockImplementation(async () => {
      callCount++;
      if (callCount < 3) {
        return {
          status: 503,
          json: async () => ({
            success: false,
            error: { code: 'SERVICE_UNAVAILABLE' },
          }),
        };
      }
      return {
        status: 200,
        json: async () => ({ success: true, data: {} }),
      };
    });

    // Spy on setTimeout to track delays
    const originalSetTimeout = global.setTimeout;
    global.setTimeout = vi.fn((cb, delay) => {
      delays.push(delay);
      return originalSetTimeout(cb, delay);
    });

    try {
      await client.get('/api/test');
    } finally {
      global.setTimeout = originalSetTimeout;
    }

    // Verify exponential growth: 10ms, 20ms, 40ms
    expect(delays).toContain(10); // initialDelayMs
    expect(delays).toContain(20); // initialDelayMs * 2
  });

  it('should fail after max retries', async () => {
    fetchMock.mockResolvedValue({
      status: 503,
      json: async () => ({
        success: false,
        error: { code: 'SERVICE_UNAVAILABLE' },
      }),
    });

    try {
      await client.get('/api/test');
      expect.fail('Should have thrown error');
    } catch (error) {
      expect(error.code).toBe('SERVICE_UNAVAILABLE');
    }

    // 1 initial + 3 retries = 4 total
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });
});
```

### Testing Circuit Breaker

**File:** `src/lib/client/circuit-breaker.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { CircuitBreaker } from './circuit-breaker';

describe('CircuitBreaker', () => {
  it('should start in CLOSED state', () => {
    const breaker = new CircuitBreaker({ failureThreshold: 5 });
    expect(breaker.getState()).toBe('CLOSED');
  });

  it('should transition to OPEN after failures', () => {
    const breaker = new CircuitBreaker({ failureThreshold: 2 });

    breaker.recordFailure();
    expect(breaker.getState()).toBe('CLOSED');

    breaker.recordFailure();
    expect(breaker.getState()).toBe('OPEN');
  });

  it('should fail fast in OPEN state', () => {
    const breaker = new CircuitBreaker({ failureThreshold: 1 });

    breaker.recordFailure();
    expect(breaker.getState()).toBe('OPEN');

    const fn = vi.fn(() => Promise.resolve());

    try {
      breaker.execute(fn);
    } catch (error) {
      expect(error.message).toContain('Circuit breaker is OPEN');
    }

    expect(fn).not.toHaveBeenCalled();
  });

  it('should transition to HALF_OPEN after timeout', async () => {
    const breaker = new CircuitBreaker({
      failureThreshold: 1,
      resetTimeoutMs: 50,
    });

    breaker.recordFailure();
    expect(breaker.getState()).toBe('OPEN');

    await new Promise(r => setTimeout(r, 100));

    expect(breaker.getState()).toBe('HALF_OPEN');
  });

  it('should close after success in HALF_OPEN', async () => {
    const breaker = new CircuitBreaker({
      failureThreshold: 1,
      resetTimeoutMs: 50,
    });

    breaker.recordFailure();
    await new Promise(r => setTimeout(r, 100));

    const fn = () => Promise.resolve('success');
    const result = await breaker.execute(fn);

    expect(result).toBe('success');
    expect(breaker.getState()).toBe('CLOSED');
  });

  it('should reopen on failure in HALF_OPEN', async () => {
    const breaker = new CircuitBreaker({
      failureThreshold: 1,
      resetTimeoutMs: 50,
    });

    breaker.recordFailure();
    await new Promise(r => setTimeout(r, 100));

    try {
      const fn = () => Promise.reject(new Error('Failed'));
      await breaker.execute(fn);
    } catch {
      // Expected
    }

    expect(breaker.getState()).toBe('OPEN');
  });
});
```

---

## Integration Tests

### Testing API Client with MSW

**File:** `src/lib/client/api-client.integration.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { createApiClient } from './api-client';

const server = setupServer();

beforeAll(() => server.listen());
afterAll(() => server.close());

describe('ApiClient - Integration', () => {
  it('should handle payment creation flow', async () => {
    server.use(
      http.post('/api/payment/create-order', () => {
        return HttpResponse.json(
          {
            success: true,
            data: {
              orderId: 'order_ABC123',
              amount: 19900,
            },
          },
          { status: 201 }
        );
      })
    );

    const client = createApiClient('test-token');
    const result = await client.post('/api/payment/create-order', {
      scanId: 'scan_12345',
    });

    expect(result.data.orderId).toBe('order_ABC123');
  });

  it('should handle payment verification with signature', async () => {
    server.use(
      http.post('/api/payment/verify', async ({ request }) => {
        const body = await request.json();

        // Simulate signature validation
        if (!body.razorpaySignature) {
          return HttpResponse.json(
            {
              success: false,
              error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid signature',
              },
            },
            { status: 400 }
          );
        }

        return HttpResponse.json({
          success: true,
          data: {
            success: true,
            message: 'Payment verified',
          },
        });
      })
    );

    const client = createApiClient('test-token');

    // Should fail without signature
    try {
      await client.post('/api/payment/verify', {
        scanId: 'scan_12345',
      });
      expect.fail('Should have thrown');
    } catch (error) {
      expect(error.code).toBe('VALIDATION_ERROR');
    }

    // Should succeed with signature
    const result = await client.post('/api/payment/verify', {
      scanId: 'scan_12345',
      razorpaySignature: 'valid_signature',
    });

    expect(result.data.success).toBe(true);
  });

  it('should handle rate limiting with exponential backoff', async () => {
    let attempt = 0;

    server.use(
      http.get('/api/test', () => {
        attempt++;

        if (attempt < 2) {
          return HttpResponse.json(
            {
              success: false,
              error: { code: 'RATE_LIMIT_EXCEEDED' },
            },
            {
              status: 429,
              headers: { 'Retry-After': '1' },
            }
          );
        }

        return HttpResponse.json({
          success: true,
          data: { attempt },
        });
      })
    );

    const client = createApiClient('test-token', {
      initialDelayMs: 10,
      maxDelayMs: 100,
    });

    const result = await client.get('/api/test');
    expect(result.data.attempt).toBe(2);
  });
});
```

---

## End-to-End Tests

### Testing Payment Flow (Playwright)

**File:** `e2e/payment.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Payment Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Login or navigate to scan
    await page.goto('/dashboard');
  });

  test('should handle payment errors gracefully', async ({ page }) => {
    // Start payment
    await page.click('button:has-text("Get Full Report")');

    // Wait for payment modal
    await page.waitForSelector('text=Razorpay');

    // Simulate payment failure by checking error handling
    await page.evaluate(() => {
      // Trigger error by rejecting the payment
      window.dispatchEvent(
        new CustomEvent('razorpay-error', {
          detail: {
            code: 'BAD_REQUEST_ERROR',
            message: 'Invalid payment details',
          },
        })
      );
    });

    // Should show error message
    await expect(
      page.locator('text=Payment failed')
    ).toBeVisible();

    // Should have retry button
    await expect(
      page.locator('button:has-text("Retry")')
    ).toBeVisible();
  });

  test('should handle rate limit on upload', async ({ page }) => {
    // Upload file
    const fileInput = await page.locator('input[type="file"]');
    await fileInput.setInputFiles('./test-file.pdf');

    // Try multiple uploads quickly
    for (let i = 0; i < 15; i++) {
      await page.click('button:has-text("Upload")');
      await page.waitForTimeout(100);
    }

    // Should show rate limit message
    await expect(
      page.locator('text=/try again in.*seconds/')
    ).toBeVisible();
  });

  test('should recover from authentication error', async ({ page }) => {
    // Invalidate session
    await page.evaluate(() => {
      localStorage.removeItem('session');
    });

    // Try to access protected route
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/\/auth\//);
  });
});
```

---

## Error Simulation

### Simulating Common Errors

```typescript
// Mock payment service error
export const paymentErrorHandlers = {
  networkError: () => {
    throw new Error('Network error');
  },

  invalidSignature: () => {
    return HttpResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid Razorpay signature',
        },
      },
      { status: 400 }
    );
  },

  paymentTimeout: () => {
    return HttpResponse.json(
      {
        success: false,
        error: {
          code: 'TIMEOUT_ERROR',
          message: 'Payment verification timed out',
        },
      },
      { status: 504 }
    );
  },

  duplicatePayment: () => {
    return HttpResponse.json(
      {
        success: false,
        error: {
          code: 'DUPLICATE_ORDER',
          message: 'Order already exists',
        },
      },
      { status: 409 }
    );
  },
};
```

---

## Test Fixtures

### Common Test Setup

```typescript
export const testFixtures = {
  errorResponses: {
    validation: {
      status: 400,
      body: {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Input validation failed',
        },
      },
    },
    rateLimitExceeded: {
      status: 429,
      body: {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests',
          details: { retryAfterSeconds: 30 },
        },
      },
    },
    serverError: {
      status: 500,
      body: {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
        },
      },
    },
  },

  apiClient: {
    defaultConfig: {
      maxRetries: 3,
      initialDelayMs: 100,
      maxDelayMs: 5000,
    },
  },
};
```

---

## Coverage Goals

### Target Coverage Metrics

```json
{
  "coverage": {
    "lines": 90,
    "functions": 90,
    "branches": 85,
    "statements": 90
  },
  "errorHandling": {
    "allErrorCodes": "Covered by test",
    "retryLogic": "Covered by integration tests",
    "circuitBreaker": "100% unit test coverage",
    "errorBoundary": "Covered by component tests",
    "paymentFlow": "E2E test coverage"
  }
}
```

### Running Tests

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage

# Watch mode
npm run test:watch
```

---

## Common Test Patterns

### Pattern 1: Testing Async Errors

```typescript
it('should handle async errors', async () => {
  const promise = client.post('/api/test').catch((error) => {
    expect(error.code).toBe('INTERNAL_SERVER_ERROR');
  });

  await expect(promise).rejects.toThrow();
});
```

### Pattern 2: Testing Error Recovery

```typescript
it('should recover from error', async () => {
  let callCount = 0;

  const handler = vi.fn(async () => {
    callCount++;
    if (callCount === 1) throw new Error('First call fails');
    return 'success';
  });

  // First attempt fails
  try {
    await handler();
  } catch (e) {
    // Expected
  }

  // Second attempt succeeds
  const result = await handler();
  expect(result).toBe('success');
});
```

### Pattern 3: Testing Error Boundaries

```typescript
it('should catch errors in ErrorBoundary', () => {
  const { container } = render(
    <ErrorBoundary>
      <ComponentThatThrows />
    </ErrorBoundary>
  );

  expect(container.textContent).toContain('Something went wrong');
});
```

---

## Resources

- Vitest Docs: https://vitest.dev
- Testing Library: https://testing-library.com
- Mock Service Worker: https://mswjs.io
- Playwright: https://playwright.dev
