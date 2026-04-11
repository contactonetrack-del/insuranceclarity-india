/**
 * AI Service - Insurance Policy Analysis Engine
 *
 * Provider strategy:
 * 1) Gemini (primary)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '@/lib/logger';
import { logBraintrustEvent } from '@/lib/braintrust';
import { getGeminiApiKey } from '@/lib/security/env';
import type { GptAnalysisResponse, ExclusionItem, HiddenClauseItem, RiskItem, SuggestionItem } from '@/types/report.types';
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

interface HeuristicSignal {
    pattern: RegExp;
    risk: RiskItem;
    exclusion?: ExclusionItem;
    suggestion?: SuggestionItem;
    hiddenClause?: HiddenClauseItem;
    scorePenalty: number;
}

const HEURISTIC_SIGNALS: HeuristicSignal[] = [
    {
        pattern: /\broom\s+rent\b|\bicu\s+rent\b|\bsub-?limit\b|\bproportionate deduction\b/i,
        risk: {
            title: 'Room-rent or sub-limit restriction',
            severity: 'HIGH',
            description: 'The policy text indicates room-rent or treatment sub-limits, which can trigger proportionate deductions and reduce claim payouts.',
        },
        suggestion: {
            action: 'Ask for a variant without room-rent sub-limits or proportionate deduction clauses.',
            priority: 'HIGH',
        },
        hiddenClause: {
            clause: 'Room-rent linked sub-limit',
            risk: 'Hospital bills can be reduced across multiple line items when the selected room exceeds the permitted cap.',
        },
        scorePenalty: 14,
    },
    {
        pattern: /\bpre[-\s]?existing\b|\bped\b|\bwaiting period\b/i,
        risk: {
            title: 'Pre-existing disease waiting period',
            severity: 'HIGH',
            description: 'The policy contains language around pre-existing disease exclusions or waiting periods, which can delay usable coverage for common claims.',
        },
        exclusion: {
            clause: 'Pre-existing disease waiting period',
            impact: 'Claims linked to declared or discoverable pre-existing illnesses may be rejected until the waiting period is completed.',
        },
        suggestion: {
            action: 'Compare plans with shorter waiting periods or clearer PED restoration terms.',
            priority: 'HIGH',
        },
        hiddenClause: {
            clause: 'Waiting-period language',
            risk: 'Coverage can look active on day one while major conditions remain effectively excluded for months or years.',
        },
        scorePenalty: 12,
    },
    {
        pattern: /\bco-?pay\b|\bco payment\b|\bco-insurance\b/i,
        risk: {
            title: 'Co-pay cost sharing',
            severity: 'MEDIUM',
            description: 'The policy appears to require the policyholder to pay a percentage of the claim amount, increasing out-of-pocket exposure at claim time.',
        },
        suggestion: {
            action: 'Prefer a no-co-pay variant unless the premium savings clearly justify the added claim-time cost.',
            priority: 'MEDIUM',
        },
        hiddenClause: {
            clause: 'Co-pay clause',
            risk: 'A fixed percentage deduction reduces every eligible claim amount and is easy to miss during purchase.',
        },
        scorePenalty: 9,
    },
    {
        pattern: /\bnetwork hospital\b|\bcashless\b|\bnon-network\b/i,
        risk: {
            title: 'Network dependency for smooth claims',
            severity: 'MEDIUM',
            description: 'The wording suggests claim convenience depends heavily on network hospitals or pre-authorized cashless processes.',
        },
        suggestion: {
            action: 'Verify the hospital network in your city and how non-network reimbursements are handled before buying.',
            priority: 'MEDIUM',
        },
        hiddenClause: {
            clause: 'Network hospital dependency',
            risk: 'Cashless treatment can be marketed prominently while reimbursement outside the network is slower or more restrictive.',
        },
        scorePenalty: 7,
    },
    {
        pattern: /\bmaternity\b|\bcataract\b|\bjoint replacement\b|\bdisease-specific\b/i,
        risk: {
            title: 'Disease-specific or treatment-specific cap',
            severity: 'MEDIUM',
            description: 'The policy likely applies narrower caps or waiting periods to specific procedures, reducing practical protection for common claims.',
        },
        exclusion: {
            clause: 'Procedure-specific sub-limit or waiting condition',
            impact: 'Even when hospitalization is covered, the insurer may cap payout for named treatments such as maternity, cataract, or similar procedures.',
        },
        suggestion: {
            action: 'Review treatment-wise caps carefully and compare against plans that use only the overall sum insured.',
            priority: 'MEDIUM',
        },
        scorePenalty: 8,
    },
    {
        pattern: /\bself-inflicted\b|\bsuicide\b|\balcohol\b|\bintoxication\b|\bdrug abuse\b/i,
        risk: {
            title: 'Behavior-linked exclusion language',
            severity: 'LOW',
            description: 'The policy contains standard behavior-linked exclusions that can still matter in claim disputes or accident scenarios.',
        },
        exclusion: {
            clause: 'Behavior-linked exclusion',
            impact: 'Claims associated with self-harm, intoxication, or similar excluded causes may be denied entirely.',
        },
        scorePenalty: 5,
    },
    {
        pattern: /\brestoration\b|\brestore\b|\breinstatement\b/i,
        risk: {
            title: 'Restoration benefit conditions',
            severity: 'LOW',
            description: 'The policy mentions restoration or reinstatement, which is helpful only if the trigger conditions and reuse rules are favorable.',
        },
        suggestion: {
            action: 'Check whether restoration can be used for the same illness and whether it works in the same policy year.',
            priority: 'LOW',
        },
        hiddenClause: {
            clause: 'Restoration conditions',
            risk: 'Restoration benefits often sound generous but can be limited to unrelated illnesses or later claims only.',
        },
        scorePenalty: 4,
    },
];

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

function dedupeBy<T>(items: T[], getKey: (item: T) => string): T[] {
    const seen = new Set<string>();
    return items.filter((item) => {
        const key = getKey(item).toLowerCase();
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}

function buildHeuristicReport(input: AnalysisInput, reason: string): AnalysisResult {
    const startTime = Date.now();
    const normalizedText = input.policyText.toLowerCase();
    const matchedSignals = HEURISTIC_SIGNALS.filter((signal) => signal.pattern.test(normalizedText));

    const risks = dedupeBy(
        matchedSignals.map((signal) => signal.risk),
        (risk) => `${risk.title}:${risk.description}`,
    ).slice(0, 8);

    const exclusions = dedupeBy(
        matchedSignals
            .map((signal) => signal.exclusion)
            .filter((item): item is ExclusionItem => Boolean(item)),
        (item) => `${item.clause}:${item.impact}`,
    ).slice(0, 8);

    const suggestions = dedupeBy(
        matchedSignals
            .map((signal) => signal.suggestion)
            .filter((item): item is SuggestionItem => Boolean(item)),
        (item) => `${item.action}:${item.priority}`,
    ).slice(0, 8);

    const hiddenClauses = dedupeBy(
        matchedSignals
            .map((signal) => signal.hiddenClause)
            .filter((item): item is HiddenClauseItem => Boolean(item)),
        (item) => `${item.clause}:${item.risk}`,
    ).slice(0, 8);

    if (risks.length === 0) {
        risks.push({
            title: 'Manual review recommended',
            severity: 'LOW',
            description: 'The fallback analyzer did not detect strong red-flag keywords. Review the full report manually before making a purchase decision.',
        });
    }

    if (suggestions.length === 0) {
        suggestions.push({
            action: 'Cross-check waiting periods, room-rent wording, and disease-specific caps before finalizing the policy.',
            priority: 'MEDIUM',
        });
    }

    const scorePenalty = matchedSignals.reduce((sum, signal) => sum + signal.scorePenalty, 0);
    const score = Math.max(32, Math.min(88, 82 - scorePenalty));
    const processingMs = Date.now() - startTime;
    const summary = matchedSignals.length > 0
        ? `Automated fallback analysis identified ${matchedSignals.length} policy clause pattern${matchedSignals.length === 1 ? '' : 's'} that merit review. The policy likely includes one or more claim-friction terms such as waiting periods, sub-limits, or network restrictions.`
        : 'Automated fallback analysis completed without strong clause matches. Review exclusions, waiting periods, and sub-limits manually before relying on this policy.';

    const report: GptAnalysisResponse = {
        score,
        summary,
        risks,
        exclusions,
        suggestions,
        hiddenClauses,
        rawText: JSON.stringify({
            fallback: 'heuristic',
            reason,
            matchedSignals: matchedSignals.length,
        }),
    };

    logger.warn({
        action: 'ai.analyze.fallback',
        provider: 'heuristic',
        reason,
        fileName: input.fileName ?? 'unknown',
        matchedSignals: matchedSignals.length,
        score,
    });

    void logBraintrustEvent({
        eventType: 'ai_analysis.fallback',
        input: truncatePolicyText(input.policyText),
        output: JSON.stringify({
            score,
            risks: report.risks.length,
            exclusions: report.exclusions.length,
            suggestions: report.suggestions.length,
            hiddenClauses: report.hiddenClauses.length,
        }),
        metadata: {
            provider: 'heuristic',
            reason,
            fileName: input.fileName,
            processingMs,
        },
    });

    return {
        report,
        tokensUsed: 0,
        processingMs,
    };
}

async function analyzeWithGemini(input: AnalysisInput): Promise<AnalysisResult> {
    const apiKey = getGeminiApiKey();

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

    await logBraintrustEvent({
        eventType: 'ai_analysis.complete',
        input: truncatePolicyText(input.policyText),
        output: JSON.stringify({
            score: parsed.score,
            summary: parsed.summary,
            risks: parsed.risks.length,
            exclusions: parsed.exclusions.length,
            suggestions: parsed.suggestions.length,
            hiddenClauses: parsed.hiddenClauses.length,
        }),
        metadata: {
            provider: 'gemini',
            model: GEMINI_MODEL,
            tokensUsed,
            processingMs,
            fileName: input.fileName,
        },
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
        const message = error instanceof Error ? error.message : String(error);
        logger.error({
            action: 'ai.analyze.error',
            error: message,
        });

        await logBraintrustEvent({
            eventType: 'ai_analysis.error',
            input: truncatePolicyText(input.policyText),
            error: message,
            metadata: {
                provider: 'gemini',
                model: GEMINI_MODEL,
                fileName: input.fileName,
            },
        });

        return buildHeuristicReport(input, message);
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
