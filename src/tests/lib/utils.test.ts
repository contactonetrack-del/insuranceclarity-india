import { describe, it, expect } from 'vitest'
import { cn, prefersReducedMotion, formatCurrency } from '@/lib/utils'

describe('cn (className merger)', () => {
    it('merges simple class names', () => {
        expect(cn('foo', 'bar')).toBe('foo bar')
    })

    it('handles conditional classes', () => {
        expect(cn('base', true && 'included', false && 'excluded')).toBe('base included')
    })

    it('resolves Tailwind conflicts correctly', () => {
        // tailwind-merge should resolve conflicting utilities
        expect(cn('px-2', 'px-4')).toBe('px-4')
        expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    })

    it('handles arrays of classes', () => {
        expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz')
    })

    it('handles undefined and null values', () => {
        expect(cn('foo', undefined, null, 'bar')).toBe('foo bar')
    })

    it('handles empty inputs', () => {
        expect(cn()).toBe('')
        expect(cn('')).toBe('')
    })
})

describe('prefersReducedMotion', () => {
    it('returns false when window is undefined (SSR)', () => {
        // The mock in setup.tsx sets matches to false
        expect(prefersReducedMotion()).toBe(false)
    })
})

describe('formatCurrency', () => {
    it('formats numbers as Indian Rupees', () => {
        expect(formatCurrency(1000)).toBe('₹1,000')
        expect(formatCurrency(100000)).toBe('₹1,00,000')
        expect(formatCurrency(10000000)).toBe('₹1,00,00,000')
    })

    it('handles zero', () => {
        expect(formatCurrency(0)).toBe('₹0')
    })

    it('rounds to whole numbers', () => {
        expect(formatCurrency(1234.56)).toBe('₹1,235')
        expect(formatCurrency(1234.49)).toBe('₹1,234')
    })

    it('handles negative numbers', () => {
        expect(formatCurrency(-5000)).toBe('-₹5,000')
    })
})
