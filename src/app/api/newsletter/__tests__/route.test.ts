import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { POST } from '../route';

const { mockValidateCsrfRequest } = vi.hoisted(() => ({
    mockValidateCsrfRequest: vi.fn(),
}));

const { mockSendWelcomeEmail } = vi.hoisted(() => ({
    mockSendWelcomeEmail: vi.fn(),
}));

const {
    mockCreateNewsletterLead,
    mockFindNewsletterLeadByEmail,
} = vi.hoisted(() => ({
    mockCreateNewsletterLead: vi.fn(),
    mockFindNewsletterLeadByEmail: vi.fn(),
}));

vi.mock('@/lib/security/csrf', () => ({
    validateCsrfRequest: mockValidateCsrfRequest,
}));

vi.mock('@/services/email.service', () => ({
    sendWelcomeEmail: mockSendWelcomeEmail,
}));

vi.mock('@/services/engagement.service', () => ({
    createNewsletterLead: mockCreateNewsletterLead,
    findNewsletterLeadByEmail: mockFindNewsletterLeadByEmail,
}));

vi.mock('@/lib/logger', () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

describe('POST /api/newsletter', () => {
    const createRequest = (body: unknown, headers: Record<string, string> = {}) =>
        new NextRequest('http://localhost:3000/api/newsletter', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                ...headers,
            },
            body: JSON.stringify(body),
        });

    beforeEach(() => {
        vi.clearAllMocks();
        mockValidateCsrfRequest.mockReturnValue(null);
        mockFindNewsletterLeadByEmail.mockResolvedValue(null);
        mockCreateNewsletterLead.mockResolvedValue({ id: 'lead_1' });
        mockSendWelcomeEmail.mockResolvedValue(undefined);
    });

    it('returns csrf response when validation fails', async () => {
        mockValidateCsrfRequest.mockReturnValue(
            NextResponse.json({ success: false, error: 'Invalid CSRF token.' }, { status: 403 }),
        );

        const response = await POST(createRequest({ email: 'user@example.com' }));
        const json = await response.json();

        expect(response.status).toBe(403);
        expect(json).toEqual({ success: false, error: 'Invalid CSRF token.' });
        expect(mockFindNewsletterLeadByEmail).not.toHaveBeenCalled();
    });

    it('returns validation error for invalid payload', async () => {
        const response = await POST(createRequest({ email: 'invalid-email' }));
        const json = await response.json();

        expect(response.status).toBe(400);
        expect(json.success).toBe(false);
        expect(json.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns already subscribed message for existing newsletter lead', async () => {
        mockFindNewsletterLeadByEmail.mockResolvedValue({ id: 'lead_1' });

        const response = await POST(createRequest({ email: 'user@example.com' }));
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toEqual({
            success: true,
            message: 'You are already subscribed!',
        });
        expect(mockCreateNewsletterLead).not.toHaveBeenCalled();
    });

    it('creates newsletter lead and sends localized welcome email', async () => {
        const response = await POST(
            createRequest(
                {
                    email: 'new-user@example.com',
                    name: 'Neha',
                    source: 'footer',
                },
                {
                    cookie: 'NEXT_LOCALE=hi',
                    'accept-language': 'hi-IN,hi;q=0.9,en;q=0.8',
                },
            ),
        );
        const json = await response.json();

        expect(response.status).toBe(201);
        expect(json.success).toBe(true);
        expect(mockCreateNewsletterLead).toHaveBeenCalledWith({
            name: 'Neha',
            email: 'new-user@example.com',
            source: 'ORGANIC',
            notes: 'Newsletter source context: footer',
        });
        expect(mockSendWelcomeEmail).toHaveBeenCalledWith('new-user@example.com', {
            userName: 'Neha',
            locale: 'hi',
        });
    });

    it('returns standardized internal error when create fails', async () => {
        mockCreateNewsletterLead.mockRejectedValue(new Error('db unavailable'));

        const response = await POST(createRequest({ email: 'user@example.com' }));
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json.success).toBe(false);
        expect(json.error.code).toBe('INTERNAL_SERVER_ERROR');
        expect(json.error.message).toBe('Subscription failed. Please try again.');
    });
});

