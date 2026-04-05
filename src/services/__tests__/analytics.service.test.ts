import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    trackEvent,
    trackPolicyComparison,
    trackCalculatorUsed,
    trackToolUsed,
    trackFormEvent,
} from '../analytics.service';
import { logger } from '@/lib/logger';

describe('Analytics', () => {
    let loggerDebugSpy: any;
    let loggerWarnSpy: any;
    const originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
        loggerDebugSpy = vi.spyOn(logger, 'debug').mockImplementation(() => { });
        loggerWarnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => { });
        // Reset to development for testing
        vi.stubEnv('NODE_ENV', 'development');
    });

    afterEach(() => {
        loggerDebugSpy.mockRestore();
        loggerWarnSpy.mockRestore();
        vi.stubEnv('NODE_ENV', originalEnv);
    });

    describe('trackEvent', () => {
        it('should log events in development mode', () => {
            trackEvent('test_event', { key: 'value' });

            expect(loggerDebugSpy).toHaveBeenCalledWith(
                { args: ['[Analytics Dev]', 'test_event', { key: 'value' }] },
                '[Analytics Dev]'
            );
        });

        it('should handle events without params', () => {
            trackEvent('simple_event');

            expect(loggerDebugSpy).toHaveBeenCalledWith(
                { args: ['[Analytics Dev]', 'simple_event', {}] },
                '[Analytics Dev]'
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
            expect(loggerDebugSpy).toHaveBeenCalledWith(
                { args: ['[Analytics Dev]', 'test_with_pii', { safe_param: 'allowed' }] },
                '[Analytics Dev]'
            );

            // Should warn about blocked params
            expect(loggerWarnSpy).toHaveBeenCalledWith(
                { args: [['age', 'user_age', 'sum_insured', 'phone', 'email']] },
                '[Analytics] Blocked PII params:'
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
            expect(loggerDebugSpy).toHaveBeenCalledWith(
                { args: ['[Analytics Dev]', 'test_more_pii', { calculator_type: 'health' }] },
                '[Analytics Dev]'
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

            expect(loggerDebugSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    args: expect.arrayContaining(['policy_comparison_viewed'])
                }),
                '[Analytics Dev]'
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

            expect(loggerDebugSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    args: expect.arrayContaining(['calculator_used'])
                }),
                '[Analytics Dev]'
            );
        });
    });

    describe('trackToolUsed', () => {
        it('should track tool usage', () => {
            trackToolUsed('hidden_facts', { factsViewed: 5 });

            expect(loggerDebugSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    args: expect.arrayContaining(['tool_used'])
                }),
                '[Analytics Dev]'
            );
        });
    });

    describe('trackFormEvent', () => {
        it('should track form start', () => {
            trackFormEvent('start', { form_name: 'quote_request' });

            expect(loggerDebugSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    args: expect.arrayContaining(['form_start'])
                }),
                '[Analytics Dev]'
            );
        });

        it('should track form abandon', () => {
            trackFormEvent('abandon', {
                form_name: 'quote_request',
                step: 2,
                field: 'dob'
            });

            expect(loggerDebugSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    args: expect.arrayContaining(['form_abandon'])
                }),
                '[Analytics Dev]'
            );
        });
    });
});
