import { redisClient } from '@/lib/cache/redis';
import { logger } from '@/lib/logger';

export interface AiRateLimitInput {
    scope: string;
    limit: number;
    windowSeconds: number;
    userId?: string | null;
    ipAddress?: string | null;
}

export interface AiRateLimitResult {
    allowed: boolean;
    limit: number;
    remaining: number;
    retryAfterSeconds: number;
}

/**
 * Enforces a fixed-window rate limit for AI-heavy endpoints.
 * Uses user id when available (per-user limit), falls back to IP.
 */
export async function enforceAiRateLimit(input: AiRateLimitInput): Promise<AiRateLimitResult> {
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
    const key = `rate:ai:${input.scope}:${identity}:${bucket}`;

    const count = await redisClient.incr(key);
    if (count === 1) {
        await redisClient.expire(key, input.windowSeconds + 1);
    }

    if (count === 0) {
        // Redis failure fallback from wrapper - fail open but log.
        logger.warn({
            action: 'ai.rate_limit.redis_fallback',
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
    const retryAfterSeconds = Math.max(1, Math.ceil((((bucket + 1) * windowMs) - now) / 1000));

    return {
        allowed,
        limit: input.limit,
        remaining,
        retryAfterSeconds,
    };
}
