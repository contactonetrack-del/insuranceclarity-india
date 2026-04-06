import { redisClient } from '@/lib/cache/redis';
import { logger } from '@/lib/logger';

export interface RateLimitInput {
    scope: string;
    limit: number;
    windowSeconds: number;
    userId?: string | null;
    ipAddress?: string | null;
}

export interface RateLimitResult {
    allowed: boolean;
    limit: number;
    remaining: number;
    retryAfterSeconds: number;
}

/**
 * Enforces a fixed-window rate limit for any endpoint.
 * Uses user id when available (per-user limit), falls back to IP.
 */
export async function enforceRateLimit(input: RateLimitInput): Promise<RateLimitResult> {
    if (!redisClient.isConfigured()) {
        return {
            allowed: true,
            limit: input.limit,
            remaining: input.limit,
            retryAfterSeconds: 0,
        };
    }

    const identity = input.userId ? `u:${input.userId}` : `ip:${input.ipAddress ?? 'unknown'}`;
    const windowMs = input.windowSeconds * 1000;
    const now = Date.now();
    const bucket = Math.floor(now / windowMs);
    const key = `rate:${input.scope}:${identity}:${bucket}`;

    const count = await redisClient.incr(key);
    if (count === 1) {
        await redisClient.expire(key, input.windowSeconds + 1);
    }

    if (count === 0) {
        // Redis failure fallback from wrapper - fail open but log.
        logger.warn({
            action: 'rate_limit.redis_fallback',
            scope: input.scope,
            identity,
        });
        return {
            allowed: true,
            limit: input.limit,
            remaining: input.limit,
            retryAfterSeconds: 0,
        };
    }

    const allowed = count <= input.limit;
    const remaining = Math.max(0, input.limit - count);

    if (!allowed) {
        logger.warn({
            action: 'rate_limit.exceeded',
            scope: input.scope,
            identity,
            count,
            limit: input.limit,
        });
    }

    return {
        allowed,
        limit: input.limit,
        remaining,
        retryAfterSeconds: allowed ? 0 : input.windowSeconds,
    };
}