import { NextResponse } from 'next/server';
import { queueQuoteProcessing } from '@/lib/queue/client';
import { enforceRole } from '@/lib/auth/session';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const quoteSchema = z.object({
    quoteId: z.string().min(1, 'Quote ID is required').max(256, 'Quote ID is too long'),
});


export async function POST(request: Request) {
    try {
        // Ensure only logged in Users can ask for a quote to prevent queue spam
        await enforceRole('USER');

        const jsonBody = await request.json();

        // Zod Payload Validation
        const parsed = quoteSchema.safeParse(jsonBody);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid payload format', details: parsed.error.format() }, { status: 400 });
        }

        const { quoteId } = parsed.data;

        // Add task to Redis-backed BullMQ Queue
        const job = await queueQuoteProcessing(quoteId);

        return NextResponse.json({
            message: 'Quote processing started successfully',
            jobId: job.id
        });
    } catch (error: unknown) {
        let msg = '';
        if (error instanceof Error) msg = error.message;

        if (msg.includes('Unauthorized') || msg.includes('Forbidden')) {
            return NextResponse.json({ error: msg }, { status: 403 });
        }
        console.error('Quote API Error:', error);
        return NextResponse.json({ error: 'Failed to process quote' }, { status: 500 });
    }
}
