/**
 * Standardized Error class that implements RFC 7807 style payloads.
 */

export type ErrorSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ErrorCode = string;

export interface ApiErrorDetails {
  errorCode?: ErrorCode;
  retryAfterSeconds?: number;
  [key: string]: unknown;
}

export interface ApiErrorInit {
  code?: ErrorCode;
  message: string;
  status?: number;
  statusCode?: number;
  details?: unknown;
  type?: string;
  severity?: ErrorSeverity;
}

function getSeverityFromStatus(statusCode: number): ErrorSeverity {
  if (statusCode >= 500) return 'CRITICAL';
  if (statusCode >= 400) return 'HIGH';
  if (statusCode >= 300) return 'MEDIUM';
  return 'LOW';
}

function defaultCodeForStatus(statusCode: number): ErrorCode {
  if (statusCode === 400) return 'BAD_REQUEST';
  if (statusCode === 401) return 'UNAUTHORIZED';
  if (statusCode === 403) return 'FORBIDDEN';
  if (statusCode === 404) return 'NOT_FOUND';
  if (statusCode === 409) return 'CONFLICT';
  if (statusCode === 429) return 'RATE_LIMIT_EXCEEDED';
  if (statusCode === 503) return 'SERVICE_UNAVAILABLE';
  if (statusCode >= 500) return 'INTERNAL_SERVER_ERROR';
  return 'UNKNOWN_ERROR';
}

function extractErrorCode(details?: unknown): ErrorCode | undefined {
  if (!details || typeof details !== 'object') return undefined;
  const value = (details as ApiErrorDetails).errorCode;
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function extractRetryAfter(details?: unknown): number | undefined {
  if (!details || typeof details !== 'object') return undefined;
  const value = (details as ApiErrorDetails).retryAfterSeconds;
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : undefined;
}

export class ApiError extends Error {
  public statusCode: number;
  public details?: unknown;
  public type: string;
  public code: ErrorCode;
  public severity: ErrorSeverity;
  public retryAfterSeconds?: number;

  constructor(message: string, statusCode?: number, details?: unknown, type?: string);
  constructor(init: ApiErrorInit);
  constructor(
    messageOrInit: string | ApiErrorInit,
    statusCode = 500,
    details?: unknown,
    type = 'about:blank'
  ) {
    const isInit = typeof messageOrInit === 'object';
    const message = isInit ? messageOrInit.message : messageOrInit;
    super(message);
    this.name = 'ApiError';

    const resolvedStatus = isInit ? (messageOrInit.status ?? messageOrInit.statusCode ?? 500) : statusCode;
    const resolvedDetails = isInit ? messageOrInit.details : details;
    const resolvedType = isInit ? (messageOrInit.type ?? 'about:blank') : type;
    const resolvedCode = isInit ? messageOrInit.code : undefined;
    const resolvedSeverity = isInit ? messageOrInit.severity : undefined;

    this.statusCode = resolvedStatus;
    this.details = resolvedDetails;
    this.type = resolvedType;
    this.code = resolvedCode ?? extractErrorCode(resolvedDetails) ?? defaultCodeForStatus(resolvedStatus);
    this.severity = resolvedSeverity ?? getSeverityFromStatus(resolvedStatus);
    this.retryAfterSeconds = extractRetryAfter(resolvedDetails);

    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * Backward-compatible alias used by existing middleware.
   */
  get status(): number {
    return this.statusCode;
  }

  /**
   * Retry policy used by the API client.
   */
  get retryable(): boolean {
    return this.statusCode === 408 || this.statusCode === 425 || this.statusCode === 429 || this.statusCode >= 500;
  }

  public toJSON() {
    const base = {
      type: this.type,
      title: this.name,
      status: this.statusCode,
      detail: this.message,
      code: this.code,
    };

    if (this.details === undefined) {
      return base;
    }

    return {
      ...base,
      extensions: this.details,
    };
  }

  static badRequest(message: string, details?: ApiErrorDetails) {
    return new ApiError(message, 400, details, 'https://tools.ietf.org/html/rfc7231#section-6.5.1');
  }

  static unauthorized(message = 'Authentication required', details?: ApiErrorDetails) {
    return new ApiError(message, 401, details, 'https://tools.ietf.org/html/rfc7235#section-3.1');
  }

  static forbidden(message: string, details?: ApiErrorDetails) {
    return new ApiError(message, 403, details, 'https://tools.ietf.org/html/rfc7231#section-6.5.3');
  }

  static notFound(message: string, details?: ApiErrorDetails) {
    return new ApiError(message, 404, details, 'https://tools.ietf.org/html/rfc7231#section-6.5.4');
  }

  static conflict(message: string, details?: ApiErrorDetails) {
    return new ApiError(message, 409, details, 'https://tools.ietf.org/html/rfc7231#section-6.5.8');
  }

  static tooManyRequests(message: string, details?: ApiErrorDetails) {
    return new ApiError(message, 429, details, 'https://tools.ietf.org/html/rfc6585#section-4');
  }

  static serviceUnavailable(message: string, details?: ApiErrorDetails) {
    return new ApiError(message, 503, details, 'https://tools.ietf.org/html/rfc7231#section-6.6.4');
  }

  static internalServerError(message: string, details?: ApiErrorDetails) {
    return new ApiError(message, 500, details, 'https://tools.ietf.org/html/rfc7231#section-6.6.1');
  }

  static rateLimitExceeded(retryAfterSeconds: number) {
    return new ApiError('Rate limit exceeded', 429, { errorCode: 'RATE_LIMIT_EXCEEDED', retryAfterSeconds }, 'https://tools.ietf.org/html/rfc6585#section-4');
  }

  static handle(error: unknown): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    if (error instanceof Error) {
      return new ApiError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message,
        status: 500,
        details: { originalError: error.name },
      });
    }

    return new ApiError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      status: 500,
      details: { error },
    });
  }
}
