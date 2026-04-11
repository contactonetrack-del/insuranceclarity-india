import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { POST } from '../route';

const { mockAuth } = vi.hoisted(() => ({
    mockAuth: vi.fn(),
}));

const { mockValidateCsrfRequest } = vi.hoisted(() => ({
    mockValidateCsrfRequest: vi.fn(),
}));

const { mockEnforceAiRateLimit } = vi.hoisted(() => ({
    mockEnforceAiRateLimit: vi.fn(),
}));

const { mockCheckAndIncrementScanLimit } = vi.hoisted(() => ({
    mockCheckAndIncrementScanLimit: vi.fn(),
}));

const { mockCountAnonymousScansSince, mockFindExistingScan, mockCreateScan } = vi.hoisted(() => ({
    mockCountAnonymousScansSince: vi.fn(),
    mockFindExistingScan: vi.fn(),
    mockCreateScan: vi.fn(),
}));

const { mockRedisIsConfigured, mockRedisGet, mockRedisSet } = vi.hoisted(() => ({
    mockRedisIsConfigured: vi.fn(),
    mockRedisGet: vi.fn(),
    mockRedisSet: vi.fn(),
}));

const { mockGetLimitsForPlan } = vi.hoisted(() => ({
    mockGetLimitsForPlan: vi.fn(),
}));

const { mockGenerateScanClaimToken } = vi.hoisted(() => ({
    mockGenerateScanClaimToken: vi.fn(),
}));

const { mockSendScanLimitNudgeEmail } = vi.hoisted(() => ({
    mockSendScanLimitNudgeEmail: vi.fn(),
}));

const { mockUploadDocument } = vi.hoisted(() => ({
    mockUploadDocument: vi.fn(),
}));

vi.mock('@/auth', () => ({
    auth: mockAuth,
}));

vi.mock('@/lib/security/csrf', () => ({
    validateCsrfRequest: mockValidateCsrfRequest,
}));

vi.mock('@/lib/security/ai-rate-limit', () => ({
    enforceAiRateLimit: mockEnforceAiRateLimit,
}));

vi.mock('@/lib/subscriptions/enforce-plan', () => ({
    checkAndIncrementScanLimit: mockCheckAndIncrementScanLimit,
}));

vi.mock('@/services/report.service', () => ({
    countAnonymousScansSince: mockCountAnonymousScansSince,
    findExistingScan: mockFindExistingScan,
    createScan: mockCreateScan,
}));

vi.mock('@/lib/cache/redis', () => ({
    redisClient: {
        isConfigured: mockRedisIsConfigured,
        get: mockRedisGet,
        set: mockRedisSet,
    },
}));

vi.mock('@/lib/subscriptions/plan-limits', () => ({
    getLimitsForPlan: mockGetLimitsForPlan,
}));

vi.mock('@/lib/security/scan-claim', () => ({
    generateScanClaimToken: mockGenerateScanClaimToken,
}));

vi.mock('@/services/email.service', () => ({
    sendScanLimitNudgeEmail: mockSendScanLimitNudgeEmail,
}));

vi.mock('@/lib/storage/document-store', () => ({
    uploadDocument: mockUploadDocument,
}));

vi.mock('@/services/pdf.service', () => ({
    validatePdfBuffer: vi.fn(),
}));

vi.mock('@/services/pdf-extraction.server', () => ({
    extractTextFromPdf: vi.fn(),
}));

vi.mock('@/lib/queue/scan-queue', () => ({
    enqueueScanJob: vi.fn(),
}));

vi.mock('@/lib/queue/jobs', () => ({
    queue: {
        dispatch: vi.fn(),
    },
}));

