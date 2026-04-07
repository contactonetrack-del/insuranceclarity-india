/**
 * Circuit Breaker pattern implementation
 * Prevents cascading failures by failing fast when a threshold is reached
 */

type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerConfig {
  failureThreshold?: number; // consecutive failures to trigger OPEN (default: 5)
  resetTimeoutMs?: number; // time before transitioning to HALF_OPEN (default: 60000)
  windowMs?: number; // rolling window for failure tracking (default: 60000)
}

export class CircuitBreaker {
  private state: CircuitBreakerState = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime: number | null = null;
  private nextAttemptTime: number | null = null;
  private successCount = 0;

  private readonly failureThreshold: number;
  private readonly resetTimeoutMs: number;
  private readonly windowMs: number;

  constructor(config: CircuitBreakerConfig = {}) {
    this.failureThreshold = config.failureThreshold ?? 5;
    this.resetTimeoutMs = config.resetTimeoutMs ?? 60000;
    this.windowMs = config.windowMs ?? 60000;
  }

  /**
   * Get current state
   */
  getState(): CircuitBreakerState {
    if (this.state === 'HALF_OPEN') {
      return 'HALF_OPEN';
    }

    if (this.state === 'OPEN') {
      const now = Date.now();
      if (this.nextAttemptTime && now >= this.nextAttemptTime) {
        this.state = 'HALF_OPEN';
        this.successCount = 0;
        return 'HALF_OPEN';
      }
      return 'OPEN';
    }

    // Check if we need to reset due to window expiry
    if (this.lastFailureTime && Date.now() - this.lastFailureTime > this.windowMs) {
      this.failureCount = 0;
      this.lastFailureTime = null;
    }

    return 'CLOSED';
  }

  /**
   * Execute function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const state = this.getState();

    if (state === 'OPEN') {
      throw new Error(
        `Circuit breaker is OPEN. Retry after ${Math.ceil((this.nextAttemptTime! - Date.now()) / 1000)}s`
      );
    }

    try {
      const result = await fn();

      // Success
      if (state === 'HALF_OPEN') {
        this.successCount++;
        if (this.successCount >= 2) {
          this.close();
        }
      }

      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  /**
   * Record a failure
   */
  recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.open();
    }
  }

  /**
   * Record a success
   */
  recordSuccess(): void {
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= 2) {
        this.close();
      }
    } else if (this.state === 'CLOSED') {
      // Reset on success
      this.failureCount = Math.max(0, this.failureCount - 1);
    }
  }

  /**
   * Transition to OPEN state
   */
  private open(): void {
    this.state = 'OPEN';
    this.nextAttemptTime = Date.now() + this.resetTimeoutMs;
  }

  /**
   * Transition to CLOSED state (reset)
   */
  private close(): void {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.nextAttemptTime = null;
    this.successCount = 0;
  }

  /**
   * Get circuit breaker metrics
   */
  getMetrics() {
    return {
      state: this.getState(),
      failureCount: this.failureCount,
      failureThreshold: this.failureThreshold,
      successCount: this.successCount,
      nextAttemptTime: this.nextAttemptTime,
    };
  }

  /**
   * Reset circuit breaker manually
   */
  reset(): void {
    this.close();
  }
}

/**
 * Global circuit breaker for the application
 */
export const applicationCircuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeoutMs: 60000,
});
