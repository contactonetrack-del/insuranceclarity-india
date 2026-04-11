import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { PaywallGate } from './PaywallGate';

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => {
        const messages: Record<string, string> = {
            title: 'Localized Unlock Full Report',
            lockedRegionLabel: 'Localized Premium report locked',
            featuresLabel: 'Localized Features Label',
            ctaUnlock: 'Localized Unlock CTA',
            ctaRetry: 'Localized Retry CTA',
            processing: 'Localized Processing',
            reassurance: 'Localized Reassurance',
            'features.allExclusions': 'Localized All exclusion clauses',
            'features.allSuggestions': 'Localized All actionable suggestions',
            'features.hiddenClauses': 'Localized Hidden fine-print clauses',
            'features.shareAndDownload': 'Localized Share and download report',
            'errors.cancelled': 'Localized Payment cancelled.',
            'errors.paymentFailed': 'Localized Payment failed.',
            'errors.serviceUnavailable': 'Localized Service unavailable.',
            'errors.securityTokenMissing': 'Localized Security token missing.',
            'errors.orderCreateFailed': 'Localized Unable to create payment order.',
            'errors.verificationFailed': 'Localized Verification failed.',
        };
        return messages[key] ?? key;
    },
}));

describe('PaywallGate', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: false,
                json: async () => ({}),
            }),
        );
    });

    it('renders translated content and CTA', async () => {
        render(
            <PaywallGate
                scanId="scan_123"
                message="Localized paywall message from report"
                onUnlocked={vi.fn()}
            />,
        );

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('/api/payment/status?scanId=scan_123', expect.any(Object));
        });

        expect(screen.getByRole('region', { name: 'Localized Premium report locked' })).toBeInTheDocument();
        expect(screen.getByText('Localized Unlock Full Report')).toBeInTheDocument();
        expect(screen.getByText('Localized paywall message from report')).toBeInTheDocument();
        expect(screen.getByText(/Localized All exclusion clauses/i)).toBeInTheDocument();
        expect(screen.getByText(/Localized All actionable suggestions/i)).toBeInTheDocument();
        expect(screen.getByText(/Localized Hidden fine-print clauses/i)).toBeInTheDocument();
        expect(screen.getByText(/Localized Share and download report/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Localized Unlock CTA' })).toBeInTheDocument();
        expect(screen.getByText('Localized Reassurance')).toBeInTheDocument();
    });
});
