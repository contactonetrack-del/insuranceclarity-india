import { Redis } from 'ioredis';

const globalForRedis = global as unknown as { redis: Redis };

export const redis =
    globalForRedis.redis ||
    new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
        maxRetriesPerRequest: 3,
    });

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

/**
 * Helper to fetch data from cache, or execute a function to get fresh data,
 * saving it to the cache before returning.
 * 
 * @param key Unique cache key
 * @param ttlSeconds Time-to-live in seconds
 * @param fetchData Function to execute if cache miss
 * @returns The cached or freshly fetched data
 */
export async function getOrSetCache<T>(
    key: string,
    ttlSeconds: number,
    fetchData: () => Promise<T>
): Promise<T> {
    try {
        const cached = await redis.get(key);
        if (cached) {
            return JSON.parse(cached) as T;
        }
    } catch (error) {
        console.warn(`Redis Cache GET failed for key: ${key}`, error);
        // On failure, fall through to fetch fresh data to ensure availability
    }

    const freshData = await fetchData();

    if (freshData !== undefined && freshData !== null) {
        try {
            await redis.setex(key, ttlSeconds, JSON.stringify(freshData));
        } catch (error) {
            console.warn(`Redis Cache SET failed for key: ${key}`, error);
        }
    }

    return freshData;
}
