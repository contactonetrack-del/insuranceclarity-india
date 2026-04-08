import { redisClient } from '@/lib/cache/redis';
import { logger } from '@/lib/logger';
import { isRuntimeAnalyticsDisabled } from '@/lib/runtime-flags';

export type FunnelStep = 'signup' | 'scan' | 'pay' | 'retain';

const FUNNEL_TTL_SECONDS = 60 * 60 * 24 * 120; // 120 days

function formatDay(date: Date): string {
    return date.toISOString().slice(0, 10);
}

export async function trackFunnelStep(step: FunnelStep, context?: {
    userId?: string | null;
    scanId?: string | null;
    paymentId?: string | null;
}): Promise<void> {
    if (isRuntimeAnalyticsDisabled()) {
        return;
    }

    const day = formatDay(new Date());
    const key = `funnel:${day}:${step}`;

    try {
        if (redisClient.isConfigured()) {
            const next = await redisClient.incr(key);
            if (next === 1) {
                await redisClient.expire(key, FUNNEL_TTL_SECONDS);
            }
        }

        logger.info({
            action: 'funnel.step',
            step,
            day,
            userId: context?.userId ?? null,
            scanId: context?.scanId ?? null,
            paymentId: context?.paymentId ?? null,
        });
    } catch (error) {
        logger.warn({
            action: 'funnel.step.error',
            step,
            error: error instanceof Error ? error.message : String(error),
        });
    }
}

export async function getFunnelSummary(days = 30): Promise<Array<{
    day: string;
    signup: number;
    scan: number;
    pay: number;
    retain: number;
}>> {
    const rows: Array<{ day: string; signup: number; scan: number; pay: number; retain: number }> = [];

    for (let offset = days - 1; offset >= 0; offset -= 1) {
        const d = new Date();
        d.setDate(d.getDate() - offset);
        const day = formatDay(d);

        const [signup, scan, pay, retain] = await Promise.all([
            redisClient.get<number | string>(`funnel:${day}:signup`),
            redisClient.get<number | string>(`funnel:${day}:scan`),
            redisClient.get<number | string>(`funnel:${day}:pay`),
            redisClient.get<number | string>(`funnel:${day}:retain`),
        ]);

        rows.push({
            day,
            signup: Number(signup ?? 0),
            scan: Number(scan ?? 0),
            pay: Number(pay ?? 0),
            retain: Number(retain ?? 0),
        });
    }

    return rows;
}
