import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ShareButtons } from '../ShareButtons';

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

        const twitterLink = screen.getByLabelText(/Share on X/i);
        expect(twitterLink).toHaveAttribute('href', expect.stringContaining(encodeURIComponent(defaultProps.url)));
        expect(twitterLink).toHaveAttribute('href', expect.stringContaining(encodeURIComponent(defaultProps.title)));

        const facebookLink = screen.getByLabelText(/Share on Facebook/i);
        expect(facebookLink).toHaveAttribute('href', expect.stringContaining(encodeURIComponent(defaultProps.url)));

        const linkedinLink = screen.getByLabelText(/Share on LinkedIn/i);
        expect(linkedinLink).toHaveAttribute('href', expect.stringContaining(encodeURIComponent(defaultProps.url)));

        const whatsappLink = screen.getByLabelText(/Share on WhatsApp/i);
        expect(whatsappLink).toHaveAttribute('href', expect.stringContaining(encodeURIComponent(defaultProps.url)));
        expect(whatsappLink).toHaveAttribute('href', expect.stringContaining(encodeURIComponent(defaultProps.title)));

        const pinterestLink = screen.getByLabelText(/Save on Pinterest/i);
        expect(pinterestLink).toHaveAttribute('href', expect.stringContaining(encodeURIComponent(defaultProps.url)));
        expect(pinterestLink).toHaveAttribute('href', expect.stringContaining(encodeURIComponent(defaultProps.image)));
    });

    it('copies the URL to clipboard when copy button is clicked', async () => {
        render(<ShareButtons {...defaultProps} />);
        
        const copyButton = screen.getByLabelText(/Copy Link/i);
        fireEvent.click(copyButton);

        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(defaultProps.url);
        
        // Should show success state (e.g., emerald class on button)
        await waitFor(() => {
            expect(copyButton).toHaveClass('text-emerald-500');
        });
    });

    it('triggers native share on mobile when Share button is clicked', async () => {
        render(<ShareButtons {...defaultProps} />);
        
        const shareButton = screen.getByText('Share');
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
        
        const pinterestLink = screen.getByLabelText(/Save on Pinterest/i);
        fireEvent.click(pinterestLink);

        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Pinterest requires an image'));
    });
});
