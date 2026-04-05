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
import { z }                         from 'zod';

const createSchema = z.object({
    plan: z.enum(['PRO', 'ENTERPRISE']),
});

export async function POST(request: NextRequest) {
    try {
        // CSRF protection
        const csrfError = validateCsrfRequest(request);
        if (csrfError) return csrfError;

        // Auth required for subscriptions
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
        }

        const userId    = (session.user as { id?: string }).id;
        const userEmail = session.user.email;
        const userName  = session.user.name ?? 'there';

        if (!userId || !userEmail) {
            return NextResponse.json({ error: 'Invalid session.' }, { status: 401 });
        }

        // Validate body
        const body   = await request.json() as unknown;
        const parsed = createSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid plan. Choose PRO or ENTERPRISE.' },
                { status: 400 },
            );
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
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
