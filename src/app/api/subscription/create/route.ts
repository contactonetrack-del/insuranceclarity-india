/**
 * POST /api/subscription/create
 *
 * Creates a Razorpay subscription for the authenticated user.
 * Returns subscription details including a hosted payment URL.
 *
 * Security: Requires authentication + CSRF validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

import { logger }                    from '@/lib/logger';
import { validateCsrfRequest }       from '@/lib/security/csrf';
import { createRazorpaySubscription } from '@/services/subscription.service';
import { ErrorFactory }              from '@/lib/api/error-response';
import { SUBSCRIPTION_PLANS }        from '@/lib/domain/enums';
import { z }                         from 'zod';

const createSchema = z.object({
    plan: z.enum(SUBSCRIPTION_PLANS),
});

export async function POST(request: NextRequest) {
    try {
        // CSRF protection
        const csrfError = validateCsrfRequest(request);
        if (csrfError) return csrfError;

        // Auth required for subscriptions
        const session = await auth();
        if (!session?.user) {
            return ErrorFactory.unauthorized('Authentication required.');
        }

        const userId    = (session.user as { id?: string }).id;
        const userEmail = session.user.email;
        const userName  = session.user.name ?? 'there';

        if (!userId || !userEmail) {
            return ErrorFactory.unauthorized('Invalid session.');
        }

        // Validate body
        const body   = await request.json() as unknown;
        const parsed = createSchema.safeParse(body);
        if (!parsed.success) {
            return ErrorFactory.validationError('Invalid plan. Choose PRO or ENTERPRISE.');
        }

        const { plan } = parsed.data;

        // Create subscription
        const details = await createRazorpaySubscription({
            userId,
            plan,
            userEmail,
            userName,
        });

        logger.info({ action: 'subscription.create.api', userId, plan });

        return NextResponse.json({
            subscriptionId: details.subscriptionId,
            shortUrl:       details.shortUrl,
            status:         details.status,
        });

    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create subscription';
        logger.error({ action: 'subscription.create.error', error: message });
        return ErrorFactory.internalServerError(message);
    }
}
