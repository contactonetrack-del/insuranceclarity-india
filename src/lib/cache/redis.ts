/**
 * Redis cache client for serverless-safe caching and short-lived coordination.
 *
 * Uses Upstash Redis via HTTP and degrades gracefully when the service is
 * misconfigured or temporarily unreachable.
 */

import { Redis } from '@upstash/redis';
import { logger } from '@/lib/logger';

const REDIS_OUTAGE_BACKOFF_MS = 5 * 60 * 1000;
const REDIS_TRANSIENT_ERROR_PATTERNS = [
    'fetch failed',
    'getaddrinfo enotfound',
    'connect econnrefused',
    'connect etimedout',
    'read econnreset',
    'network',
    'socket hang up',
    'timed out',
] as const;

let redisClientInstance: Redis | null = null;
let hasLoggedMissingConfig = false;
let redisUnavailableUntil = 0;
let lastRedisOutageSignature = '';

function isPlaceholderRedisConfig(url?: string, token?: string): boolean {
    const normalizedUrl = url?.trim().toLowerCase() ?? '';
    const normalizedToken = token?.trim().toLowerCase() ?? '';

    return (
        !normalizedUrl ||
        !normalizedToken ||
        normalizedUrl.includes('ci.upstash.io') ||
        normalizedUrl.includes('placeholder') ||
        normalizedUrl.includes('example.com') ||
        normalizedToken === 'ci_token' ||
        normalizedToken.includes('placeholder')
    );
}

function isRedisCircuitOpen(): boolean {
    return redisUnavailableUntil > Date.now();
}

function getRedisErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

function isTransientRedisError(error: unknown): boolean {
    const normalized = getRedisErrorMessage(error).toLowerCase();
    return REDIS_TRANSIENT_ERROR_PATTERNS.some((pattern) => normalized.includes(pattern));
}

function openRedisCircuit(action: string, error: unknown, metadata: Record<string, unknown> = {}): void {
    const message = getRedisErrorMessage(error);
    const signature = `${action}:${message}`;

    redisUnavailableUntil = Date.now() + REDIS_OUTAGE_BACKOFF_MS;

    if (lastRedisOutageSignature !== signature) {
        lastRedisOutageSignature = signature;
        logger.warn({
            action: 'redis.circuit_open',
            failedAction: action,
            retryAt: new Date(redisUnavailableUntil).toISOString(),
            error: message,
            ...metadata,
        });
    }
}

function handleRedisError(action: string, error: unknown, metadata: Record<string, unknown> = {}): void {
    if (isTransientRedisError(error)) {
        openRedisCircuit(action, error, metadata);
        return;
    }

    logger.warn({
        action,
        error: getRedisErrorMessage(error),
        ...metadata,
    });
}

function getRedisClient(): Redis | null {
    if (isRedisCircuitOpen()) {
        return null;
    }

    if (redisClientInstance) {
        return redisClientInstance;
    }

    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (isPlaceholderRedisConfig(url, token)) {
        if (!hasLoggedMissingConfig) {
            hasLoggedMissingConfig = true;
            logger.warn({
                action: 'redis.init',
                message: 'Upstash Redis is not configured with a live endpoint; cache-backed features are disabled.',
            });
        }

        return null;
    }

    redisClientInstance = new Redis({ url, token });
    return redisClientInstance;
}

export const redisClient = {
    async get<T = string>(key: string): Promise<T | null> {
        const client = getRedisClient();
        if (!client) return null;

        try {
            return await client.get<T>(key);
        } catch (error) {
            handleRedisError('redis.get.error', error, { key });
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
        } catch (error) {
            handleRedisError('redis.set.error', error, { key });
        }
    },

    async setnx(key: string, value: unknown): Promise<number> {
        const client = getRedisClient();
        if (!client) return 1;

        try {
            return await client.setnx(key, JSON.stringify(value));
        } catch (error) {
            handleRedisError('redis.setnx.error', error, { key });
            return 1;
        }
    },

    async del(key: string): Promise<void> {
        const client = getRedisClient();
        if (!client) return;

        try {
            await client.del(key);
        } catch (error) {
            handleRedisError('redis.del.error', error, { key });
        }
    },

    async incr(key: string): Promise<number> {
        const client = getRedisClient();
        if (!client) return 0;

        try {
            return await client.incr(key);
        } catch (error) {
            handleRedisError('redis.incr.error', error, { key });
            return 0;
        }
    },

    async expire(key: string, seconds: number): Promise<void> {
        const client = getRedisClient();
        if (!client) return;

        try {
            await client.expire(key, seconds);
        } catch (error) {
            handleRedisError('redis.expire.error', error, { key });
        }
    },

    async eval<T = unknown>(script: string, keys: string[], args: unknown[]): Promise<T | null> {
        const client = getRedisClient();
        if (!client) return null;

        try {
            return await client.eval(script, keys, args);
        } catch (error) {
            handleRedisError('redis.eval.error', error, { keyCount: keys.length });
            return null;
        }
    },

    async keys(pattern: string): Promise<string[]> {
        const client = getRedisClient();
        if (!client) return [];

        try {
            return await client.keys(pattern);
        } catch (error) {
            handleRedisError('redis.keys.error', error, { pattern });
            return [];
        }
    },

    isConfigured(): boolean {
        return Boolean(
            !isPlaceholderRedisConfig(process.env.UPSTASH_REDIS_REST_URL, process.env.UPSTASH_REDIS_REST_TOKEN) &&
            !isRedisCircuitOpen(),
        );
    },
};
