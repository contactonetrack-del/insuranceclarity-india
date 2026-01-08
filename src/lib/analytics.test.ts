import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    trackEvent,
    trackPolicyComparison,
    trackCalculatorUsed,
    trackToolUsed,
    trackFormEvent,
} from '@/lib/analytics';

describe('Analytics', () => {
    let consoleSpy: ReturnType<typeof vi.spyOn>;
    const originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
        consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
        // Reset to development for testing
        vi.stubEnv('NODE_ENV', 'development');
    });

    afterEach(() => {
        consoleSpy.mockRestore();
        vi.stubEnv('NODE_ENV', originalEnv);
    });

    describe('trackEvent', () => {
        it('should log events in development mode', () => {
            trackEvent('test_event', { key: 'value' });

            expect(consoleSpy).toHaveBeenCalledWith(
                '[Analytics Dev]',
                'test_event',
                { key: 'value' }
            );
        });

        it('should handle events without params', () => {
            trackEvent('simple_event');

            expect(consoleSpy).toHaveBeenCalledWith(
                '[Analytics Dev]',
                'simple_event',
                {}
            );
        });
    });

    describe('trackPolicyComparison', () => {
        it('should track policy comparison events', () => {
            trackPolicyComparison({
                category: 'health',
                policyCount: 3,
                duration_seconds: 45,
            });

            expect(consoleSpy).toHaveBeenCalledWith(
                '[Analytics Dev]',
                'policy_comparison_viewed',
                expect.objectContaining({
                    insurance_category: 'health',
                    policies_compared: 3,
                })
            );
        });
    });

    describe('trackCalculatorUsed', () => {
        it('should track calculator usage', () => {
            trackCalculatorUsed({
                type: 'motor',
                sum_insured: 500000,
                age: 30,
                completed: true,
            });

            expect(consoleSpy).toHaveBeenCalledWith(
                '[Analytics Dev]',
                'calculator_used',
                expect.objectContaining({
                    calculator_type: 'motor',
                    sum_insured: 500000,
                    calculation_completed: true,
                })
            );
        });
    });

    describe('trackToolUsed', () => {
        it('should track tool usage', () => {
            trackToolUsed('hidden_facts', { factsViewed: 5 });

            expect(consoleSpy).toHaveBeenCalledWith(
                '[Analytics Dev]',
                'tool_used',
                expect.objectContaining({
                    tool_name: 'hidden_facts',
                    factsViewed: 5,
                })
            );
        });
    });

    describe('trackFormEvent', () => {
        it('should track form start', () => {
            trackFormEvent('start', { form_name: 'quote_request' });

            expect(consoleSpy).toHaveBeenCalledWith(
                '[Analytics Dev]',
                'form_start',
                expect.objectContaining({ form_name: 'quote_request' })
            );
        });

        it('should track form abandon', () => {
            trackFormEvent('abandon', {
                form_name: 'quote_request',
                step: 2,
                field: 'dob'
            });

            expect(consoleSpy).toHaveBeenCalledWith(
                '[Analytics Dev]',
                'form_abandon',
                expect.objectContaining({
                    form_name: 'quote_request',
                    step: 2,
                    field: 'dob',
                })
            );
        });
    });
});
