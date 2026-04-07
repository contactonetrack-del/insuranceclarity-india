/**
 * API Error Response Standardization
 * 
 * All API endpoints should use this utility to return consistent error responses.
 * Standardized format:
 * {
 *   success: false,
 *   error: { code: 'ERROR_CODE', message: 'User-friendly message', details?: {...} },
 *   statusCode: 400
 * }
 */

import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { errorAggregator as monitoringErrorAggregator } from '@/lib/monitoring/error-aggregator';
import { getSeverityFromStatus } from '@/lib/monitoring/error-events';
import { z } from 'zod';

function getErrorAggregator() {
  return monitoringErrorAggregator;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data?: T;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export enum ErrorCode {
  // Client errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MISSING_FIELD = 'MISSING_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  
  // Auth errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  
  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  
  // Rate limit errors
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  
  // Plan/subscription errors
  PLAN_LIMIT_EXCEEDED = 'PLAN_LIMIT_EXCEEDED',
  SUBSCRIPTION_REQUIRED = 'SUBSCRIPTION_REQUIRED',
  PAYMENT_REQUIRED = 'PAYMENT_REQUIRED',
  
  // Server errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
}

export interface ApiErrorOptions {
  code: ErrorCode;
  message: string;
  statusCode: number;
  details?: unknown;
  logError?: boolean;
  logContext?: Record<string, unknown>;
}

/**
 * Creates a standardized error response
 */
export function createErrorResponse(options: ApiErrorOptions, context?: { route?: string; method?: string; userId?: string; ipAddress?: string }): NextResponse {
  const { code, message, statusCode, details, logError = true, logContext } = options;

  if (logError) {
    logger.error({
      action: 'api.error',
      code,
      message,
      statusCode,
      ...logContext,
    });

    // Log to error monitoring system
    try {
      const aggregator = getErrorAggregator();
      if (aggregator && context?.route) {
        aggregator.queueError({
          code,
          message,
          route: context.route,
          method: context.method || 'UNKNOWN',
          statusCode,
          severity: getSeverityFromStatus(statusCode, code),
          userId: context.userId,
          ipAddress: context.ipAddress,
          details: details as Record<string, unknown> | undefined,
        });
      }
    } catch (err) {
      // Silently fail if monitoring not available
    }
  }

  const body: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
    },
  };

  if (details !== undefined) {
    body.error.details = details;
  }

  return NextResponse.json(body, { status: statusCode });
}

/**
 * Creates a standardized success response
 */
export function createSuccessResponse<T = unknown>(data?: T, statusCode = 200): NextResponse {
  const body: ApiSuccessResponse<T> = { success: true };

  if (data !== undefined) {
    body.data = data;
  }

  return NextResponse.json(body, { status: statusCode });
}

/**
 * Handles Zod validation errors
 */
export function handleValidationError(error: z.ZodError, action = 'validation'): NextResponse {
  return createErrorResponse({
    code: ErrorCode.VALIDATION_ERROR,
    message: 'Request validation failed',
    statusCode: 400,
    details: error.flatten().fieldErrors,
    logError: false,
    logContext: { action, issues: error.issues.length },
  });
}

/**
 * Error factory functions for common scenarios
 */
export const ErrorFactory = {
  validationError: (message = 'Request validation failed', details?: unknown) =>
    createErrorResponse({
      code: ErrorCode.VALIDATION_ERROR,
      message,
      statusCode: 400,
      details,
      logError: false,
    }),

  unauthorized: (message = 'Authentication required. Please sign in.') =>
    createErrorResponse({
      code: ErrorCode.UNAUTHORIZED,
      message,
      statusCode: 401,
      logError: false,
    }),

  forbidden: (message = 'You do not have permission to access this resource.') =>
    createErrorResponse({
      code: ErrorCode.FORBIDDEN,
      message,
      statusCode: 403,
      logError: false,
    }),

  notFound: (resource = 'Resource') =>
    createErrorResponse({
      code: ErrorCode.NOT_FOUND,
      message: `${resource} not found.`,
      statusCode: 404,
      logError: false,
    }),

  rateLimitExceeded: (message = 'Too many requests. Please try again shortly.', options?: { retryAfterSeconds?: number }) =>
    createErrorResponse({
      code: ErrorCode.RATE_LIMIT_EXCEEDED,
      message,
      statusCode: 429,
      details: options,
      logError: false,
    }),

  planLimitExceeded: (feature: string, plan: string) =>
    createErrorResponse({
      code: ErrorCode.PLAN_LIMIT_EXCEEDED,
      message: `${feature} is not available on your ${plan} plan. Upgrade to access this feature.`,
      statusCode: 402,
      logError: false,
    }),

  internalServerError: (message = 'An unexpected error occurred. Please try again later.', originalError?: Error) =>
    createErrorResponse({
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      message,
      statusCode: 500,
      logContext: {
        originalError: originalError?.message,
      },
    }),

  serviceUnavailable: (message = 'Service temporarily unavailable. Please try again later.') =>
    createErrorResponse({
      code: ErrorCode.SERVICE_UNAVAILABLE,
      message,
      statusCode: 503,
    }),

  externalServiceError: (service: string) =>
    createErrorResponse({
      code: ErrorCode.EXTERNAL_SERVICE_ERROR,
      message: `${service} is temporarily unavailable. Please try again.`,
      statusCode: 503,
      logContext: { service },
    }),
};
