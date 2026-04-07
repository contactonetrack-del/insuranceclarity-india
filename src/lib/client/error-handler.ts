/**
 * Client-Side Error Handler
 *
 * Transforms API errors into user-friendly UI messages and actions.
 * Handles retries, displays toasts, shows countdown timers for rate limits.
 */

import type { ClientError } from './api-client';
import type { ApiErrorResponse } from './api-client';

export interface ErrorHandlerConfig {
  showToast?: (message: string, type: 'error' | 'warning' | 'info') => void;
  redirectOnAuth?: boolean;
  logErrors?: boolean;
}

export interface UserFriendlyError {
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  severity: 'critical' | 'error' | 'warning' | 'info';
  retryable: boolean;
  retryAfterSeconds?: number;
}

const ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNAUTHORIZED: 'You need to sign in to continue.',
  FORBIDDEN: 'You don\'t have permission to perform this action.',
  NOT_FOUND: 'The resource you\'re looking for doesn\'t exist.',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please wait a moment before trying again.',
  PLAN_LIMIT_EXCEEDED: 'This feature requires a premium plan.',
  PAYMENT_REQUIRED: 'Payment is required to unlock this feature.',
  INTERNAL_SERVER_ERROR: 'Oops! Something went wrong. Our team has been notified.',
  SERVICE_UNAVAILABLE: 'Service is temporarily unavailable. Please try again in a moment.',
  EXTERNAL_SERVICE_ERROR: 'External service is unavailable. Please try again later.',
};

/**
 * Parse error into user-friendly format
 */
export function parseError(error: unknown, config?: ErrorHandlerConfig): UserFriendlyError {
  let title = 'Error';
  let message = 'An unexpected error occurred. Please try again.';
  let severity: 'critical' | 'error' | 'warning' | 'info' = 'error';
  let retryable = false;
  let retryAfterSeconds: number | undefined;
  let code = 'UNKNOWN_ERROR';

  // Extract error details
  if (error instanceof Error && 'code' in error && 'context' in error) {
    const clientError = error as ClientError;
    code = clientError.code;
    message = clientError.message;

    // Determine severity and retryability
    if (code === 'UNAUTHORIZED') {
      severity = 'critical';
      title = 'Sign In Required';
    } else if (code === 'RATE_LIMIT_EXCEEDED') {
      severity = 'warning';
      title = 'Too Many Requests';
      retryable = true;

      // Extract retry-after if available
      const details = (error as any).context?.details;
      if (typeof details === 'object' && details?.retryAfterSeconds) {
        retryAfterSeconds = details.retryAfterSeconds;
      }
    } else if (code.includes('SERVICE_UNAVAILABLE')) {
      severity = 'warning';
      title = 'Service Unavailable';
      retryable = true;
    } else if (code === 'VALIDATION_ERROR') {
      title = 'Invalid Input';
    } else if ([400, 404, 422].includes(clientError.statusCode || 0)) {
      severity = 'warning';
      title = 'Request Error';
    } else if (clientError.statusCode && clientError.statusCode >= 500) {
      severity = 'error';
      title = 'Server Error';
      retryable = true;
    }

    if (config?.logErrors) {
      console.error('[API Error]', {
        code,
        message,
        context: clientError.context,
        statusCode: clientError.statusCode,
      });
    }
  } else if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiErrorResponse;
    if ('error' in apiError && typeof apiError.error === 'object') {
      code = apiError.error.code;
      message = apiError.error.message;
      title = code
        .split('_')
        .map((word: string) => word.charAt(0) + word.slice(1).toLowerCase())
        .join(' ');
    }
  }

  // Get user-friendly message
  const userMessage = ERROR_MESSAGES[code] || message;

  return {
    title,
    message: userMessage,
    severity,
    retryable,
    retryAfterSeconds,
  };
}

/**
 * Error handler for React components
 */
export class ErrorHandler {
  private config: ErrorHandlerConfig;

  constructor(config?: ErrorHandlerConfig) {
    this.config = config || {};
  }

  /**
   * Handle error and display to user
   */
  handle(error: unknown): UserFriendlyError {
    const parsed = parseError(error, this.config);

    // Show toast if callback provided
    if (this.config.showToast) {
      this.config.showToast(parsed.message, parsed.severity === 'error' ? 'error' : 'warning');
    }

    // Redirect on auth errors
    if (parsed.title.includes('Sign In') && this.config.redirectOnAuth) {
      window.location.href = '/auth/signin';
    }

    return parsed;
  }

  /**
   * Get retry UI message
   */
  getRetryMessage(error: UserFriendlyError): string {
    if (!error.retryable) {
      return '';
    }

    if (error.retryAfterSeconds) {
      return `Please wait ${error.retryAfterSeconds} seconds before retrying.`;
    }

    return 'This error is temporary. Please try again.';
  }
}

/**
 * Create countdown timer for rate limits
 */
export function createRetryTimer(
  initialSeconds: number,
  onTick: (remainingSeconds: number) => void,
  onComplete: () => void,
): () => void {
  let remaining = initialSeconds;

  const interval = setInterval(() => {
    remaining--;
    onTick(remaining);

    if (remaining <= 0) {
      clearInterval(interval);
      onComplete();
    }
  }, 1000);

  return () => clearInterval(interval);
}
