import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzePolicyWithGpt } from '../ai.service';
import { logger } from '@/lib/logger';

const mockGenerateContent = vi.fn();

vi.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: class MockGoogleGenerativeAI {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        constructor(_apiKey: string) {}

        getGenerativeModel() {
            return {
                generateContent: mockGenerateContent,
            };
        }
    },
}));

vi.mock('@/lib/logger', () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
    },
}));

describe('AI Service (Gemini)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.GEMINI_API_KEY = 'test-gemini-key';
    });

    it('should successfully analyze policy text and return structured JSON', async () => {
        mockGenerateContent.mockResolvedValue({
            response: {
                text: () => JSON.stringify({
                    score: 85,
                    summary: 'Good policy with minor room rent limits.',
                    risks: [{ title: 'Room Rent Limit', severity: 'MEDIUM', description: 'Limited to 2% of SI' }],
                    exclusions: [{ clause: 'Self-inflicted injury', impact: 'Not covered' }],
                    suggestions: [{ action: 'Upgrade to no sub-limit plan', priority: 'HIGH' }],
                    hiddenClauses: [{ clause: 'Grace period', risk: '30 days only' }],
                }),
                usageMetadata: { totalTokenCount: 500 },
            },
        });

        const result = await analyzePolicyWithGpt({
            policyText: 'Policy text content here...',
            fileName: 'test-policy.pdf',
        });

        expect(result.report.score).toBe(85);
        expect(result.report.risks).toHaveLength(1);
        expect(result.tokensUsed).toBe(500);
        expect(logger.info).toHaveBeenCalledWith(expect.objectContaining({ action: 'ai.analyze.complete' }));
    });

    it('should truncate extremely long policy text before sending to AI', async () => {
        const veryLongText = 'A'.repeat(30000);

        mockGenerateContent.mockResolvedValue({
            response: {
                text: () => '{}',
                usageMetadata: { totalTokenCount: 100 },
            },
        });

        await analyzePolicyWithGpt({ policyText: veryLongText });
        const prompt = mockGenerateContent.mock.calls[0][0];

        expect(prompt).toContain('[...middle sections omitted for analysis...]');
        expect(prompt.length).toBeLessThan(veryLongText.length + 2000);
    });

    it('should handle malformed JSON shape using fallbacks', async () => {
        mockGenerateContent.mockResolvedValue({
            response: {
                text: () => '{"score":"not-a-number","risks":"invalid"}',
                usageMetadata: { totalTokenCount: 100 },
            },
        });

        const result = await analyzePolicyWithGpt({ policyText: 'short text' });

        expect(result.report.score).toBe(50);
        expect(result.report.risks).toEqual([]);
        expect(result.report.summary).toBeDefined();
    });

    it('should throw an error when model returns non-JSON content', async () => {
        mockGenerateContent.mockResolvedValue({
            response: {
                text: () => 'Rate limit exceeded',
                usageMetadata: { totalTokenCount: 0 },
            },
        });

        await expect(analyzePolicyWithGpt({ policyText: 'test' }))
            .rejects.toThrow('AI analysis failed');

        expect(logger.error).toHaveBeenCalled();
    });

    it('should throw an error when Gemini API call fails', async () => {
        mockGenerateContent.mockRejectedValue(new Error('Network error'));

        await expect(analyzePolicyWithGpt({ policyText: 'test' }))
            .rejects.toThrow('AI analysis failed');

        expect(logger.error).toHaveBeenCalledWith(expect.objectContaining({ action: 'ai.analyze.error' }));
    });
});
