import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { POST } from '../route';

const { mockAuth } = vi.hoisted(() => ({
    mockAuth: vi.fn(),
}));

const { mockValidateCsrfRequest } = vi.hoisted(() => ({
    mockValidateCsrfRequest: vi.fn(),
}));

const { mockFindScanNotifyLead, mockCreateScanNotifyLead } = vi.hoisted(() => ({
    mockFindScanNotifyLead: vi.fn(),
    mockCreateScanNotifyLead: vi.fn(),
}));

vi.mock('@/auth', () => ({
    auth: mockAuth,
}));

vi.mock('@/lib/security/csrf', () => ({
    validateCsrfRequest: mockValidateCsrfRequest,
}));

vi.mock('@/services/engagement.service', () => ({
    findScanNotifyLead: mockFindScanNotifyLead,
    createScanNotifyLead: mockCreateScanNotifyLead,
}));

vi.mock('@/lib/logger', () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

describe('POST /api/scan/notify', () => {
    const createRequest = (
        body: unknown,
        headers: Record<string, string> = {},
    ) =>
        new NextRequest('http://localhost:3000/api/scan/notify', {
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
        mockAuth.mockResolvedValue(null);
        mockFindScanNotifyLead.mockResolvedValue(null);
    });

    it('returns csrf error response when csrf validation fails', async () => {
        mockValidateCsrfRequest.mockReturnValue(
            NextResponse.json({ success: false, error: 'Invalid CSRF token.' }, { status: 403 }),
        );

        const response = await POST(
            createRequest({
                scanId: 'scan_1',
                email: 'user@example.com',
            }),
        );
        const json = await response.json();

        expect(response.status).toBe(403);
        expect(json).toEqual({ success: false, error: 'Invalid CSRF token.' });
        expect(mockFindScanNotifyLead).not.toHaveBeenCalled();
    });

    it('returns 400 for invalid request payload', async () => {
        const response = await POST(createRequest({}));
        const json = await response.json();

        expect(response.status).toBe(400);
        expect(json.success).toBe(false);
        expect(typeof json.error).toBe('string');
    });

    it('creates a new notify lead when no duplicate exists', async () => {
        mockAuth.mockResolvedValue({ user: { name: 'Ravi' } });

        const response = await POST(
            createRequest(
                {
                    scanId: 'scan_123',
                    email: 'USER@Example.com',
                },
                { cookie: 'NEXT_LOCALE=hi' },
            ),
        );
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.success).toBe(true);
        expect(mockFindScanNotifyLead).toHaveBeenCalledWith('user@example.com', 'scan_123');
        expect(mockCreateScanNotifyLead).toHaveBeenCalledWith({
            name: 'Ravi',
            email: 'user@example.com',
            scanId: 'scan_123',
            locale: 'hi',
        });
    });

    it('does not create duplicate notify lead when one already exists', async () => {
        mockFindScanNotifyLead.mockResolvedValue({ id: 'lead_1' });

        const response = await POST(
            createRequest({
                scanId: 'scan_123',
                email: 'user@example.com',
                name: 'Existing User',
            }),
        );
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.success).toBe(true);
        expect(mockCreateScanNotifyLead).not.toHaveBeenCalled();
    });

    it('returns 500 when persistence fails', async () => {
        mockCreateScanNotifyLead.mockRejectedValue(new Error('database unavailable'));

        const response = await POST(
            createRequest({
                scanId: 'scan_123',
                email: 'user@example.com',
            }),
        );
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json).toEqual({
            success: false,
            error: 'Failed to save notification request.',
        });
    });
});
