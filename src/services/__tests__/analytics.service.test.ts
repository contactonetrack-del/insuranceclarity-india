import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    trackEvent,
    trackPolicyComparison,
    trackCalculatorUsed,
    trackToolUsed,
    trackFormEvent,
} from '../analytics.service';

describe('Analytics', () => {
    let consoleDebugSpy: ReturnType<typeof vi.spyOn>;
    let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
    const originalEnv = process.env.NODE_ENV;
    const originalAnalyticsFlag = process.env.NEXT_PUBLIC_DISABLE_RUNTIME_ANALYTICS;

    beforeEach(() => {
        consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => { });
        consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
        // Reset to development for testing
        vi.stubEnv('NODE_ENV', 'development');
        vi.stubEnv('NEXT_PUBLIC_DISABLE_RUNTIME_ANALYTICS', 'false');
    });

    afterEach(() => {
        consoleDebugSpy.mockRestore();
        consoleWarnSpy.mockRestore();
        vi.stubEnv('NODE_ENV', originalEnv);
        if (originalAnalyticsFlag === undefined) {
            delete process.env.NEXT_PUBLIC_DISABLE_RUNTIME_ANALYTICS;
        } else {
            vi.stubEnv('NEXT_PUBLIC_DISABLE_RUNTIME_ANALYTICS', originalAnalyticsFlag);
        }
    });

    describe('trackEvent', () => {
        it('should log events in development mode', () => {
            trackEvent('test_event', { key: 'value' });

            expect(consoleDebugSpy).toHaveBeenCalledWith(
                '[Analytics Dev]',
                '[Analytics Dev]',
                'test_event',
                { key: 'value' },
            );
        });

        it('should handle events without params', () => {
            trackEvent('simple_event');

            expect(consoleDebugSpy).toHaveBeenCalledWith(
                '[Analytics Dev]',
                '[Analytics Dev]',
                'simple_event',
                {},
            );
        });

        it('should block PII params: age, sum_insured, phone, email', () => {
            trackEvent('test_with_pii', {
                age: 30,
                user_age: 25,
                sum_insured: 5000000,
                phone: '9876543210',
                email: 'test@example.com',
                safe_param: 'allowed',
            });

            // Should only contain safe_param
            expect(consoleDebugSpy).toHaveBeenCalledWith(
                '[Analytics Dev]',
                '[Analytics Dev]',
                'test_with_pii',
                { safe_param: 'allowed' },
            );

            // Should warn about blocked params
            expect(consoleWarnSpy).toHaveBeenCalledWith(
                '[Analytics] Blocked PII params:',
                ['age', 'user_age', 'sum_insured', 'phone', 'email'],
            );
        });

        it('should block aadhaar, pan, dob, name, address', () => {
            trackEvent('test_more_pii', {
                aadhaar: '123456789012',
                pan: 'ABCDE1234F',
                dob: '1990-01-01',
                name: 'John Doe',
                address: '123 Main St',
                calculator_type: 'health',
            });

            // Should only contain calculator_type
            expect(consoleDebugSpy).toHaveBeenCalledWith(
                '[Analytics Dev]',
                '[Analytics Dev]',
                'test_more_pii',
                { calculator_type: 'health' },
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

            expect(consoleDebugSpy).toHaveBeenCalled();
            expect(consoleDebugSpy.mock.calls[0]).toEqual(
                expect.arrayContaining(['policy_comparison_viewed']),
            );
        });
    });

    describe('trackCalculatorUsed', () => {
        it('should track calculator usage with bucketed ranges', () => {
            trackCalculatorUsed({
                type: 'motor',
                sum_insured: 500000,
                age: 30,
                completed: true,
            });

            expect(consoleDebugSpy).toHaveBeenCalled();
            expect(consoleDebugSpy.mock.calls[0]).toEqual(
                expect.arrayContaining(['calculator_used']),
            );
        });
    });

    describe('trackToolUsed', () => {
        it('should track tool usage', () => {
            trackToolUsed('hidden_facts', { factsViewed: 5 });

            expect(consoleDebugSpy).toHaveBeenCalled();
            expect(consoleDebugSpy.mock.calls[0]).toEqual(
                expect.arrayContaining(['tool_used']),
            );
        });
    });

    describe('trackFormEvent', () => {
        it('should track form start', () => {
            trackFormEvent('start', { form_name: 'quote_request' });

            expect(consoleDebugSpy).toHaveBeenCalled();
            expect(consoleDebugSpy.mock.calls[0]).toEqual(
                expect.arrayContaining(['form_start']),
            );
        });

        it('should track form abandon', () => {
            trackFormEvent('abandon', {
                form_name: 'quote_request',
                step: 2,
                field: 'dob'
            });

            expect(consoleDebugSpy).toHaveBeenCalled();
            expect(consoleDebugSpy.mock.calls[0]).toEqual(
                expect.arrayContaining(['form_abandon']),
            );
        });
    });
});
