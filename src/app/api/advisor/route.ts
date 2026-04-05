/**
 * POST /api/advisor
 *
 * AI-powered insurance advisor endpoint.
 * Uses Gemini with structured JSON output for intent resolution.
 * Falls back to keyword matching, then static responses.
 *
 * Security: CSRF protected
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { INTENTS, FALLBACKS } from '@/config/advisor-intents';

import { logger } from '@/lib/logger';
import { validateCsrfRequest } from '@/lib/security/csrf';
import { enforceAiRateLimit } from '@/lib/security/ai-rate-limit';
import { formatRegulatoryContext, retrieveRegulatoryContext } from '@/services/regulatory-rag.service';
import { z } from 'zod';

const advisorSchema = z.object({
    message: z.string().min(1, 'Message is required').max(1000, 'Message is too long'),
});

function getClientIp(request: NextRequest): string | null {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        const first = forwarded.split(',')[0]?.trim();
        if (first) return first;
    }

    const realIp = request.headers.get('x-real-ip')?.trim();
    return realIp || null;
}

function stripJsonCodeFence(raw: string): string {
    const trimmed = raw.trim();
    if (!trimmed.startsWith('```')) return trimmed;

    return trimmed
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/```$/, '')
        .trim();
}

// Keyword Intent Resolver (Fallback)
function resolveIntentByKeyword(input: string): typeof INTENTS[0] | null {
    const lower = input.toLowerCase().trim();

    let bestMatch: typeof INTENTS[0] | null = null;
    let bestScore = 0;

    for (const intent of INTENTS) {
        let score = 0;
        for (const keyword of intent.keywords) {
            if (lower.includes(keyword)) {
                score += keyword.length;
            }
        }
        if (score > bestScore) {
            bestScore = score;
            bestMatch = intent;
        }
    }

    return bestScore >= 2 ? bestMatch : null;
}

interface AdvisorAiResponse {
    intent: string;
    insurance_type: string;
    response: string;
    actions: Array<{ label: string; href: string }>;
}

async function resolveIntentWithAi(message: string): Promise<AdvisorAiResponse | null> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    try {
        const modelName = process.env.GEMINI_ADVISOR_MODEL ?? 'gemini-2.0-flash';
        const systemPrompt = `You are an expert Indian insurance advisor for InsuranceClarity.in.
Your job is to understand what a user needs regarding insurance in India.

Respond with valid JSON ONLY in this exact schema:
{
  "intent": "one of: health_insurance | term_life | motor | home | travel | business | general_info | claim_help | comparison | calculator | hidden_facts | unknown",
  "insurance_type": "string describing the insurance type or empty string",
  "response": "a helpful, conversational 2-3 sentence answer in English addressing their specific question. Mention Indian insurance context (IRDAI, LIC, etc.) where relevant.",
  "actions": [{"label": "button label", "href": "relative URL like /tools/hidden-facts"}]
}

Available pages to link to:
- /insurance/health, /insurance/term-life, /insurance/motor, /insurance/home, /insurance/travel, /insurance/business
- /tools/hidden-facts, /tools/calculator, /tools/compare, /tools/ai-scanner, /tools/hlv-calculator
- /scan (for policy PDF scanning)`;

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 400,
                responseMimeType: 'application/json',
            },
        });

        const ragContext = formatRegulatoryContext(retrieveRegulatoryContext(message, 3));
        const prompt = `${systemPrompt}\n\n${ragContext}\n\nUser message: ${message}`;
        const response = await model.generateContent(prompt);
        const raw = stripJsonCodeFence(response.response.text() || '');
        if (!raw) return null;

        return JSON.parse(raw) as AdvisorAiResponse;
    } catch {
        return null;
    }
}

export async function POST(req: NextRequest) {
    try {
        const csrfError = validateCsrfRequest(req);
        if (csrfError) return csrfError;

        const jsonBody = await req.json();
        const parsed = advisorSchema.safeParse(jsonBody);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid message payload', details: parsed.error.format() }, { status: 400 });
        }

        const { message } = parsed.data;
        const session = await auth();
        const userId = (session?.user as { id?: string } | undefined)?.id ?? null;
        const ipAddress = getClientIp(req);

        const aiRateLimit = await enforceAiRateLimit({
            scope: 'advisor-chat',
            limit: userId ? 30 : 10,
            windowSeconds: 60,
            userId,
            ipAddress,
        });

        if (!aiRateLimit.allowed) {
            return NextResponse.json(
                {
                    error: 'Too many AI advisor requests. Please wait and try again.',
                    retryAfterSeconds: aiRateLimit.retryAfterSeconds,
                },
                { status: 429 },
            );
        }

        const aiResult = await resolveIntentWithAi(message);
        if (aiResult && aiResult.intent !== 'unknown') {
            return NextResponse.json({
                response: aiResult.response,
                actions: aiResult.actions || [],
                intentFound: true,
                source: 'ai',
            });
        }

        const keywordIntent = resolveIntentByKeyword(message);
        if (keywordIntent) {
            return NextResponse.json({
                response: keywordIntent.response,
                actions: keywordIntent.actions || [],
                intentFound: true,
                source: 'keyword',
            });
        }

        if (aiResult) {
            return NextResponse.json({
                response: aiResult.response,
                actions: aiResult.actions || [],
                intentFound: false,
                source: 'ai_fallback',
            });
        }

        const fb = FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
        return NextResponse.json({
            response: fb.text,
            actions: fb.actions || [],
            intentFound: false,
            source: 'static',
        });
    } catch (e) {
        logger.error({ action: 'advisor.error', error: e instanceof Error ? e.message : String(e) });
        return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
    }
}
