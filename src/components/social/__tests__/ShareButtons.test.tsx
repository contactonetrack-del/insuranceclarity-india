import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ShareButtons } from '../ShareButtons';

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => {
        const messages: Record<string, string> = {
            heading: 'Localized Share This',
            'aria.xTwitter': 'Localized Share on X (Twitter)',
            'aria.facebook': 'Localized Share on Facebook',
            'aria.linkedIn': 'Localized Share on LinkedIn',
            'aria.whatsApp': 'Localized Share on WhatsApp',
            'aria.pinterest': 'Localized Save on Pinterest',
            'aria.copyLink': 'Localized Copy Link',
            'actions.share': 'Localized Share',
            'alerts.pinterestImageRequired': 'Localized Pinterest image required',
        };
        return messages[key] ?? key;
    },
}));

describe('ShareButtons', () => {
    const defaultProps = {
        url: 'https://example.com/blog/test-post',
        title: 'Test Post Title',
        description: 'A test post description',
        image: 'https://example.com/image.jpg',
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Mock clipboard
        Object.assign(navigator, {
            clipboard: {
                writeText: vi.fn().mockImplementation(() => Promise.resolve()),
            },
        });
        // Mock share
        Object.assign(navigator, {
            share: vi.fn().mockImplementation(() => Promise.resolve()),
        });
        // Mock window.alert
        vi.stubGlobal('alert', vi.fn());
    });

    it('renders all social sharing links with correct hrefs', () => {
        render(<ShareButtons {...defaultProps} />);

        expect(screen.getByText('Localized Share This')).toBeInTheDocument();

        const twitterLink = screen.getByLabelText(/Localized Share on X/i);
        expect(twitterLink).toHaveAttribute('href', expect.stringContaining(encodeURIComponent(defaultProps.url)));
        expect(twitterLink).toHaveAttribute('href', expect.stringContaining(encodeURIComponent(defaultProps.title)));

        const facebookLink = screen.getByLabelText(/Localized Share on Facebook/i);
        expect(facebookLink).toHaveAttribute('href', expect.stringContaining(encodeURIComponent(defaultProps.url)));

        const linkedinLink = screen.getByLabelText(/Localized Share on LinkedIn/i);
        expect(linkedinLink).toHaveAttribute('href', expect.stringContaining(encodeURIComponent(defaultProps.url)));

        const whatsappLink = screen.getByLabelText(/Localized Share on WhatsApp/i);
        expect(whatsappLink).toHaveAttribute('href', expect.stringContaining(encodeURIComponent(defaultProps.url)));
        expect(whatsappLink).toHaveAttribute('href', expect.stringContaining(encodeURIComponent(defaultProps.title)));

        const pinterestLink = screen.getByLabelText(/Localized Save on Pinterest/i);
        expect(pinterestLink).toHaveAttribute('href', expect.stringContaining(encodeURIComponent(defaultProps.url)));
        expect(pinterestLink).toHaveAttribute('href', expect.stringContaining(encodeURIComponent(defaultProps.image)));
    });

    it('copies the URL to clipboard when copy button is clicked', async () => {
        render(<ShareButtons {...defaultProps} />);
        
        const copyButton = screen.getByLabelText(/Localized Copy Link/i);
        fireEvent.click(copyButton);

        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(defaultProps.url);
        
        // Should show success state (e.g., emerald class on button)
        await waitFor(() => {
            expect(copyButton).toHaveClass('text-success-500');
        });
    });

    it('triggers native share on mobile when Share button is clicked', async () => {
        render(<ShareButtons {...defaultProps} />);
        
        const shareButton = screen.getByText('Localized Share');
        fireEvent.click(shareButton);

        expect(navigator.share).toHaveBeenCalledWith({
            title: defaultProps.title,
            text: defaultProps.description,
            url: defaultProps.url,
        });
    });

    it('alerts and prevents sharing on Pinterest if no image is provided', () => {
        const propsNoImage = { ...defaultProps, image: '' };
        render(<ShareButtons {...propsNoImage} />);
        
        const pinterestLink = screen.getByLabelText(/Localized Save on Pinterest/i);
        fireEvent.click(pinterestLink);

        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Localized Pinterest image required'));
    });
});
