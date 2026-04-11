/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import MobileMenuHeader from './MobileMenuHeader';

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => {
        const messages: Record<string, string> = {
            navigation: 'Localized navigation',
            closeMenu: 'Localized close menu',
        };
        return messages[key] ?? key;
    },
}));

describe('MobileMenuHeader', () => {
    it('renders localized labels and invokes close action', () => {
        const onClose = vi.fn();
        render(<MobileMenuHeader onClose={onClose} />);

        expect(screen.getByText('Localized navigation')).toBeInTheDocument();

        const closeButton = screen.getByRole('button', { name: 'Localized close menu' });
        fireEvent.click(closeButton);

        expect(onClose).toHaveBeenCalledTimes(1);
    });
});

