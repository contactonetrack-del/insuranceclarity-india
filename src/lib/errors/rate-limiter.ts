/**
 * Rate Limiter for per-endpoint protection
 * Tracks requests by IP or user ID with configurable windows
 */

interface RateLimitConfig {
  limit: number; // max requests
  window: number; // in seconds
}

interface RateLimitStats {
  current: number;
  limit: number;
  windowSeconds: number;
  resetAt: Date;
  retryAfterSeconds: number;
}

export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly config: RateLimitConfig;
  private readonly scope: string;

  constructor(scope: string, config: RateLimitConfig) {
    this.scope = scope;
    this.config = config;
  }

  /**
   * Check if request is allowed
   */
  allow(key: string): boolean {
    const now = Date.now();
    const windowMs = this.config.window * 1000;
    const requests = this.requests.get(key) || [];

    // Clean old requests outside window
    const validRequests = requests.filter(t => now - t < windowMs);

    if (validRequests.length < this.config.limit) {
      validRequests.push(now);
      this.requests.set(key, validRequests);
      return true;
    }

    return false;
  }

  /**
   * Get current rate limit stats
   */
  getStats(key: string): RateLimitStats {
    const now = Date.now();
    const windowMs = this.config.window * 1000;
    const requests = this.requests.get(key) || [];

    const validRequests = requests.filter(t => now - t < windowMs);
    const oldestRequest = validRequests[0];
    const resetAt = oldestRequest ? new Date(oldestRequest + windowMs) : new Date();
    const retryAfterSeconds = Math.ceil((resetAt.getTime() - now) / 1000);

    return {
      current: validRequests.length,
      limit: this.config.limit,
      windowSeconds: this.config.window,
      resetAt,
      retryAfterSeconds: Math.max(0, retryAfterSeconds),
    };
  }

  /**
   * Reset limit for a key
   */
  reset(key: string): void {
    this.requests.delete(key);
  }

  /**
   * Get all active keys with their counts
   */
  getActiveKeys(): Map<string, number> {
    const now = Date.now();
    const windowMs = this.config.window * 1000;
    const active = new Map<string, number>();

    for (const [key, requests] of this.requests) {
      const validCount = requests.filter(t => now - t < windowMs).length;
      if (validCount > 0) {
        active.set(key, validCount);
      }
    }

    return active;
  }
}

/**
 * Global rate limiters for each scope
 */
export class GlobalRateLimiter {
  private limiters: Map<string, RateLimiter> = new Map();

  constructor() {
    // Initialize standard scopes
    this.limiters.set('leads', new RateLimiter('leads', { limit: 5, window: 3600 }));
    this.limiters.set('uploads', new RateLimiter('uploads', { limit: 10, window: 3600 }));
    this.limiters.set('ai-requests', new RateLimiter('ai-requests', { limit: 60, window: 3600 }));
    this.limiters.set('otp', new RateLimiter('otp', { limit: 3, window: 60 }));
  }

  /**
   * Check if request is allowed for this scope
   */
  allow(scope: string, key: string): boolean {
    const limiter = this.limiters.get(scope);
    if (!limiter) {
      console.warn(`Unknown rate limit scope: ${scope}`);
      return true; // Allow if scope doesn't exist
    }
    return limiter.allow(key);
  }

  /**
   * Get stats for a scope and key
   */
  getStats(scope: string, key: string): RateLimitStats | null {
    const limiter = this.limiters.get(scope);
    return limiter ? limiter.getStats(key) : null;
  }

  /**
   * Add or update a custom limiter
   */
  setLimiter(scope: string, config: RateLimitConfig): void {
    this.limiters.set(scope, new RateLimiter(scope, config));
  }

  /**
   * Get all active keys for a scope
   */
  getActiveKeys(scope: string): Map<string, number> | null {
    const limiter = this.limiters.get(scope);
    return limiter ? limiter.getActiveKeys() : null;
  }
}

// Global instance
export const globalRateLimiter = new GlobalRateLimiter();
