import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExclusionCard, HiddenClauseCard, RiskCard } from './RiskCard';

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => {
        const messages: Record<string, string> = {
            'severity.high': 'Localized High Risk',
            'severity.medium': 'Localized Medium Risk',
            'severity.low': 'Localized Low Risk',
            impactLabel: 'Localized Impact:',
            riskLabel: 'Localized Risk:',
            suggestionDefault: 'Localized Suggestion',
        };
        return messages[key] ?? key;
    },
}));

describe('RiskCard i18n labels', () => {
    it('renders localized severity label for risk badge', () => {
        render(
            <RiskCard
                risk={{
                    title: 'Deductible Trap',
                    description: 'The deductible may reduce payout significantly.',
                    severity: 'HIGH',
                }}
                index={0}
            />,
        );

        expect(screen.getByText('Localized High Risk')).toBeInTheDocument();
    });

    it('renders localized impact and risk labels', () => {
        render(
            <>
                <ExclusionCard
                    exclusion={{
                        clause: 'Pre-existing conditions',
                        impact: 'No payout for first 36 months.',
                    }}
                    index={0}
                />
                <HiddenClauseCard
                    hiddenClause={{
                        clause: 'Sub-limit on ICU charges',
                        risk: 'High out-of-pocket expense.',
                    }}
                    index={0}
                />
            </>,
        );

        expect(screen.getByText('Localized Impact:')).toBeInTheDocument();
        expect(screen.getByText('Localized Risk:')).toBeInTheDocument();
    });

});
