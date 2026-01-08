import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cn, prefersReducedMotion, formatCurrency } from '@/lib/utils';

describe('Utils', () => {
    describe('cn (className merge)', () => {
        it('should merge single class names', () => {
            expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
        });

        it('should deduplicate conflicting Tailwind classes', () => {
            expect(cn('px-4', 'px-6')).toBe('px-6');
        });

        it('should handle conditional classes', () => {
            expect(cn('base', true && 'included', false && 'excluded')).toBe('base included');
        });

        it('should handle undefined and null', () => {
            expect(cn('base', undefined, null, 'valid')).toBe('base valid');
        });

        it('should merge complex class combinations', () => {
            expect(cn(
                'text-red-500 hover:text-red-600',
                'text-blue-500'  // Should override text-red-500
            )).toBe('hover:text-red-600 text-blue-500');
        });
    });

    describe('formatCurrency', () => {
        it('should format numbers as Indian currency', () => {
            expect(formatCurrency(1000)).toBe('₹1,000');
        });

        it('should format large numbers with Indian comma system', () => {
            expect(formatCurrency(10000000)).toBe('₹1,00,00,000');
        });

        it('should handle decimals (rounded to 0)', () => {
            expect(formatCurrency(1234.56)).toBe('₹1,235');
        });

        it('should handle zero', () => {
            expect(formatCurrency(0)).toBe('₹0');
        });
    });

    describe('prefersReducedMotion', () => {
        let matchMediaMock: ReturnType<typeof vi.fn>;

        beforeEach(() => {
            matchMediaMock = vi.fn();
            Object.defineProperty(window, 'matchMedia', {
                writable: true,
                value: matchMediaMock,
            });
        });

        it('should return true when user prefers reduced motion', () => {
            matchMediaMock.mockReturnValue({ matches: true });
            expect(prefersReducedMotion()).toBe(true);
        });

        it('should return false when user does not prefer reduced motion', () => {
            matchMediaMock.mockReturnValue({ matches: false });
            expect(prefersReducedMotion()).toBe(false);
        });
    });
});
