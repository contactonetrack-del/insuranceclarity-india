import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ResultPage from './page';

vi.mock('next/navigation', () => ({
    useParams: () => ({ id: 'scan_test_123' }),
}));

vi.mock('next-intl', () => ({
    useTranslations: (namespace: string) => {
        const messages: Record<string, string> = {
            'scan.resultPage.error.title': 'Localized Analysis Failed',
            'scan.resultPage.error.description': 'Localized analysis error description',
            'scan.resultPage.error.retry': 'Localized Try Another PDF',
            'scan.resultPage.error.reportId': 'Localized Report ID: {id}',
        };

        return (key: string, values?: Record<string, string | number>) => {
            const fullKey = `${namespace}.${key}`;
            const template = messages[fullKey] ?? fullKey;
            if (!values) return template;
            return Object.entries(values).reduce(
                (acc, [valueKey, value]) => acc.replace(`{${valueKey}}`, String(value)),
                template,
            );
        };
    },
}));

describe('scan result page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                status: 422,
                ok: false,
                json: async () => ({}),
            }),
        );
    });

    it('renders localized failed-state copy when analysis fails', async () => {
        render(<ResultPage />);

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('/api/result/scan_test_123', { headers: {} });
        });

        expect(await screen.findByText('Localized Analysis Failed')).toBeInTheDocument();
        expect(screen.getByText('Localized analysis error description')).toBeInTheDocument();
        expect(screen.getByText('Localized Report ID: scan_test_123')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Localized Try Another PDF' })).toHaveAttribute('href', '/scan');
    });
});

