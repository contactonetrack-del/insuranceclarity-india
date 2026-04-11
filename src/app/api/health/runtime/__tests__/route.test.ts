import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from '../route';

const { mockPingDatabase } = vi.hoisted(() => ({
    mockPingDatabase: vi.fn(),
}));

const { mockRedisIsConfigured } = vi.hoisted(() => ({
    mockRedisIsConfigured: vi.fn(),
}));

const { mockGetQueueProvider, mockGetPublicAppUrl } = vi.hoisted(() => ({
    mockGetQueueProvider: vi.fn(),
    mockGetPublicAppUrl: vi.fn(),
}));

const { mockGetGeminiApiKey } = vi.hoisted(() => ({
    mockGetGeminiApiKey: vi.fn(),
}));

const { mockLoggerError } = vi.hoisted(() => ({
    mockLoggerError: vi.fn(),
}));

vi.mock('@/services/ops.service', () => ({
    pingDatabase: mockPingDatabase,
}));

vi.mock('@/lib/cache/redis', () => ({
    redisClient: {
        isConfigured: mockRedisIsConfigured,
    },
}));

vi.mock('@/lib/queue/config', () => ({
    getQueueProvider: mockGetQueueProvider,
    getPublicAppUrl: mockGetPublicAppUrl,
}));

vi.mock('@/lib/security/env', () => ({
    getGeminiApiKey: mockGetGeminiApiKey,
}));

vi.mock('@/lib/logger', () => ({
    logger: {
        error: mockLoggerError,
    },
}));

describe('GET /api/health/runtime', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockPingDatabase.mockResolvedValue(undefined);
        mockRedisIsConfigured.mockReturnValue(true);
        mockGetQueueProvider.mockReturnValue('qstash');
        mockGetPublicAppUrl.mockReturnValue('https://app.insuranceclarity.in');
        mockGetGeminiApiKey.mockReturnValue('gemini-key');
    });

    it('returns healthy status for all healthy critical checks', async () => {
        const response = await GET();
        const payload = await response.json();

        expect(response.status).toBe(200);
        expect(payload).toMatchObject({
            healthy: true,
            status: 'HEALTHY',
            degradedChecks: [],
            warningChecks: [],
            checks: {
                database: { healthy: true },
                redis: { healthy: true },
                queue: {
                    healthy: true,
                    provider: 'qstash',
                    publicAppUrl: 'https://app.insuranceclarity.in',
                },
                ai: {
                    healthy: true,
                    provider: 'gemini',
                },
            },
        });
        expect(typeof payload.timestamp).toBe('string');
        expect(mockLoggerError).not.toHaveBeenCalled();
    });

    it('returns degraded status when database check fails', async () => {
        mockPingDatabase.mockRejectedValue(new Error('db unavailable'));

        const response = await GET();
        const payload = await response.json();

        expect(response.status).toBe(503);
        expect(payload).toMatchObject({
            healthy: false,
            status: 'DEGRADED',
            degradedChecks: ['database'],
            warningChecks: [],
            checks: {
                database: {
                    healthy: false,
                    message: 'db unavailable',
                },
            },
        });
        expect(mockLoggerError).toHaveBeenCalledWith(
            expect.objectContaining({
                action: 'health.runtime.degraded',
                degradedChecks: ['database'],
            }),
        );
    });

    it('returns degraded status when queue public app URL is invalid', async () => {
        mockGetPublicAppUrl.mockImplementation(() => {
            throw new Error('public app URL missing');
        });

        const response = await GET();
        const payload = await response.json();

        expect(response.status).toBe(503);
        expect(payload).toMatchObject({
            healthy: false,
            status: 'DEGRADED',
            degradedChecks: ['queue'],
            checks: {
                queue: {
                    healthy: false,
                    provider: 'qstash',
                    message: 'public app URL missing',
                },
            },
        });
    });

    it('falls back queue provider to unknown when provider lookup throws', async () => {
        mockGetQueueProvider.mockImplementation(() => {
            throw new Error('provider unavailable');
        });

        const response = await GET();
        const payload = await response.json();

        expect(response.status).toBe(503);
        expect(payload).toMatchObject({
            healthy: false,
            status: 'DEGRADED',
            degradedChecks: ['queue'],
            checks: {
                queue: {
                    healthy: false,
                    provider: 'unknown',
                    message: 'provider unavailable',
                },
            },
        });
    });

    it('keeps healthy status but emits redis warning when redis is not configured', async () => {
        mockRedisIsConfigured.mockReturnValue(false);

        const response = await GET();
        const payload = await response.json();

        expect(response.status).toBe(200);
        expect(payload).toMatchObject({
            healthy: true,
            status: 'HEALTHY',
            degradedChecks: [],
            warningChecks: ['redis'],
            checks: {
                redis: {
                    healthy: false,
                },
            },
        });
        expect(mockLoggerError).not.toHaveBeenCalled();
    });

    it('returns degraded status when AI credentials are missing', async () => {
        mockGetGeminiApiKey.mockImplementation(() => {
            throw new Error('GEMINI_API_KEY missing');
        });

        const response = await GET();
        const payload = await response.json();

        expect(response.status).toBe(503);
        expect(payload).toMatchObject({
            healthy: false,
            status: 'DEGRADED',
            degradedChecks: ['ai'],
            checks: {
                ai: {
                    healthy: false,
                    provider: 'gemini',
                    message: 'GEMINI_API_KEY missing',
                },
            },
        });
    });
});
