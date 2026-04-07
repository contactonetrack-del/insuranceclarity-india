/**
 * Insurance Clarity API Client SDK
 *
 * TypeScript SDK for consuming the Insurance Clarity API.
 * Features:
 * - Automatic retry with exponential backoff
 * - Type-safe responses
 * - Error handling with context
 * - Rate limit awareness
 * - Circuit breaker pattern
 */

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

export interface RetryConfig {
  maxRetries: number; // Default: 3
  initialDelayMs: number; // Default: 100
  maxDelayMs: number; // Default: 5000
  backoffMultiplier: number; // Default: 2
}

export interface RequestContext {
  method: string;
  url: string;
  timestamp: number;
  attempt: number;
  latencyMs?: number;
}

export interface ClientError extends Error {
  code: string;
  statusCode?: number;
  context: RequestContext;
  originalError?: Error;
}

/**
 * Retry configuration for different error types
 */
const RETRYABLE_ERRORS = new Set([
  'RATE_LIMIT_EXCEEDED', // 429
  'SERVICE_UNAVAILABLE', // 503
  'EXTERNAL_SERVICE_ERROR', // 502, 504
]);

const RETRYABLE_STATUS_CODES = new Set([429, 502, 503, 504]);

/**
 * Insurance Clarity API Client
 */
export class ApiClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private circuitBreakerState: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount = 0;
  private readonly CIRCUIT_BREAKER_THRESHOLD = 5;
  private readonly CIRCUIT_BREAKER_RESET_MS = 60000; // 1 minute
  private retryConfig: RetryConfig;

  constructor(baseUrl: string, apiKey: string, retryConfig?: Partial<RetryConfig>) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.retryConfig = {
      maxRetries: retryConfig?.maxRetries ?? 3,
      initialDelayMs: retryConfig?.initialDelayMs ?? 100,
      maxDelayMs: retryConfig?.maxDelayMs ?? 5000,
      backoffMultiplier: retryConfig?.backoffMultiplier ?? 2,
    };
  }

  /**
   * GET request with automatic retry
   */
  async get<T = unknown>(path: string, options?: RequestInit): Promise<ApiSuccessResponse<T>> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  /**
   * POST request with automatic retry
   */
  async post<T = unknown>(path: string, body?: unknown, options?: RequestInit): Promise<ApiSuccessResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT request with automatic retry
   */
  async put<T = unknown>(path: string, body?: unknown, options?: RequestInit): Promise<ApiSuccessResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request with automatic retry
   */
  async delete<T = unknown>(path: string, options?: RequestInit): Promise<ApiSuccessResponse<T>> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }

  /**
   * Core request method with retry logic
   */
  private async request<T = unknown>(path: string, options: RequestInit = {}): Promise<ApiSuccessResponse<T>> {
    const url = new URL(path, this.baseUrl).toString();
    const method = options.method || 'GET';
    let lastError: ClientError | null = null;

    for (let attempt = 1; attempt <= this.retryConfig.maxRetries + 1; attempt++) {
      try {
        // Check circuit breaker
        if (this.circuitBreakerState === 'OPEN') {
          throw new Error('Circuit breaker is OPEN - service unavailable');
        }

        const context: RequestContext = {
          method,
          url,
          timestamp: Date.now(),
          attempt,
        };

        // Perform request
        const startTime = performance.now();
        const response = await fetch(url, {
          ...options,
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            ...(options.headers as Record<string, string>),
          },
        });

        context.latencyMs = performance.now() - startTime;

        // Handle response
        const data = await response.json() as ApiResponse<T>;

        if (!response.ok) {
          const errorResponse = data as unknown as ApiErrorResponse;
          const isRetryable =
            RETRYABLE_STATUS_CODES.has(response.status) ||
            RETRYABLE_ERRORS.has(errorResponse.error?.code);

          if (isRetryable && attempt <= this.retryConfig.maxRetries) {
            // Retry after delay
            const delay = this.calculateBackoffDelay(attempt);
            await this.sleep(delay);
            continue;
          }

          // Non-retryable or max retries exceeded
          throw this.createClientError(errorResponse, response.status, context);
        }

        // Success
        this.failureCount = 0;
        this.circuitBreakerState = 'CLOSED';

        return data as ApiSuccessResponse<T>;
      } catch (error) {
        lastError = this.createClientError(error, 500, {
          method,
          url,
          timestamp: Date.now(),
          attempt,
        });

        // Update circuit breaker
        this.failureCount++;
        if (this.failureCount >= this.CIRCUIT_BREAKER_THRESHOLD) {
          this.circuitBreakerState = 'OPEN';
          setTimeout(() => {
            this.circuitBreakerState = 'HALF_OPEN';
            this.failureCount = 0;
          }, this.CIRCUIT_BREAKER_RESET_MS);
        }

        // Retry if applicable
        if (attempt < this.retryConfig.maxRetries + 1) {
          const delay = this.calculateBackoffDelay(attempt);
          await this.sleep(delay);
        }
      }
    }

    throw lastError || new Error('Request failed after all retries');
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateBackoffDelay(attempt: number): number {
    const delay = this.retryConfig.initialDelayMs * Math.pow(this.retryConfig.backoffMultiplier, attempt - 1);
    return Math.min(delay, this.retryConfig.maxDelayMs);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Create typed client error
   */
  private createClientError(
    error: unknown,
    status: number,
    context: RequestContext,
  ): ClientError {
    const clientError = new Error() as ClientError;
    clientError.context = context;
    clientError.statusCode = status;

    if (typeof error === 'object' && error !== null && 'error' in error) {
      const apiError = error as ApiErrorResponse;
      clientError.code = apiError.error.code;
      clientError.message = apiError.error.message;
    } else if (error instanceof Error) {
      clientError.originalError = error;
      clientError.code = 'UNKNOWN_ERROR';
      clientError.message = error.message;
    } else {
      clientError.code = 'UNKNOWN_ERROR';
      clientError.message = 'An unexpected error occurred';
    }

    return clientError;
  }
}

/**
 * Create API client instance
 */
export function createApiClient(apiKey: string, retryConfig?: Partial<RetryConfig>): ApiClient {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  return new ApiClient(baseUrl, apiKey, retryConfig);
}
