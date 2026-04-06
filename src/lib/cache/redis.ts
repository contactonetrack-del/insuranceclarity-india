/**
 * Redis Cache Client — InsuranceClarity
 *
 * Uses Upstash Redis via @upstash/redis for serverless-safe HTTP-based caching.
 * Falls back gracefully if not configured.
 */

import { Redis } from '@upstash/redis';
import { logger } from '@/lib/logger';

// ─── Client Singleton ─────────────────────────────────────────────────────────

let _redis: Redis | null = null;

function getRedisClient(): Redis | null {
    if (_redis) return _redis;

    const url   = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
        logger.warn({
            action: 'redis.init',
            message: 'Upstash Redis not configured — caching disabled. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.',
        });
        return null;
    }

    _redis = new Redis({ url, token });
    return _redis;
}

// ─── Typed Cache API ──────────────────────────────────────────────────────────

/** Null-safe Redis wrapper — all ops no-op if Redis is not configured */
export const redisClient = {
    async get<T = string>(key: string): Promise<T | null> {
        const client = getRedisClient();
        if (!client) return null;
        try {
            return await client.get<T>(key);
        } catch (err) {
            logger.warn({ action: 'redis.get.error', key, error: String(err) });
            return null;
        }
    },

    async set(key: string, value: unknown, options?: { ex?: number }): Promise<void> {
        const client = getRedisClient();
        if (!client) return;
        try {
            if (options?.ex) {
                await client.setex(key, options.ex, JSON.stringify(value));
            } else {
                await client.set(key, JSON.stringify(value));
            }
        } catch (err) {
            logger.warn({ action: 'redis.set.error', key, error: String(err) });
        }
    },

    async setnx(key: string, value: unknown): Promise<number> {
        const client = getRedisClient();
        if (!client) return 1; // Bypass lock if Redis is disabled (return 1 = success, process event)
        try {
            return await client.setnx(key, JSON.stringify(value));
        } catch (err) {
            logger.warn({ action: 'redis.setnx.error', key, error: String(err) });
            return 1; // Bypass lock on error so we don't drop valid events
        }
    },

    async del(key: string): Promise<void> {
        const client = getRedisClient();
        if (!client) return;
        try {
            await client.del(key);
        } catch (err) {
            logger.warn({ action: 'redis.del.error', key, error: String(err) });
        }
    },

    async incr(key: string): Promise<number> {
        const client = getRedisClient();
        if (!client) return 0;
        try {
            return await client.incr(key);
        } catch (err) {
            logger.warn({ action: 'redis.incr.error', key, error: String(err) });
            return 0;
        }
    },

    async expire(key: string, seconds: number): Promise<void> {
        const client = getRedisClient();
        if (!client) return;
        try {
            await client.expire(key, seconds);
        } catch (err) {
            logger.warn({ action: 'redis.expire.error', key, error: String(err) });
        }
    },

    async eval<T = unknown>(script: string, keys: string[], args: unknown[]): Promise<T | null> {
        const client = getRedisClient();
        if (!client) return null;
        try {
            return await client.eval(script, keys, args);
        } catch (err) {
            logger.warn({ action: 'redis.eval.error', error: String(err) });
            return null;
        }
    },

    async keys(pattern: string): Promise<string[]> {
        const client = getRedisClient();
        if (!client) return [];
        try {
            return await client.keys(pattern);
        } catch (err) {
            logger.warn({ action: 'redis.keys.error', pattern, error: String(err) });
            return [];
        }
    },


    isConfigured(): boolean {
        return Boolean(
            process.env.UPSTASH_REDIS_REST_URL &&
            process.env.UPSTASH_REDIS_REST_TOKEN,
        );
    },
};
