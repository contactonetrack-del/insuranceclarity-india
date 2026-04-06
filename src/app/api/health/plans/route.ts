/**
 * GET /api/health/plans
 * 
 * Health check endpoint that verifies subscription plan configuration
 * is valid and properly configured at runtime.
 * 
 * Returns: { healthy: boolean, plans: {...}, issues: string[] }
 */

import { NextResponse } from 'next/server';
import { validateSubscriptionPlans } from '@/lib/subscriptions/plan-validation';
import { logger } from '@/lib/logger';

export async function GET() {
    try {
        const validationResult = await validateSubscriptionPlans();

        // Extract plan prefixes for display
        const plans = {
            pro: process.env.RAZORPAY_PLAN_ID_PRO?.substring(0, 15) + '...' || 'NOT_SET',
            enterprise: process.env.RAZORPAY_PLAN_ID_ENTERPRISE?.substring(0, 15) + '...' || 'NOT_SET',
            mode: process.env.RAZORPAY_MODE || 'test',
        };

        const healthy = validationResult.valid && validationResult.issues.length === 0;

        logger.info({
            action: 'health.plans',
            healthy,
            issuesCount: validationResult.issues.length,
            warningsCount: validationResult.warnings.length,
        });

        return NextResponse.json(
            {
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
            },
            {
                status: healthy ? 200 : 503,
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                },
            }
        );
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
