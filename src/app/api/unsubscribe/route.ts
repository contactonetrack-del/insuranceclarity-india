import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import {
    suppressEmail,
    removeNewsletterSubscription,
    removeScanNotifyRequests,
} from '@/lib/email/suppression';

const unsubscribeSchema = z.object({
    email: z.string().email('Please enter a valid email address.'),
    reason: z.string().max(300).optional(),
    source: z.string().max(50).optional(),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json() as unknown;
        const parsed = unsubscribeSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid payload.' },
                { status: 400 },
            );
        }

        const email = parsed.data.email.trim().toLowerCase();
        await Promise.all([
            suppressEmail({
                email,
                reason: parsed.data.reason,
                source: parsed.data.source ?? 'EMAIL',
            }),
            removeNewsletterSubscription(email),
            removeScanNotifyRequests(email),
        ]);

        logger.info({
            action: 'email.unsubscribe.success',
            email,
            source: parsed.data.source ?? 'EMAIL',
        });

        return NextResponse.json({
            success: true,
            message: 'You have been unsubscribed successfully.',
        });
    } catch (error) {
        logger.error({
            action: 'email.unsubscribe.error',
            error: error instanceof Error ? error.message : String(error),
        });
        return NextResponse.json(
            { success: false, error: 'Unsubscribe request failed. Please try again.' },
            { status: 500 },
        );
    }
}
