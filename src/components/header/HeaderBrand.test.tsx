/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import HeaderBrand from './HeaderBrand';

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => {
        const messages: Record<string, string> = {
            logoAlt: 'Localized logo alt',
            brandAccent: 'Localized Clarity',
        };
        return messages[key] ?? key;
    },
}));

vi.mock('next/link', () => ({
    default: ({
        href,
        children,
        ...props
    }: {
        href: string;
        children: ReactNode;
        [key: string]: unknown;
    }) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
}));

vi.mock('next/image', () => ({
    default: ({
        src,
        alt,
        ...props
    }: {
        src: string;
        alt: string;
        [key: string]: unknown;
    }) => (
        <span
            data-testid="header-brand-image"
            data-src={src}
            data-alt={alt}
            {...props}
        />
    ),
}));

describe('HeaderBrand', () => {
    it('renders localized logo alt and accent text', () => {
        render(<HeaderBrand />);

        const homeLink = screen.getByRole('link');
        expect(homeLink).toHaveAttribute('href', '/');
        expect(screen.getByTestId('header-brand-image')).toHaveAttribute('data-alt', 'Localized logo alt');
        expect(screen.getByText('Localized Clarity')).toBeInTheDocument();
    });
});
