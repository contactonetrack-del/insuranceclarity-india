import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '../route';

const {
    mockGetQueueSecret,
    mockVerifyQstashRequestSignature,
    mockProcessScanFromStoredFile,
    mockMarkScanFailed,
    mockQuoteUpdate,
    mockLogSecurityEvent,
} = vi.hoisted(() => ({
    mockGetQueueSecret: vi.fn(),
    mockVerifyQstashRequestSignature: vi.fn(),
    mockProcessScanFromStoredFile: vi.fn(),
    mockMarkScanFailed: vi.fn(),
    mockQuoteUpdate: vi.fn(),
    mockLogSecurityEvent: vi.fn(),
}));

vi.mock('@/lib/queue/config', () => ({
    getQueueSecret: mockGetQueueSecret,
    verifyQstashRequestSignature: mockVerifyQstashRequestSignature,
}));

vi.mock('@/lib/queue/scan-queue', () => ({
    processScanFromStoredFile: mockProcessScanFromStoredFile,
}));

vi.mock('@/services/report.service', () => ({
    markScanFailed: mockMarkScanFailed,
}));

vi.mock('@/repositories/quote.repository', () => ({
    quoteRepository: {
        update: mockQuoteUpdate,
    },
}));

vi.mock('@/lib/logger', () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
    },
    logSecurityEvent: mockLogSecurityEvent,
}));

describe('POST /api/jobs/document-worker', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetQueueSecret.mockReturnValue('queue-secret');
        mockVerifyQstashRequestSignature.mockResolvedValue(true);
        mockProcessScanFromStoredFile.mockResolvedValue(undefined);
        mockMarkScanFailed.mockResolvedValue(undefined);
        mockQuoteUpdate.mockResolvedValue(undefined);
    });

    it('returns 401 for invalid HTTP queue secret', async () => {
        const response = await POST(
            new Request('http://localhost:3000/api/jobs/document-worker', {
                method: 'POST',
                headers: {
                    'x-queue-secret': 'wrong-secret',
                },
                body: JSON.stringify({}),
            }),
        );
        const json = await response.json();

        expect(response.status).toBe(401);
        expect(json).toEqual({ error: 'Unauthorized' });
        expect(mockLogSecurityEvent).toHaveBeenCalledWith(
            'worker.auth.rejected',
            'high',
            expect.objectContaining({ provider: 'unknown' }),
        );
    });

    it('returns 400 for missing required envelope fields', async () => {
        const response = await POST(
            new Request('http://localhost:3000/api/jobs/document-worker', {
                method: 'POST',
                headers: {
                    'x-queue-secret': 'queue-secret',
                },
                body: JSON.stringify({ jobName: 'PROCESS_SCAN_ANALYSIS' }),
            }),
        );
        const json = await response.json();

        expect(response.status).toBe(400);
        expect(json.error).toContain('Invalid job envelope');
    });

    it('returns 400 for unknown job type', async () => {
        const response = await POST(
            new Request('http://localhost:3000/api/jobs/document-worker', {
                method: 'POST',
                headers: {
                    'x-queue-secret': 'queue-secret',
                },
                body: JSON.stringify({
                    jobId: 'job_1',
                    jobName: 'UNKNOWN_JOB',
                    payload: {},
                }),
            }),
        );
        const json = await response.json();

        expect(response.status).toBe(400);
        expect(json).toEqual({ error: 'Unknown job: UNKNOWN_JOB' });
    });

    it('returns 401 for invalid qstash signature', async () => {
        mockVerifyQstashRequestSignature.mockResolvedValueOnce(false);

        const body = JSON.stringify({
            jobId: 'job_1',
            jobName: 'PROCESS_SCAN_ANALYSIS',
            payload: { scanId: 'scan_123' },
        });
        const response = await POST(
            new Request('http://localhost:3000/api/jobs/document-worker', {
                method: 'POST',
                headers: {
                    'upstash-signature': 'bad-signature',
                    'x-queue-secret': 'queue-secret',
                    'x-queue-provider': 'qstash',
                },
                body,
            }),
        );
        const json = await response.json();

        expect(response.status).toBe(401);
        expect(json).toEqual({ error: 'Unauthorized' });
        expect(mockVerifyQstashRequestSignature).toHaveBeenCalledWith(body, 'bad-signature');
    });

    it('returns 401 when qstash request is missing the forwarded queue secret', async () => {
        const response = await POST(
            new Request('http://localhost:3000/api/jobs/document-worker', {
                method: 'POST',
                headers: {
                    'upstash-signature': 'valid-signature',
                    'x-queue-secret': 'wrong-secret',
                    'x-queue-provider': 'qstash',
                },
                body: JSON.stringify({
                    jobId: 'job_2',
                    jobName: 'PROCESS_SCAN_ANALYSIS',
                    payload: { scanId: 'scan_456' },
                }),
            }),
        );
        const json = await response.json();

        expect(response.status).toBe(401);
        expect(json).toEqual({ error: 'Unauthorized' });
    });

    it('returns 500 and marks scan failed when scan analysis worker throws', async () => {
        mockProcessScanFromStoredFile.mockRejectedValueOnce(new Error('processor crashed'));

        const response = await POST(
            new Request('http://localhost:3000/api/jobs/document-worker', {
                method: 'POST',
                headers: {
                    'x-queue-secret': 'queue-secret',
                },
                body: JSON.stringify({
                    jobId: 'job_scan_1',
                    jobName: 'PROCESS_SCAN_ANALYSIS',
                    payload: {
                        scanId: 'scan_123',
                    },
                }),
            }),
        );
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json).toEqual({ error: 'Worker Failed' });
        expect(mockMarkScanFailed).toHaveBeenCalledWith('scan_123');
    });

    it('marks quote documents ready for valid quote document jobs', async () => {
        const response = await POST(
            new Request('http://localhost:3000/api/jobs/document-worker', {
                method: 'POST',
                headers: {
                    'x-queue-secret': 'queue-secret',
                },
                body: JSON.stringify({
                    jobId: 'job_quote_1',
                    jobName: 'GENERATE_QUOTE_DOCUMENT',
                    payload: {
                        quoteId: 'quote_123',
                    },
                }),
            }),
        );
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toEqual({ success: true, jobId: 'job_quote_1' });
        expect(mockQuoteUpdate).toHaveBeenCalledWith('quote_123', { status: 'READY' });
    });
});
