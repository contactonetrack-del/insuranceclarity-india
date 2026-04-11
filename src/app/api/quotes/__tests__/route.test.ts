import { describe, it, expect, vi, beforeEach } from 'vitest';
import { type NextRequest } from 'next/server';
import { POST } from '../route';

// mock the queue function
const { mockDispatch } = vi.hoisted(() => ({
    mockDispatch: vi.fn(),
}));

vi.mock('@/lib/queue/jobs', () => ({
    queue: {
        dispatch: mockDispatch,
    }
}));

// mock the session enforcer
const { mockEnforceRole } = vi.hoisted(() => ({
    mockEnforceRole: vi.fn(),
}));

const { mockLoggerInfo, mockLoggerError } = vi.hoisted(() => ({
    mockLoggerInfo: vi.fn(),
    mockLoggerError: vi.fn(),
}));

vi.mock('@/lib/auth/session', () => ({
    enforceRole: mockEnforceRole
}));

// Mock CSRF so tests don't need real headers
vi.mock('@/lib/security/csrf', () => ({
    validateCsrfRequest: vi.fn().mockReturnValue(null), // null = pass
}));

vi.mock('@/lib/logger', () => ({
    logger: {
        info: mockLoggerInfo,
        error: mockLoggerError,
    }
}));

describe('POST /api/quotes', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const createRequest = (body: unknown) => {
        return new Request('http://localhost:3000/api/quotes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        }) as unknown as NextRequest;
    };

    it('should process quote successfully for valid payload', async () => {
        mockEnforceRole.mockResolvedValue(true);
        mockDispatch.mockResolvedValue('job_789');

        const request = createRequest({ quoteId: 'QDOC-1234' });
        const response = await POST(request);
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.message).toBe('Quote processing started successfully');
        expect(json.jobId).toBe('job_789');
        expect(mockEnforceRole).toHaveBeenCalledWith('USER');
        expect(mockDispatch).toHaveBeenCalledWith('GENERATE_QUOTE_DOCUMENT', {
            quoteId: 'QDOC-1234',
            templateId: 'TERM_LIFE',
        });
    });

    it('should return 400 for missing quoteId', async () => {
        mockEnforceRole.mockResolvedValue(true);

        const request = createRequest({ invalidKey: 'QDOC-1234' });
        const response = await POST(request);
        const json = await response.json();

        expect(response.status).toBe(400);
        expect(json.error).toBe('Invalid payload format');
        expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('should return 403 if unauthorized', async () => {
        mockEnforceRole.mockRejectedValue(new Error('Unauthorized'));

        const request = createRequest({ quoteId: 'QDOC-1234' });
        const response = await POST(request);
        const json = await response.json();

        expect(response.status).toBe(403);
        expect(json.error).toBe('Unauthorized');
        expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('should return 500 when queue dispatch fails', async () => {
        mockEnforceRole.mockResolvedValue(true);
        mockDispatch.mockRejectedValue(new Error('queue unavailable'));

        const request = createRequest({ quoteId: 'QDOC-1234' });
        const response = await POST(request);
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json.error).toBe('Failed to process quote');
        expect(mockLoggerError).toHaveBeenCalledWith({
            action: 'quote.error',
            error: 'queue unavailable',
        });
    });
});
