/**
 * Error Handling System
 * Central export for all error handling utilities
 */

export { ApiError, type ApiErrorDetails, type ErrorCode, type ErrorSeverity } from './api-error';
export { RateLimiter, GlobalRateLimiter, globalRateLimiter } from './rate-limiter';
export { CircuitBreaker, applicationCircuitBreaker } from './circuit-breaker';
export { ErrorLogger, errorLogger, getErrorContext, type ErrorLogEntry } from './error-logger';
export { ApiClient, createApiClient, type ApiClientConfig } from './api-client';
export {
  withErrorHandler,
  withRateLimit,
  withAuth,
  createApiHandler,
} from './middleware';

// Helper to create standardized success response
export function successResponse<T>(data: T, message?: string) {
  return {
    success: true,
    message,
    data,
  };
}

// Helper to create error response (though ApiError.toJSON() is preferred)
export function errorResponse(code: string, message: string, _status: number) {
  return {
    success: false,
    error: {
      code,
      message,
    },
  };
}
