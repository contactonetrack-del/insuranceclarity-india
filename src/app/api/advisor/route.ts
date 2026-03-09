import { NextResponse } from 'next/server'
import { INTENTS, FALLBACKS } from '@/config/advisor-intents'
import { z } from 'zod';

const advisorSchema = z.object({
    message: z.string().min(1, 'Message is required').max(1000, 'Message is too long')
});

// ─── Smart Intent Resolver ─────────────────────────────────────────────────
function resolveIntent(input: string): typeof INTENTS[0] | null {
    const lower = input.toLowerCase().trim()

    // Score-based matching: count how many keywords match, pick highest score
    let bestMatch: typeof INTENTS[0] | null = null
    let bestScore = 0

    for (const intent of INTENTS) {
        let score = 0
        for (const keyword of intent.keywords) {
            if (lower.includes(keyword)) {
                // Longer keyword = more specific = higher score
                score += keyword.length
            }
        }
        if (score > bestScore) {
            bestScore = score
            bestMatch = intent
        }
    }

    // Minimum score threshold — avoid spurious matches on single letters
    return bestScore >= 2 ? bestMatch : null
}

export async function POST(req: Request) {
    try {
        const jsonBody = await req.json()

        const parsed = advisorSchema.safeParse(jsonBody);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid message payload', details: parsed.error.format() }, { status: 400 })
        }

        const { message } = parsed.data;

        const intent = resolveIntent(message)

        if (intent) {
            return NextResponse.json({
                response: intent.response,
                actions: intent.actions || [],
                intentFound: true
            })
        } else {
            // Pick a random fallback — Math.random() is correct in serverless;
            // a module-level counter would reset on cold start and shared state is unreliable.
            const fb = FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)]
            return NextResponse.json({
                response: fb.text,
                actions: fb.actions || [],
                intentFound: false
            })
        }

    } catch (e) {
        // TODO: Replace with structured pino logger when LOG_LEVEL is configured
        console.error('[advisor] Failed to process message:', e)
        return NextResponse.json({ error: 'Failed to process message' }, { status: 500 })
    }
}
