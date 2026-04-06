# API Error Response Standardization Guide

## Overview

All API responses are now standardized using a centralized error response utility (`/lib/api/error-response.ts`). This ensures consistent error handling, proper HTTP status codes, and improved developer experience.

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* your data */ }
}
```
Status: 200 (or specified code)

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again shortly.",
    "details": { "retryAfterSeconds": 60 }
  }
}
```

## Error Codes

| Code | HTTP Status | Description | Use Case |
|------|-------------|-------------|----------|
| `VALIDATION_ERROR` | 400 | Request data validation failed | Invalid form inputs, missing fields |
| `UNAUTHORIZED` | 401 | Authentication required | User not signed in, expired session |
| `FORBIDDEN` | 403 | Insufficient permissions | User lacks required role/permissions |
| `NOT_FOUND` | 404 | Resource not found | Requested item doesn't exist |
| `RATE_LIMIT_EXCEEDED` | 429 | Rate limit exceeded | Too many requests in time window |
| `PLAN_LIMIT_EXCEEDED` | 402 | Feature not available on current plan | User needs to upgrade |
| `INTERNAL_SERVER_ERROR` | 500 | Server error | Unexpected server-side error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily down | Database down, external service unavailable |
| `EXTERNAL_SERVICE_ERROR` | 503 | Third-party service error | Razorpay, Cloudinary, AI service down |

## Usage Patterns

### Successful Response
```typescript
import { createSuccessResponse } from '@/lib/api/error-response';

// With data
return createSuccessResponse({ userId: 123, name: 'John' });

// Without data
return createSuccessResponse({}, 201); // Custom status code

// Anonymous success
return createSuccessResponse();
```

### Using Error Factory

```typescript
import { ErrorFactory } from '@/lib/api/error-response';

// Validation errors
return ErrorFactory.validationError('Email is required');

// Authentication
return ErrorFactory.unauthorized('Sign in to continue');

// Permissions
return ErrorFactory.forbidden('Only admins can access this');

// Rate limiting
return ErrorFactory.rateLimitExceeded('Too many scan requests', {
  retryAfterSeconds: 60
});

// Plan upgrades
return ErrorFactory.planLimitExceeded('Advanced Reports', 'Pro');

// Server errors
return ErrorFactory.internalServerError('Failed to process calculation');

// Service unavailability
return ErrorFactory.serviceUnavailable('Database is temporarily down');

// External service issues
return ErrorFactory.externalServiceError('Razorpay');
```

### Zod Validation Errors

```typescript
import { handleValidationError } from '@/lib/api/error-response';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
});

try {
  const parsed = schema.parse(body);
} catch (error) {
  if (error instanceof z.ZodError) {
    return handleValidationError(error);
  }
}
```

## Route Implementation Example

```typescript
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { 
  createSuccessResponse, 
  handleValidationError, 
  ErrorFactory 
} from '@/lib/api/error-response';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.parse(body);
    
    // Process...
    
    return createSuccessResponse({ id: 123 }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleValidationError(error);
    }
    
    logger.error({ action: 'create_user.error', error });
    return ErrorFactory.internalServerError('Failed to create user');
  }
}
```

## Migration Guide

### Old Pattern
```typescript
return NextResponse.json({ error: 'Missing email' }, { status: 400 });
return NextResponse.json({ success: true, data: user });
```

### New Pattern
```typescript
return ErrorFactory.validationError('Missing email address');
return createSuccessResponse(user);
```

## Logging

All errors are automatically logged with:
- Error code
- HTTP status code
- Custom message
- Additional context

Disable logging with:
```typescript
createErrorResponse({
  // ...
  logError: false,  // Don't log this error
});
```

## Client Handling Example

```typescript
// React
const res = await fetch('/api/endpoint', { method: 'POST', body: JSON.stringify(data) });
const result = res.json();

if (!result.success) {
  // Handle error
  console.error(result.error.code, result.error.message);
  
  if (result.error.code === 'RATE_LIMIT_EXCEEDED') {
    // show retry button
  }
} else {
  // Handle success
  console.log(result.data);
}
```

## Updated Routes

The following routes have been standardized:
- ✅ `/api/contact` - Lead form submission
- ✅ `/api/advisor` - AI advisor responses
- ✅ `/api/calculations` - User calculation save/retrieve
- ✅ `/api/leads` - Lead submission with rate limiting
- ✅ `/api/upload` - PDF upload and scan
- ✅ `/api/admin/leads/export` - CSV export for admins
- ✅ `/api/health/plans` - Subscription plan validation status

## Health Check Endpoint

**Endpoint**: `GET /api/health/plans`

**Response** (Healthy - 200):
```json
{
  "healthy": true,
  "service": "subscription-plans",
  "status": "HEALTHY",
  "plans": {
    "pro": "plan_1234567...",
    "enterprise": "plan_7654321...",
    "mode": "live"
  },
  "validation": {
    "valid": true,
    "issues": [],
    "warnings": []
  }
}
```

**Response** (Unhealthy - 503):
```json
{
  "healthy": false,
  "status": "DEGRADED",
  "validation": {
    "valid": false,
    "issues": ["Missing RAZORPAY_PLAN_ID_PRO environment variable"]
  }
}
```

## Best Practices

1. **Always use ErrorFactory or createErrorResponse** - Never use raw `NextResponse.json({ error: ... })`
2. **Provide user-friendly messages** - Don't expose internal error details
3. **Include retryAfter for rate limits** - Helps clients implement exponential backoff
4. **Log original errors** - Use `logContext` to capture stack traces
5. **Handle Zod errors specially** - Use `handleValidationError()` for validation responses
6. **Test error paths** - Verify error responses match the documented format

## Monitoring

Monitor these error codes in your analytics/logging system:
- Spike in `VALIDATION_ERROR` → API contract changed or client bug
- Spike in `RATE_LIMIT_EXCEEDED` → Bot attack or legitimate traffic surge
- Spike in `EXTERNAL_SERVICE_ERROR` → Third-party service issue
- Spike in `INTERNAL_SERVER_ERROR` → Production bug

