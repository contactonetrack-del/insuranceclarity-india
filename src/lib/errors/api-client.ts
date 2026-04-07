/**
 * API Client with automatic retry, circuit breaker, and error handling
 */

import { ApiError } from './api-error';
import { CircuitBreaker } from './circuit-breaker';

export interface ApiClientConfig {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
}

interface FetchOptions extends RequestInit {
  timeout?: number;
}

const DEFAULT_CONFIG: Required<ApiClientConfig> = {
  maxRetries: 3,
  initialDelayMs: 100,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
};

export class ApiClient {
  private apiKey?: string;
  private config: Required<ApiClientConfig>;
  private circuitBreaker: CircuitBreaker;

  constructor(apiKey?: string, config: ApiClientConfig = {}) {
    this.apiKey = apiKey;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      resetTimeoutMs: 60000,
    });
  }

  /**
   * Make GET request
   */
  async get<T = any>(url: string, options?: FetchOptions): Promise<{ data: T }> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  /**
   * Make POST request
   */
  async post<T = any>(url: string, body?: any, options?: FetchOptions): Promise<{ data: T }> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Make PUT request
   */
  async put<T = any>(url: string, body?: any, options?: FetchOptions): Promise<{ data: T }> {
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Make PATCH request
   */
  async patch<T = any>(url: string, body?: any, options?: FetchOptions): Promise<{ data: T }> {
    return this.request<T>(url, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Make DELETE request
   */
  async delete<T = any>(url: string, options?: FetchOptions): Promise<{ data: T }> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }

  /**
   * Core request method with retry and error handling
   */
  private async request<T = any>(
    url: string,
    options: FetchOptions = {}
  ): Promise<{ data: T }> {
    return this.circuitBreaker.execute(() => this.requestWithRetry<T>(url, options));
  }

  /**
   * Request with automatic retry logic
   */
  private async requestWithRetry<T = any>(
    url: string,
    options: FetchOptions = {},
    attempt = 0
  ): Promise<{ data: T }> {
    try {
      const response = await this.fetchWithTimeout(url, {
        ...options,
        timeout: options.timeout ?? 30000,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      // Determine if we should retry
      const apiError = error instanceof ApiError ? error : ApiError.handle(error);

      // Check if retryable and attempts remain
      if (apiError.retryable && attempt < this.config.maxRetries) {
        const delayMs = this.getBackoffDelay(attempt);

        // If server specifies retry-after, use that
        if (apiError.retryAfterSeconds) {
          const serverDelayMs = apiError.retryAfterSeconds * 1000;
          const delay = Math.min(delayMs, serverDelayMs);
          await this.sleep(delay);
        } else {
          await this.sleep(delayMs);
        }

        // Retry
        return this.requestWithRetry<T>(url, options, attempt + 1);
      }

      // Not retryable or max retries reached
      throw apiError;
    }
  }

  /**
   * Fetch with timeout
   */
  private fetchWithTimeout(
    url: string,
    options: FetchOptions & { timeout: number }
  ): Promise<Response> {
    const { timeout, ...fetchOptions } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    return fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
        ...fetchOptions.headers,
      },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));
  }

  /**
   * Handle response and parse JSON
   */
  private async handleResponse<T>(response: Response): Promise<{ data: T }> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    let body: any = {};
    if (isJson) {
      body = await response.json();
    }

    // Success response
    if (response.ok) {
      return {
        data: body.data ?? body,
      };
    }

    // Error response
    const error = body.error || {};
    const apiError = new ApiError({
      code: error.code || 'INTERNAL_SERVER_ERROR',
      message: error.message || `HTTP ${response.status}`,
      status: response.status,
      details: error.details,
    });

    // Check for Retry-After header
    const retryAfter = response.headers.get('retry-after');
    if (retryAfter) {
      apiError.retryAfterSeconds = isNaN(Number(retryAfter))
        ? Math.ceil((new Date(retryAfter).getTime() - Date.now()) / 1000)
        : Number(retryAfter);
    }

    throw apiError;
  }

  /**
   * Calculate exponential backoff delay
   */
  private getBackoffDelay(attempt: number): number {
    const delay = this.config.initialDelayMs * Math.pow(this.config.backoffMultiplier, attempt);
    return Math.min(delay, this.config.maxDelayMs);
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get circuit breaker state
   */
  getCircuitBreakerState() {
    return this.circuitBreaker.getState();
  }

  /**
   * Get circuit breaker metrics
   */
  getCircuitBreakerMetrics() {
    return this.circuitBreaker.getMetrics();
  }
}

/**
 * Create API client instance
 */
export function createApiClient(apiKey?: string, config?: ApiClientConfig): ApiClient {
  return new ApiClient(apiKey, config);
}
