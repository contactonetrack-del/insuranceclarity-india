import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth';
import { GoogleGenerativeAI } from '@google/generative-ai'

import { logger } from '@/lib/logger'
import { enforceAiRateLimit } from '@/lib/security/ai-rate-limit'
import { validateCsrfRequest } from '@/lib/security/csrf'
import { formatRegulatoryContext, retrieveRegulatoryContext } from '@/services/regulatory-rag.service'
import { ErrorFactory } from '@/lib/api/error-response'
import { z } from 'zod'

const comparePayloadSchema = z.object({
    policies: z.array(z.record(z.string(), z.unknown())).min(2, 'At least two policies are required for comparison.'),
})

function stripJsonCodeFence(raw: string): string {
    const trimmed = raw.trim()
    if (!trimmed.startsWith('```')) return trimmed

    return trimmed
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/```$/, '')
        .trim()
}

function getClientIp(request: NextRequest): string | null {
    const forwarded = request.headers.get('x-forwarded-for')
    if (forwarded) {
        const first = forwarded.split(',')[0]?.trim()
        if (first) return first
    }

    const realIp = request.headers.get('x-real-ip')?.trim()
    return realIp || null
}

export async function POST(req: NextRequest) {
    try {
        const csrfError = validateCsrfRequest(req)
        if (csrfError) return csrfError

        const session = await auth()
        const userId = (session?.user as { id?: string } | undefined)?.id ?? null
        const ipAddress = getClientIp(req)

        const aiRateLimit = await enforceAiRateLimit({
            scope: 'policy-compare',
            limit: userId ? 12 : 5,
            windowSeconds: 60,
            userId,
            ipAddress,
        })

        if (!aiRateLimit.allowed) {
            return ErrorFactory.rateLimitExceeded('Too many comparison requests. Please wait before trying again.', {
                retryAfterSeconds: aiRateLimit.retryAfterSeconds,
            });
        }

        const parsed = comparePayloadSchema.safeParse(await req.json())
        if (!parsed.success) {
            return ErrorFactory.validationError('At least two policies are required for comparison.');
        }
        const { policies } = parsed.data

        const geminiApiKey = process.env.GEMINI_API_KEY?.trim()
        if (!geminiApiKey) {
            return ErrorFactory.serviceUnavailable('Gemini API key is not configured.');
        }

        const geminiModelName = process.env.GEMINI_COMPARE_MODEL ?? 'gemini-2.0-flash'

        const SYSTEM_PROMPT = `You are an expert insurance consultant from InsuranceClarity.
Your task is to provide a "Clarity Verdict" for a user comparing multiple insurance policies.
Analyze the policies based on:
1. Premium vs. Coverage Value
2. Claim Settlement Ratio (CSR) reliability
3. Hidden traps (Room rent, waiting periods)
4. Overall "Peace of Mind" factor.

Return a structured JSON response with:
- "winnerId": The ID of the policy you recommend most.
- "verdict": A 2-3 sentence summary recommendation.
- "pros": Top 3 collective strengths of the winner.
- "bestFor": A simple label for who should buy this (e.g. "Best for Senior Citizens").
- "ranking": An array of policy IDs in recommended order.

Policies to analyze:
${JSON.stringify(policies, null, 2)}
`

        const gemini = new GoogleGenerativeAI(geminiApiKey)
        const model = gemini.getGenerativeModel({
            model: geminiModelName,
            generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 1000,
                responseMimeType: 'application/json',
            },
        })

        const ragContext = formatRegulatoryContext(
            retrieveRegulatoryContext(JSON.stringify(policies), 3),
        )
        const prompt = `${SYSTEM_PROMPT}\n\n${ragContext}\n\nProvide the Clarity Verdict for these policies.`
        const response = await model.generateContent(prompt)
        const content = stripJsonCodeFence(response.response.text()?.trim() || '{}')
        const analyzed = JSON.parse(content)

        return NextResponse.json(analyzed)

    } catch (error) {
        logger.error({ action: 'api.ai.compare.error', error })
        return ErrorFactory.internalServerError('Failed to generate comparison insight');
    }
}
