/**
 * AI Service - Insurance Policy Analysis Engine
 *
 * Provider strategy:
 * 1) Gemini (primary)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '@/lib/logger';
import type { GptAnalysisResponse } from '@/types/report.types';
import { formatRegulatoryContext, retrieveRegulatoryContext } from '@/services/regulatory-rag.service';

const GEMINI_MODEL = process.env.GEMINI_ANALYSIS_MODEL ?? 'gemini-2.0-flash';
const MAX_TEXT_CHARS = 24_000; // ~6,000 tokens

const SYSTEM_PROMPT = `You are an expert insurance analyst specializing in Indian insurance policies (IRDAI regulated).

Your task is to analyze the provided insurance policy text and identify:
1. HIDDEN RISKS - clauses that could result in claim rejection or reduced payout
2. EXCLUSIONS - conditions, treatments, or events NOT covered
3. SUGGESTIONS - actionable improvements the policyholder should seek
4. HIDDEN CLAUSES - fine print that insurers don't prominently advertise
5. SCORE - overall policy transparency score (0-100, higher = more transparent/policyholder-friendly)

SCORING GUIDE:
- 80-100: Excellent - transparent, policyholder-friendly, few hidden traps
- 60-79: Good - some concerns but manageable
- 40-59: Average - notable risks that could affect claims
- 20-39: Poor - multiple red flags, likely claim traps
- 0-19: Very Poor - highly restrictive, avoid or renegotiate

INDIA-SPECIFIC FOCUS:
- Room rent sub-limits (VERY common trap in Indian health policies)
- Pre-existing disease exclusions (typically 2-4 year waiting period)
- Proportionate deductions
- Disease-specific sub-limits (e.g., cataract limits, maternity limits)
- Network hospital restrictions
- Co-payment clauses
- IRDAI claim settlement ratio implications
- Sum insured restoration limits

Return ONLY valid JSON. Do not include markdown, explanation, or any text outside the JSON.

JSON Format:
{
  "score": <number 0-100>,
  "summary": "<2-3 sentence summary of the policy's key characteristics and main concerns>",
  "risks": [
    {
      "title": "<short risk title>",
      "severity": "<HIGH|MEDIUM|LOW>",
      "description": "<clear explanation of the risk and how it could affect the policyholder>"
    }
  ],
  "exclusions": [
    {
      "clause": "<exact or paraphrased exclusion clause>",
      "impact": "<practical impact on the policyholder>"
    }
  ],
  "suggestions": [
    {
      "action": "<specific actionable recommendation>",
      "priority": "<HIGH|MEDIUM|LOW>"
    }
  ],
  "hiddenClauses": [
    {
      "clause": "<the hidden or obscure clause>",
      "risk": "<why this clause is problematic>"
    }
  ]
}`;

export interface AnalysisInput {
    policyText: string;
    fileName?: string;
}

export interface AnalysisResult {
    report: GptAnalysisResponse;
    tokensUsed: number;
    processingMs: number;
}

function truncatePolicyText(text: string): string {
    if (text.length <= MAX_TEXT_CHARS) {
        return text;
    }

    const half = Math.floor(MAX_TEXT_CHARS / 2);
    return `${text.slice(0, half)}\n\n[...middle sections omitted for analysis...]\n\n${text.slice(-half)}`;
}

function buildUserPrompt(input: AnalysisInput, policyText: string): string {
    return `Please analyze this insurance policy document:\n\nFile: ${input.fileName ?? 'Policy Document'}\n\n---\n\n${policyText}`;
}

function stripJsonCodeFence(raw: string): string {
    const trimmed = raw.trim();
    if (!trimmed.startsWith('```')) {
        return trimmed;
    }

    return trimmed
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/```$/, '')
        .trim();
}

async function analyzeWithGemini(input: AnalysisInput): Promise<AnalysisResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured.');
    }

    const startTime = Date.now();
    const policyText = truncatePolicyText(input.policyText);
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: GEMINI_MODEL,
        generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 3000,
            responseMimeType: 'application/json',
        },
    });

    const ragContext = formatRegulatoryContext(
        retrieveRegulatoryContext(`${input.fileName ?? ''}\n${policyText.slice(0, 6000)}`, 4),
    );
    const fullPrompt = `${SYSTEM_PROMPT}\n\n${ragContext}\n\n${buildUserPrompt(input, policyText)}`;
    const response = await model.generateContent(fullPrompt);
    const geminiResponse = response.response;
    const rawContent = stripJsonCodeFence(geminiResponse.text() ?? '{}');
    const parsed = parseGptResponse(rawContent);
    const usageMetadata = (geminiResponse as { usageMetadata?: { totalTokenCount?: number } }).usageMetadata;
    const tokensUsed = usageMetadata?.totalTokenCount ?? 0;
    const processingMs = Date.now() - startTime;

    logger.info({
        action: 'ai.analyze.complete',
        provider: 'gemini',
        model: GEMINI_MODEL,
        score: parsed.score,
        risksCount: parsed.risks.length,
        exclusionsCount: parsed.exclusions.length,
        tokensUsed,
        processingMs,
    });

    return {
        report: { ...parsed, rawText: rawContent },
        tokensUsed,
        processingMs,
    };
}

/**
 * Analyze policy text with Gemini.
 * Function name kept for backwards compatibility with existing callers.
 */
