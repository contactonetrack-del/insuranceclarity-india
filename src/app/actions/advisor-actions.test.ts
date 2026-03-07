import { describe, it, expect, vi } from 'vitest';
import { processChatStep, ApplicationState } from './advisor-actions';

// Mock the quoteService since we don't want to hit the DB during unit tests
vi.mock('../../lib/services/quote.service', () => ({
    quoteService: {
        generateQuote: vi.fn().mockResolvedValue({
            quote: { id: 'POL-MOCK-123' },
            documentJobId: 'JOB-MOCK-456',
            status: 'PROCESSING_DOCUMENT'
        })
    }
}));

describe('AI Underwriter State Machine', () => {

    it('Step 1 -> 2: Validates Insurance Type correctly', async () => {
        const state: ApplicationState = {};

        // Invalid Type
        const res1 = await processChatStep(state, "I want to buy a spaceship", 2);
        expect(res1.nextStepNumber).toBe(1); // Keeps user on step 1
        expect(res1.newState.insuranceType).toBeUndefined();

        // Valid Type
        const res2 = await processChatStep(state, "I need some term life cover", 2);
        expect(res2.nextStepNumber).toBeUndefined();
        expect(res2.newState.insuranceType).toBe('Term');
    });

    it('Step 2 -> 3: Parses numeric and Indian multiplier coverage amounts', async () => {
        const state: ApplicationState = { insuranceType: 'Term' };

        // Test Lakhs Multiplier
        const resLakhs = await processChatStep(state, "Around 50 Lakhs", 3);
        expect(resLakhs.newState.coverageAmount).toBe(5000000);

        // Test Crores Multiplier
        const resCrores = await processChatStep(state, "I want 2 Cr cover", 3);
        expect(resCrores.newState.coverageAmount).toBe(20000000);

        // Test RAW Numbers
        const resNum = await processChatStep(state, "Give me 7500000 please", 3);
        expect(resNum.newState.coverageAmount).toBe(7500000);

        // Invalid Text
        const resInvalid = await processChatStep(state, "I do not know", 3);
        expect(resInvalid.nextStepNumber).toBe(2); // Loops validation
    });

    it('Step 3 -> 4: strictly enforces age constraints 18-100', async () => {
        const state: ApplicationState = { insuranceType: 'Term', coverageAmount: 5000000 };

        // Too young
        const youngRes = await processChatStep(state, "I am 16 years old", 4);
        expect(youngRes.nextStepNumber).toBe(3);

        // Valid Age
        const validRes = await processChatStep(state, "I just turned 35.", 4);
        expect(validRes.newState.applicantAge).toBe(35);
        expect(validRes.nextStepNumber).toBeUndefined();
    });

    it('Step 4 -> Final: Translates Yes/No strictly and generates quote', async () => {
        const state: ApplicationState = { insuranceType: 'Term', coverageAmount: 5000000, applicantAge: 35 };

        // Invalid Tobacco Response
        const invalidRes = await processChatStep(state, "Sometimes on weekends", 5);
        expect(invalidRes.nextStepNumber).toBe(4);

        // Valid Response
        const validRes = await processChatStep(state, "Nope, never.", 5);
        expect(validRes.isComplete).toBe(true);
        expect(validRes.newState.tobaccoUser).toBe(false);
        expect(validRes.quoteId).toBe('POL-MOCK-123');
    });

});
