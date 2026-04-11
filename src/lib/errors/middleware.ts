/**
 * Error handling middleware for Next.js API routes
 * Standardizes error responses and logs to database
 */

import { NextRequest, NextResponse } from 'next/server';
import { ApiError } from './api-error';
import { errorLogger, getErrorContext } from './error-logger';
import * as Sentry from '@sentry/nextjs';

type RouteHandler = (req: NextRequest) => Promise<NextResponse>;
type AuthenticatedSession = { token: string };
type AuthenticatedRouteHandler = (
  req: NextRequest,
  session: AuthenticatedSession
) => Promise<NextResponse>;

const SENTRY_LEVELS = {
  LOW: 'info',
  MEDIUM: 'warning',
  HIGH: 'error',
  CRITICAL: 'fatal',
} as const;

/**
 * Wrap handler with error handling
 */
export function withErrorHandler<T extends RouteHandler>(handler: T): T {
  return (async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (error) {
      const apiError = error instanceof ApiError ? error : ApiError.handle(error);

      // Log error
      errorLogger.log(apiError, getErrorContext(req));

      // Report to Sentry
      Sentry.captureException(apiError, {
        level: SENTRY_LEVELS[apiError.severity],
        tags: {
          errorCode: apiError.code,
          route: req.nextUrl.pathname,
          method: req.method,
        },
      });

      // Return standardized error response
      return NextResponse.json(apiError.toJSON(), { status: apiError.status });
    }
  }) as T;
}

/**
 * Wrap handler and add rate limiting
 */
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: {
    scope: string;
    maxRequests: number;
    timeWindowSeconds: number;
  }
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Get rate limiter
      const { globalRateLimiter } = await import('./rate-limiter');

      // Get rate limit key (IP or user ID)
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
      const key = ip;

      if (!globalRateLimiter.allow(options.scope, key)) {
        const stats = globalRateLimiter.getStats(options.scope, key);
        throw ApiError.rateLimitExceeded(stats?.retryAfterSeconds || 60);
      }

      return await handler(req);
    } catch (error) {
      const apiError = error instanceof ApiError ? error : ApiError.handle(error);

      errorLogger.log(apiError, getErrorContext(req));

      Sentry.captureException(apiError, {
        level: SENTRY_LEVELS[apiError.severity],
        tags: {
          errorCode: apiError.code,
          scope: options.scope,
        },
      });

      return NextResponse.json(apiError.toJSON(), {
        status: apiError.status,
        headers: apiError.retryAfterSeconds
          ? { 'Retry-After': String(apiError.retryAfterSeconds) }
          : {},
      });
    }
  };
}

/**
 * Wrap handler with authentication check
 */
export function withAuth(
  handler: AuthenticatedRouteHandler
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Get session from headers or cookies
      const token = req.headers.get('authorization')?.replace('Bearer ', '');

      if (!token) {
        throw ApiError.unauthorized('Authentication token required');
      }

      // Verify token (simplified - use your auth library)
      // const session = await auth({ req });
      // if (!session) throw ApiError.unauthorized();

      // For now, just pass token as session
      return await handler(req, { token });
    } catch (error) {
      const apiError = error instanceof ApiError ? error : ApiError.handle(error);

      errorLogger.log(apiError, getErrorContext(req));

      return NextResponse.json(apiError.toJSON(), { status: apiError.status });
    }
  };
}

/**
 * Create comprehensive error handler combining all middleware
 */
export function createApiHandler(
  handler: RouteHandler,
  options?: {
    rateLimit?: string;
    requireAuth?: boolean;
  }
): (req: NextRequest) => Promise<NextResponse> {
  let finalHandler: RouteHandler = handler;

  if (options?.rateLimit) {
    finalHandler = withRateLimit(finalHandler, {
      scope: options.rateLimit,
      maxRequests: 60,
      timeWindowSeconds: 3600,
    });
  }

  if (options?.requireAuth) {
    const protectedHandler = finalHandler;
    finalHandler = withAuth(async (req) => protectedHandler(req));
  }

  finalHandler = withErrorHandler(finalHandler);

  return finalHandler;
}