vi.mock('@/lib/analytics/funnel', () => ({
    trackFunnelStep: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

describe('POST /api/upload', () => {
    const createUploadRequest = (
        body: FormData,
        headers: Record<string, string> = {},
    ) =>
        new NextRequest('http://localhost:3000/api/upload', {
            method: 'POST',
            headers,
            body,
        });

    beforeEach(() => {
        vi.clearAllMocks();
        mockValidateCsrfRequest.mockReturnValue(null);
        mockAuth.mockResolvedValue(null);
        mockEnforceAiRateLimit.mockResolvedValue({
            allowed: true,
            limit: 3,
            remaining: 2,
            retryAfterSeconds: 0,
        });
        mockCheckAndIncrementScanLimit.mockResolvedValue(undefined);
        mockCountAnonymousScansSince.mockResolvedValue(0);
        mockFindExistingScan.mockResolvedValue(null);
        mockCreateScan.mockResolvedValue({ id: 'scan_1' });
        mockRedisIsConfigured.mockReturnValue(false);
        mockRedisGet.mockResolvedValue(null);
        mockRedisSet.mockResolvedValue(undefined);
        mockGetLimitsForPlan.mockReturnValue({ maxScansPerMonth: 20 });
        mockGenerateScanClaimToken.mockReturnValue('claim_token');
        mockSendScanLimitNudgeEmail.mockResolvedValue(undefined);
        mockUploadDocument.mockResolvedValue('https://example.com/file.pdf');
    });

    it('returns csrf validation response when csrf check fails', async () => {
        mockValidateCsrfRequest.mockReturnValue(
            NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 }),
        );

        const response = await POST(createUploadRequest(new FormData()));
        const json = await response.json();

        expect(response.status).toBe(403);
        expect(json.error).toBe('Invalid CSRF token');
    });

    it('returns 429 when AI scan rate limit is exceeded', async () => {
        mockEnforceAiRateLimit.mockResolvedValue({
            allowed: false,
            limit: 3,
            remaining: 0,
            retryAfterSeconds: 17,
        });

        const response = await POST(
            createUploadRequest(new FormData(), { 'x-forwarded-for': '203.0.113.7' }),
        );
        const json = await response.json();

        expect(response.status).toBe(429);
        expect(json.success).toBe(false);
        expect(json.error.code).toBe('RATE_LIMIT_EXCEEDED');
        expect(json.error.details).toEqual({ retryAfterSeconds: 17 });
    });

    it('returns 402 and sends nudge email when authenticated plan limit is exceeded', async () => {
        mockAuth.mockResolvedValue({
            user: {
                id: 'user_1',
                email: 'user@example.com',
                name: 'Ravi',
                plan: 'FREE',
            },
        });
        mockCheckAndIncrementScanLimit.mockRejectedValue(new Error('Monthly scan limit reached'));

        const response = await POST(createUploadRequest(new FormData()));
        const json = await response.json();

        expect(response.status).toBe(402);
        expect(json).toEqual({
            error: 'Monthly scan limit reached',
            upgradeUrl: '/pricing',
        });
        expect(mockSendScanLimitNudgeEmail).toHaveBeenCalledWith('user@example.com', {
            userName: 'Ravi',
            plan: 'FREE',
            monthlyLimit: 20,
            locale: 'en',
        });
    });

    it('returns 402 when anonymous daily scan cap is reached', async () => {
        mockCountAnonymousScansSince.mockResolvedValue(3);

        const response = await POST(
            createUploadRequest(new FormData(), { 'x-forwarded-for': '203.0.113.9' }),
        );
        const json = await response.json();

        expect(response.status).toBe(402);
        expect(json.upgradeUrl).toBe('/pricing');
        expect(json.error).toContain('free anonymous scan limit (3/day)');
    });

    it('returns 400 when multipart payload does not include a file', async () => {
        const response = await POST(createUploadRequest(new FormData()));
        const json = await response.json();

        expect(response.status).toBe(400);
        expect(json.success).toBe(false);
        expect(json.error.code).toBe('VALIDATION_ERROR');
        expect(json.error.message).toBe('No file provided. Please upload a PDF.');
    });
});
