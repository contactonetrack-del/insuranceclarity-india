/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MobileMenuFooter from './MobileMenuFooter';

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => {
        const messages: Record<string, string> = {
            supportProject: 'Localized support project',
            transparencyTagline: 'Localized transparency tagline',
        };
        return messages[key] ?? key;
    },
}));

describe('MobileMenuFooter', () => {
    it('renders localized support CTA and tagline', () => {
        render(<MobileMenuFooter />);

        const supportLink = screen.getByRole('link', { name: /Localized support project/i });
        expect(supportLink).toHaveAttribute('href', 'https://buymeacoffee.com/insuranceclarity');
        expect(supportLink).toHaveAttribute('target', '_blank');
        expect(screen.getByText('Localized transparency tagline')).toBeInTheDocument();
    });
});

