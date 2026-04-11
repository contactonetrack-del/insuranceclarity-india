import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse, type NextRequest } from 'next/server';
import { POST } from '../route';

const { mockAuth } = vi.hoisted(() => ({
    mockAuth: vi.fn(),
}));

const { mockValidateCsrfRequest } = vi.hoisted(() => ({
    mockValidateCsrfRequest: vi.fn(),
}));

const { mockCreateRazorpaySubscription } = vi.hoisted(() => ({
    mockCreateRazorpaySubscription: vi.fn(),
}));

vi.mock('@/auth', () => ({
    auth: mockAuth,
}));

vi.mock('@/lib/security/csrf', () => ({
    validateCsrfRequest: mockValidateCsrfRequest,
}));

vi.mock('@/services/subscription.service', () => ({
    createRazorpaySubscription: mockCreateRazorpaySubscription,
}));

vi.mock('@/lib/logger', () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

describe('POST /api/subscription/create', () => {
    const createRequest = (body: unknown) => {
        return new Request('http://localhost:3000/api/subscription/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        }) as unknown as NextRequest;
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockValidateCsrfRequest.mockReturnValue(null);
        mockAuth.mockResolvedValue({
            user: {
                id: 'user_1',
                email: 'user@example.com',
                name: 'Test User',
            },
        });
        mockCreateRazorpaySubscription.mockResolvedValue({
            subscriptionId: 'sub_123',
            shortUrl: 'https://rzp.io/i/sub_123',
            status: 'created',
        });
    });

    it('returns csrf response when csrf validation fails', async () => {
        mockValidateCsrfRequest.mockReturnValue(
            NextResponse.json({ success: false, error: { code: 'FORBIDDEN' } }, { status: 403 }),
        );

        const response = await POST(createRequest({ plan: 'PRO' }));
        expect(response.status).toBe(403);
        expect(mockCreateRazorpaySubscription).not.toHaveBeenCalled();
    });

    it('returns unauthorized when session is missing', async () => {
        mockAuth.mockResolvedValue(null);

        const response = await POST(createRequest({ plan: 'PRO' }));
        const json = await response.json();

        expect(response.status).toBe(401);
        expect(json.success).toBe(false);
        expect(json.error.code).toBe('UNAUTHORIZED');
    });

    it('returns unauthorized when session user lacks id/email', async () => {
        mockAuth.mockResolvedValue({ user: { id: '', email: '' } });

        const response = await POST(createRequest({ plan: 'PRO' }));
        const json = await response.json();

        expect(response.status).toBe(401);
        expect(json.success).toBe(false);
        expect(json.error.code).toBe('UNAUTHORIZED');
    });

    it('returns validation error for invalid plan', async () => {
        const response = await POST(createRequest({ plan: 'BASIC' }));
        const json = await response.json();

        expect(response.status).toBe(400);
        expect(json.success).toBe(false);
        expect(json.error.code).toBe('VALIDATION_ERROR');
        expect(mockCreateRazorpaySubscription).not.toHaveBeenCalled();
    });

    it('creates subscription for valid request', async () => {
        const response = await POST(createRequest({ plan: 'PRO' }));
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toEqual({
            subscriptionId: 'sub_123',
            shortUrl: 'https://rzp.io/i/sub_123',
            status: 'created',
        });
        expect(mockCreateRazorpaySubscription).toHaveBeenCalledWith({
            userId: 'user_1',
            plan: 'PRO',
            userEmail: 'user@example.com',
            userName: 'Test User',
        });
    });

    it('returns internal error when service fails', async () => {
        mockCreateRazorpaySubscription.mockRejectedValue(new Error('provider unavailable'));

        const response = await POST(createRequest({ plan: 'ENTERPRISE' }));
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json.success).toBe(false);
        expect(json.error.code).toBe('INTERNAL_SERVER_ERROR');
    });
});

