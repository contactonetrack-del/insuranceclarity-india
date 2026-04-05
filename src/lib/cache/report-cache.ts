/**
 * Report Cache — PDF Analysis Deduplication Layer
 *
 * Caches AI analysis results keyed by SHA-256 file hash.
 * This prevents re-analyzing the same PDF document (e.g., the same Star Health
 * policy uploaded by 500 different users), saving both Gemini API cost and latency.
 *
 * Cache strategy:
 *   Key      : report:v1:<sha256_file_hash>
 *   TTL      : 7 days (insurance policies don't change between annual renewals)
 *   Backend  : Upstash Redis (HTTP-based, serverless-safe)
 *   Fallback : If Redis is unavailable, falls back to DB lookup (always works)
 *
 * Cost impact at scale (estimated):
 *   - Gemini 2.0 Flash: ~$0.03 per analysis (1K tokens in/out)
 *   - With 60% cache hit rate on 2,000 scans/day → saves ~$36/day (~$1,000/mo)
 */

import { redisClient } from '@/lib/cache/redis';
import { logger }      from '@/lib/logger';

const REPORT_CACHE_VERSION = 'v1';
const REPORT_TTL_SECONDS   = 60 * 60 * 24 * 7; // 7 days

// ─── Key Builder ──────────────────────────────────────────────────────────────

function buildCacheKey(fileHash: string): string {
    return `report:${REPORT_CACHE_VERSION}:${fileHash}`;
}

// ─── Cache API ────────────────────────────────────────────────────────────────

/**
 * Look up a cached analysis result by file hash.
 * Returns null on cache miss OR if Redis is not configured.
 */
export async function getCachedAnalysis<T = unknown>(fileHash: string): Promise<T | null> {
    if (!redisClient.isConfigured()) return null;

    const key = buildCacheKey(fileHash);

    try {
        const cached = await redisClient.get<T>(key);

        if (cached !== null) {
            logger.info({
                action  : 'reportCache.hit',
                fileHash: fileHash.slice(0, 12) + '…',
                key,
            });
        }

        return cached;
    } catch (err) {
        // Cache misses are non-fatal — fall through to full AI analysis
        logger.warn({
            action  : 'reportCache.get.error',
            fileHash: fileHash.slice(0, 12) + '…',
            error   : String(err),
        });
        return null;
    }
}

/**
 * Store an analysis result in the cache after a successful AI analysis.
 * Silently no-ops if Redis is not configured.
 */
export async function cacheAnalysis<T = unknown>(fileHash: string, data: T): Promise<void> {
    if (!redisClient.isConfigured()) return;

    const key = buildCacheKey(fileHash);

    try {
        await redisClient.set(key, data, { ex: REPORT_TTL_SECONDS });

        logger.info({
            action  : 'reportCache.set',
            fileHash: fileHash.slice(0, 12) + '…',
            ttlDays : REPORT_TTL_SECONDS / 86400,
        });
    } catch (err) {
        // Caching failures are non-fatal — the report is saved to DB regardless
        logger.warn({
            action  : 'reportCache.set.error',
            fileHash: fileHash.slice(0, 12) + '…',
            error   : String(err),
        });
    }
}

/**
 * Invalidate a cached report (e.g., if the user requests a re-analysis).
 */
export async function invalidateCachedAnalysis(fileHash: string): Promise<void> {
    if (!redisClient.isConfigured()) return;

    const key = buildCacheKey(fileHash);
    await redisClient.del(key).catch(() => { /* non-fatal */ });

    logger.info({
        action  : 'reportCache.invalidate',
        fileHash: fileHash.slice(0, 12) + '…',
    });
}
