import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { requireCronAuthorization } from './cron-auth';

const { mockLoggerWarn, mockLoggerError } = vi.hoisted(() => ({
    mockLoggerWarn: vi.fn(),
    mockLoggerError: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
    logger: {
        warn: mockLoggerWarn,
        error: mockLoggerError,
    },
}));

describe('requireCronAuthorization', () => {
    const originalCronSecret = process.env.CRON_SECRET;

    const createRequest = (headers: Record<string, string> = {}) =>
        new Request('http://localhost:3000/api/cron/test', {
            method: 'GET',
            headers,
        });

    beforeEach(() => {
        vi.clearAllMocks();
        process.env.CRON_SECRET = 'cron-secret';
    });

    afterEach(() => {
        process.env.CRON_SECRET = originalCronSecret;
    });

    it('returns null when bearer token matches configured secret', async () => {
        const result = requireCronAuthorization(createRequest({ authorization: 'Bearer cron-secret' }), {
            action: 'cron.test',
        });

        expect(result).toBeNull();
        expect(mockLoggerWarn).not.toHaveBeenCalled();
        expect(mockLoggerError).not.toHaveBeenCalled();
    });

    it('returns 401 when authorization header is missing', async () => {
        const result = requireCronAuthorization(createRequest(), { action: 'cron.test' });
        const payload = await result?.json();

        expect(result?.status).toBe(401);
        expect(payload).toEqual({ error: 'Unauthorized' });
        expect(mockLoggerWarn).toHaveBeenCalledWith(
            expect.objectContaining({ action: 'cron.test.unauthorized' }),
        );
    });

    it('returns 401 when authorization token is incorrect', async () => {
        const result = requireCronAuthorization(
            createRequest({ authorization: 'Bearer wrong-secret' }),
            { action: 'cron.test' },
        );
        const payload = await result?.json();

        expect(result?.status).toBe(401);
        expect(payload).toEqual({ error: 'Unauthorized' });
        expect(mockLoggerWarn).toHaveBeenCalledWith(
            expect.objectContaining({ action: 'cron.test.unauthorized' }),
        );
    });

    it('returns 500 when CRON_SECRET is not configured', async () => {
        delete process.env.CRON_SECRET;

        const result = requireCronAuthorization(
            createRequest({ authorization: 'Bearer cron-secret' }),
            { action: 'cron.test' },
        );
        const payload = await result?.json();

        expect(result?.status).toBe(500);
        expect(payload).toEqual({ error: 'Server misconfiguration' });
        expect(mockLoggerError).toHaveBeenCalledWith(
            expect.objectContaining({ action: 'cron.test.misconfigured' }),
        );
    });
});
