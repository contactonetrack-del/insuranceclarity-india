/**
 * GET /api/health/plans
 *
 * Health check endpoint that verifies subscription plan configuration
 * is valid and properly configured at runtime.
 *
 * Phase 11 Week 2: Implements response caching for improved performance.
 *
 * Returns: { healthy: boolean, plans: {...}, issues: string[] }
 */

import { NextResponse } from 'next/server';
import { validateSubscriptionPlans } from '@/lib/subscriptions/plan-validation';
import { logger } from '@/lib/logger';
import { getCachedResponse, cacheResponse } from '@/lib/cache/response-cache';

function formatPlanPreview(value: string | undefined): string {
    const trimmed = value?.trim();
    if (!trimmed) return 'NOT_SET';
    return `${trimmed.substring(0, 15)}...`;
}

export async function GET() {
    try {
        // Phase 11 Week 2: Try to get cached response first
        const cacheKey = '/api/health/plans';
        const cachedResult = await getCachedResponse(cacheKey);

        if (cachedResult) {
            logger.info({
                action: 'health.plans.cache_hit',
                cacheKey,
            });

            return NextResponse.json(cachedResult, {
                headers: {
                    'X-Cache-Status': 'HIT',
                    'Cache-Control': 'public, max-age=60, s-maxage=300',
                },
            });
        }

        // Cache miss - perform validation
        const validationResult = await validateSubscriptionPlans();

        // Extract plan prefixes for display
        const plans = {
            pro: formatPlanPreview(process.env.RAZORPAY_PLAN_ID_PRO),
            enterprise: formatPlanPreview(process.env.RAZORPAY_PLAN_ID_ENTERPRISE),
            mode: process.env.RAZORPAY_MODE || 'test',
        };

        const healthy = validationResult.valid && validationResult.issues.length === 0;

        const responseData = {
            healthy,
            service: 'subscription-plans',
            timestamp: new Date().toISOString(),
            plans,
            validation: {
                valid: validationResult.valid,
                issues: validationResult.issues,
                warnings: validationResult.warnings,
            },
            status: healthy ? 'HEALTHY' : 'DEGRADED',
        };

        logger.info({
            action: 'health.plans.cache_miss',
            healthy,
            issuesCount: validationResult.issues.length,
            warningsCount: validationResult.warnings.length,
        });

        // Phase 11 Week 2: Cache the response for 1 minute
        await cacheResponse(cacheKey, {}, responseData, 60);

        return NextResponse.json(responseData, {
            status: healthy ? 200 : 503,
            headers: {
                'X-Cache-Status': 'MISS',
                'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=3600',
            },
        });
    } catch (error) {
        logger.error({
            action: 'health.plans.error',
            error: error instanceof Error ? error.message : String(error),
        });

        return NextResponse.json(
            {
                healthy: false,
                service: 'subscription-plans',
                status: 'ERROR',
                message: 'Failed to validate subscription plan configuration',
            },
            { status: 500 }
        );
    }
}
