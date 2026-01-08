import { describe, it, expect } from 'vitest';
import {
    maskAadhaar,
    maskPAN,
    maskPolicyNo,
    maskEmail,
    maskPhone,
} from '@/lib/pii-mask';

describe('PII Masking Utilities', () => {
    describe('maskAadhaar', () => {
        it('should mask a valid 12-digit Aadhaar', () => {
            expect(maskAadhaar('123456789012')).toBe('12XXXXXX9012');
        });

        it('should handle Aadhaar with spaces', () => {
            expect(maskAadhaar('1234 5678 9012')).toBe('12XXXXXX9012');
        });

        it('should return INVALID for short Aadhaar', () => {
            expect(maskAadhaar('12345')).toBe('INVALID_AADHAAR');
        });

        it('should return INVALID for empty string', () => {
            expect(maskAadhaar('')).toBe('INVALID_AADHAAR');
        });
    });

    describe('maskPAN', () => {
        it('should mask a valid PAN number', () => {
            expect(maskPAN('ABCDE1234F')).toBe('XXXXX234F');
        });

        it('should return INVALID for wrong length', () => {
            expect(maskPAN('ABC123')).toBe('INVALID_PAN');
        });
    });

    describe('maskPolicyNo', () => {
        it('should mask a policy number', () => {
            expect(maskPolicyNo('POL-2024-123456')).toBe('XX-XXXX-3456');
        });

        it('should handle short policy numbers', () => {
            expect(maskPolicyNo('AB')).toBe('INVALID_POLICY');
        });
    });

    describe('maskEmail', () => {
        it('should mask email keeping first 2 chars and domain', () => {
            expect(maskEmail('john.doe@example.com')).toBe('jo***@example.com');
        });

        it('should return INVALID for non-email', () => {
            expect(maskEmail('notanemail')).toBe('INVALID_EMAIL');
        });
    });

    describe('maskPhone', () => {
        it('should mask a 10-digit phone number', () => {
            expect(maskPhone('9876543210')).toBe('******3210');
        });

        it('should mask international format', () => {
            expect(maskPhone('+919876543210')).toBe('+91****3210');
        });

        it('should return INVALID for short phone', () => {
            expect(maskPhone('12345')).toBe('INVALID_PHONE');
        });
    });
});
