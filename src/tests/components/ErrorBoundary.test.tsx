import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ErrorBoundary from '@/components/ErrorBoundary'

// Component that throws an error for testing
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
    if (shouldThrow) {
        throw new Error('Test error')
    }
    return <div>Content rendered successfully</div>
}

describe('ErrorBoundary', () => {
    it('renders children when there is no error', () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={false} />
            </ErrorBoundary>
        )

        expect(screen.getByText('Content rendered successfully')).toBeInTheDocument()
    })

    it('renders fallback UI when there is an error', () => {
        // Suppress console.error for this test since we expect an error
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        )

        expect(screen.getByText('Something went wrong')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /refresh page/i })).toBeInTheDocument()

        consoleSpy.mockRestore()
    })

    it('renders custom fallback when provided', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

        render(
            <ErrorBoundary fallback={<div>Custom error UI</div>}>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        )

        expect(screen.getByText('Custom error UI')).toBeInTheDocument()

        consoleSpy.mockRestore()
    })
})

import { vi } from 'vitest'