export async function analyzePolicyWithGpt(input: AnalysisInput): Promise<AnalysisResult> {
    logger.info({
        action: 'ai.analyze.start',
        fileName: input.fileName ?? 'unknown',
        textLength: input.policyText.length,
        model: GEMINI_MODEL,
    });

    try {
        return await analyzeWithGemini(input);
    } catch (error) {
        logger.error({
            action: 'ai.analyze.error',
            error: error instanceof Error ? error.message : String(error),
        });
        throw new Error('AI analysis failed. Please try again or use a different PDF.');
    }
}

function parseGptResponse(rawContent: string): GptAnalysisResponse {
    let parsed: Partial<GptAnalysisResponse>;

    try {
        parsed = JSON.parse(rawContent);
    } catch {
        throw new Error('AI returned malformed JSON. Analysis failed.');
    }

    const score = typeof parsed.score === 'number'
        ? Math.max(0, Math.min(100, Math.round(parsed.score)))
        : 50;

    const summary = typeof parsed.summary === 'string' && parsed.summary.length > 10
        ? parsed.summary
        : 'Policy analysis complete. Review the risks and exclusions below.';

    const risks = Array.isArray(parsed.risks)
        ? parsed.risks.filter(isValidRisk).slice(0, 10)
        : [];

    const exclusions = Array.isArray(parsed.exclusions)
        ? parsed.exclusions.filter(isValidExclusion).slice(0, 10)
        : [];

    const suggestions = Array.isArray(parsed.suggestions)
        ? parsed.suggestions.filter(isValidSuggestion).slice(0, 8)
        : [];

    const hiddenClauses = Array.isArray(parsed.hiddenClauses)
        ? parsed.hiddenClauses.filter(isValidHiddenClause).slice(0, 8)
        : [];

    return { score, summary, risks, exclusions, suggestions, hiddenClauses };
}

function isValidRisk(r: unknown): r is { title: string; severity: string; description: string } {
    return typeof r === 'object' && r !== null &&
        typeof (r as Record<string, unknown>).title === 'string' &&
        typeof (r as Record<string, unknown>).description === 'string';
}

function isValidExclusion(e: unknown): e is { clause: string; impact: string } {
    return typeof e === 'object' && e !== null &&
        typeof (e as Record<string, unknown>).clause === 'string' &&
        typeof (e as Record<string, unknown>).impact === 'string';
}

function isValidSuggestion(s: unknown): s is { action: string; priority: string } {
    return typeof s === 'object' && s !== null &&
        typeof (s as Record<string, unknown>).action === 'string';
}

function isValidHiddenClause(h: unknown): h is { clause: string; risk: string } {
    return typeof h === 'object' && h !== null &&
        typeof (h as Record<string, unknown>).clause === 'string' &&
        typeof (h as Record<string, unknown>).risk === 'string';
}
