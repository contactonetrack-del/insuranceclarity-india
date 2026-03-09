import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';

// mock the queue function
const { mockQueue } = vi.hoisted(() => ({
    mockQueue: vi.fn(),
}));

vi.mock('@/lib/queue/client', () => ({
    queueQuoteProcessing: mockQueue
}));

// mock the session enforcer
const { mockEnforceRole } = vi.hoisted(() => ({
    mockEnforceRole: vi.fn(),
}));

vi.mock('@/lib/auth/session', () => ({
    enforceRole: mockEnforceRole
}));

describe('POST /api/quotes', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const createRequest = (body: unknown) => {
        return new Request('http://localhost:3000/api/quotes', {
            method: 'POST',
            body: JSON.stringify(body),
        });
    };

    it('should process quote successfully for valid payload', async () => {
        mockEnforceRole.mockResolvedValue(true);
        mockQueue.mockResolvedValue({ id: 'job_789' });

        const request = createRequest({ quoteId: 'QDOC-1234' });
        const response = await POST(request);
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.message).toBe('Quote processing started successfully');
        expect(json.jobId).toBe('job_789');
        expect(mockEnforceRole).toHaveBeenCalledWith('USER');
        expect(mockQueue).toHaveBeenCalledWith('QDOC-1234');
    });

    it('should return 400 for missing quoteId', async () => {
        mockEnforceRole.mockResolvedValue(true);

        const request = createRequest({ invalidKey: 'QDOC-1234' });
        const response = await POST(request);
        const json = await response.json();

        expect(response.status).toBe(400);
        expect(json.error).toBe('Invalid payload format');
        expect(mockQueue).not.toHaveBeenCalled();
    });

    it('should return 403 if unauthorized', async () => {
        mockEnforceRole.mockRejectedValue(new Error('Unauthorized'));

        const request = createRequest({ quoteId: 'QDOC-1234' });
        const response = await POST(request);
        const json = await response.json();

        expect(response.status).toBe(403);
        expect(json.error).toBe('Unauthorized');
        expect(mockQueue).not.toHaveBeenCalled();
    });
});
