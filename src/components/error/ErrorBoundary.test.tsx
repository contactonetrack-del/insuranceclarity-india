/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

vi.mock('@sentry/nextjs', () => ({
    captureException: vi.fn(),
}));

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => {
        const messages: Record<string, string> = {
            title: 'Localized boundary title',
            message: 'Localized boundary message',
            retryLabel: 'Localized retry',
            retryAriaLabel: 'Localized retry aria',
        };
        return messages[key] ?? key;
    },
}));

function ThrowingChild() {
    throw new Error('boom');
    return null;
}

describe('ErrorBoundary', () => {
    it('renders children when no error occurs', () => {
        render(
            <ErrorBoundary>
                <div>Healthy content</div>
            </ErrorBoundary>,
        );

        expect(screen.getByText('Healthy content')).toBeInTheDocument();
    });

    it('renders localized fallback copy when child throws', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        render(
            <ErrorBoundary>
                <ThrowingChild />
            </ErrorBoundary>,
        );

        expect(screen.getByText('Localized boundary title')).toBeInTheDocument();
        expect(screen.getByText('Localized boundary message')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Localized retry aria' })).toBeInTheDocument();

        consoleError.mockRestore();
    });
});
