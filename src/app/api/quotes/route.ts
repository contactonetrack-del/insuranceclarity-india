import { NextRequest, NextResponse } from 'next/server';
import { queue } from '@/lib/queue/jobs';
import { enforceRole } from '@/lib/auth/session';
import { logger } from '@/lib/logger';
import { validateCsrfRequest } from '@/lib/security/csrf';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const quoteSchema = z.object({
    quoteId: z.string().min(1, 'Quote ID is required').max(256, 'Quote ID is too long'),
});

export async function POST(request: NextRequest) {
    try {
        // CSRF Protection
        const csrfError = validateCsrfRequest(request);
        if (csrfError) return csrfError;

        // Ensure only logged-in users can trigger quote processing
        await enforceRole('USER');

        const jsonBody = await request.json();

        const parsed = quoteSchema.safeParse(jsonBody);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid payload format', details: parsed.error.format() }, { status: 400 });
        }

        const { quoteId } = parsed.data;

        const jobId = await queue.dispatch('GENERATE_QUOTE_DOCUMENT', { quoteId, templateId: 'TERM_LIFE' });
        const job = { id: jobId };

        logger.info({ action: 'quote.enqueued', quoteId, jobId: job.id });

        return NextResponse.json({
            message: 'Quote processing started successfully',
            jobId: job.id,
        });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);

        if (msg.includes('Unauthorized') || msg.includes('Forbidden')) {
            return NextResponse.json({ error: msg }, { status: 403 });
        }

        logger.error({ action: 'quote.error', error: msg });
        return NextResponse.json({ error: 'Failed to process quote' }, { status: 500 });
    }
}
