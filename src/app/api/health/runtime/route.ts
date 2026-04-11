import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { redisClient } from '@/lib/cache/redis';
import { getPublicAppUrl, getQueueProvider } from '@/lib/queue/config';
import { getGeminiApiKey } from '@/lib/security/env';
import { pingDatabase } from '@/services/ops.service';

export const dynamic = 'force-dynamic';

type CriticalCheckName = 'database' | 'queue' | 'ai';
type WarningCheckName = 'redis';

function getQueueProviderSafe(): string {
    try {
        return getQueueProvider();
    } catch {
        return 'unknown';
    }
}

async function checkDatabase() {
    try {
        await pingDatabase();
        return {
            healthy: true,
            message: 'Database reachable.',
        };
    } catch (error) {
        return {
            healthy: false,
            message: error instanceof Error ? error.message : String(error),
        };
    }
}

function checkRedis() {
    return {
        healthy: redisClient.isConfigured(),
        message: redisClient.isConfigured()
            ? 'Redis configured.'
            : 'Redis unavailable or not configured with a live endpoint.',
    };
}

function checkQueue() {
    try {
        const provider = getQueueProvider();
        return {
            healthy: true,
            provider,
            publicAppUrl: getPublicAppUrl(),
            message: 'Queue configuration valid.',
        };
    } catch (error) {
        return {
            healthy: false,
            provider: getQueueProviderSafe(),
            message: error instanceof Error ? error.message : String(error),
        };
    }
}

function checkAi() {
    try {
        getGeminiApiKey();
        return {
            healthy: true,
            provider: 'gemini',
            message: 'Gemini API key configured.',
        };
    } catch (error) {
        return {
            healthy: false,
            provider: 'gemini',
            message: error instanceof Error ? error.message : String(error),
        };
    }
}

export async function GET() {
    const [database, redis] = await Promise.all([
        checkDatabase(),
        Promise.resolve(checkRedis()),
    ]);
    const queue = checkQueue();
    const ai = checkAi();

    const degradedChecks: CriticalCheckName[] = [
        !database.healthy ? 'database' : null,
        !queue.healthy ? 'queue' : null,
        !ai.healthy ? 'ai' : null,
    ].filter((value): value is CriticalCheckName => value !== null);
    const warningChecks: WarningCheckName[] = !redis.healthy ? ['redis'] : [];
    const healthy = degradedChecks.length === 0;

    if (!healthy) {
        logger.error({
            action: 'health.runtime.degraded',
            degradedChecks,
            warningChecks,
            database,
            redis,
            queue,
            ai,
        });
    }

    return NextResponse.json(
        {
            healthy,
            service: 'runtime-dependencies',
            status: healthy ? 'HEALTHY' : 'DEGRADED',
            timestamp: new Date().toISOString(),
            degradedChecks,
            warningChecks,
            checks: {
                database,
                redis,
                queue,
                ai,
            },
        },
        { status: healthy ? 200 : 503 },
    );
}
