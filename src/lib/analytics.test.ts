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

        it('should block PII params: age, sum_insured, phone, email', () => {
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

            trackEvent('test_with_pii', {
                age: 30,
                user_age: 25,
                sum_insured: 5000000,
                phone: '9876543210',
                email: 'test@example.com',
                safe_param: 'allowed',
            });

            // Should only contain safe_param
            expect(consoleSpy).toHaveBeenCalledWith(
                '[Analytics Dev]',
                'test_with_pii',
                { safe_param: 'allowed' }
            );

            // Should warn about blocked params
            expect(warnSpy).toHaveBeenCalledWith(
                '[Analytics] Blocked PII params:',
                expect.arrayContaining(['age', 'user_age', 'sum_insured', 'phone', 'email'])
            );

            warnSpy.mockRestore();
        });

        it('should block aadhaar, pan, dob, name, address', () => {
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

            trackEvent('test_more_pii', {
                aadhaar: '123456789012',
                pan: 'ABCDE1234F',
                dob: '1990-01-01',
                name: 'John Doe',
                address: '123 Main St',
                calculator_type: 'health',
            });

            // Should only contain calculator_type
            expect(consoleSpy).toHaveBeenCalledWith(
                '[Analytics Dev]',
                'test_more_pii',
                { calculator_type: 'health' }
            );

            warnSpy.mockRestore();
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
        it('should track calculator usage with bucketed ranges', () => {
            trackCalculatorUsed({
                type: 'motor',
                sum_insured: 500000, // Should become 'under_10L'
                age: 30, // Should become '25-34'
                completed: true,
            });

            expect(consoleSpy).toHaveBeenCalledWith(
                '[Analytics Dev]',
                'calculator_used',
                expect.objectContaining({
                    calculator_type: 'motor',
                    sum_range: 'under_10L',
                    age_range: '25-34',
                    calculation_completed: true,
                })
            );
        });

        it('should bucket large sum insured correctly', () => {
            trackCalculatorUsed({
                type: 'life',
                sum_insured: 7500000, // Should become '50L-1Cr'
                age: 45, // Should become '45-54'
                completed: true,
            });

            expect(consoleSpy).toHaveBeenCalledWith(
                '[Analytics Dev]',
                'calculator_used',
                expect.objectContaining({
                    sum_range: '50L-1Cr',
                    age_range: '45-54',
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
