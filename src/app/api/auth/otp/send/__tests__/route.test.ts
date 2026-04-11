import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse, type NextRequest } from 'next/server';
import { POST } from '../route';

const { mockSendSignInOtp } = vi.hoisted(() => ({
    mockSendSignInOtp: vi.fn(),
}));

const { mockValidateCsrfRequest } = vi.hoisted(() => ({
    mockValidateCsrfRequest: vi.fn(),
}));

const { mockNormalizeEmailForOtp } = vi.hoisted(() => ({
    mockNormalizeEmailForOtp: vi.fn((email: string) => email.trim().toLowerCase()),
}));

vi.mock('@/auth', () => ({
    sendSignInOtp: mockSendSignInOtp,
}));

vi.mock('@/lib/security/csrf', () => ({
    validateCsrfRequest: mockValidateCsrfRequest,
}));

vi.mock('@/lib/security/otp', () => ({
    normalizeEmailForOtp: mockNormalizeEmailForOtp,
}));

vi.mock('@/lib/logger', () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
    },
}));

describe('POST /api/auth/otp/send', () => {
    const createRequest = (body: unknown) => {
        return new Request('http://localhost:3000/api/auth/otp/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        }) as unknown as NextRequest;
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockValidateCsrfRequest.mockReturnValue(null);
    });

    it('sends OTP for valid payload and normalizes email', async () => {
        const request = createRequest({ email: '  USER@Example.com  ', locale: 'hi' });

        const response = await POST(request);
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toEqual({ success: true, message: 'OTP sent successfully' });
        expect(mockNormalizeEmailForOtp).toHaveBeenCalledWith('USER@Example.com');
        expect(mockSendSignInOtp).toHaveBeenCalledWith('user@example.com', 'hi', expect.any(Headers));
    });

    it('returns validation error for invalid payload', async () => {
        const request = createRequest({ email: 'not-an-email' });

        const response = await POST(request);
        const json = await response.json();

        expect(response.status).toBe(400);
        expect(json.success).toBe(false);
        expect(json.error.code).toBe('VALIDATION_ERROR');
        expect(mockSendSignInOtp).not.toHaveBeenCalled();
    });

    it('returns csrf response when csrf validation fails', async () => {
        mockValidateCsrfRequest.mockReturnValue(
            NextResponse.json({ success: false, error: { code: 'FORBIDDEN' } }, { status: 403 }),
        );

        const request = createRequest({ email: 'user@example.com' });
        const response = await POST(request);

        expect(response.status).toBe(403);
        expect(mockSendSignInOtp).not.toHaveBeenCalled();
    });

    it('maps rate-limit failures from provider to standardized 429 response', async () => {
        mockSendSignInOtp.mockRejectedValue(new Error('Too many OTP requests'));

        const request = createRequest({ email: 'user@example.com' });
        const response = await POST(request);
        const json = await response.json();

        expect(response.status).toBe(429);
        expect(json.success).toBe(false);
        expect(json.error.code).toBe('RATE_LIMIT_EXCEEDED');
    });

    it('maps unexpected provider errors to standardized 500 response', async () => {
        mockSendSignInOtp.mockRejectedValue(new Error('provider unavailable'));

        const request = createRequest({ email: 'user@example.com' });
        const response = await POST(request);
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json.success).toBe(false);
        expect(json.error.code).toBe('INTERNAL_SERVER_ERROR');
    });
});

