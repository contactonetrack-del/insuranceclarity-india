import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
    mockWarn,
    mockRedisCtor,
    mockGet,
    mockSet,
    mockSetex,
    mockSetnx,
    mockDel,
    mockIncr,
    mockExpire,
    mockEval,
    mockKeys,
} = vi.hoisted(() => ({
    mockWarn: vi.fn(),
    mockRedisCtor: vi.fn(),
    mockGet: vi.fn(),
    mockSet: vi.fn(),
    mockSetex: vi.fn(),
    mockSetnx: vi.fn(),
    mockDel: vi.fn(),
    mockIncr: vi.fn(),
    mockExpire: vi.fn(),
    mockEval: vi.fn(),
    mockKeys: vi.fn(),
}));

vi.mock('@upstash/redis', () => ({
    Redis: mockRedisCtor,
}));

vi.mock('@/lib/logger', () => ({
    logger: {
        warn: mockWarn,
    },
}));

async function loadModule() {
    vi.resetModules();
    mockRedisCtor.mockImplementation(function RedisMock() {
        return {
            get: mockGet,
            set: mockSet,
            setex: mockSetex,
            setnx: mockSetnx,
            del: mockDel,
            incr: mockIncr,
            expire: mockExpire,
            eval: mockEval,
            keys: mockKeys,
        };
    });

    return import('./redis');
}

describe('lib/cache/redis', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.UPSTASH_REDIS_REST_URL = 'https://live.upstash.io';
        process.env.UPSTASH_REDIS_REST_TOKEN = 'live_token';
    });

    it('degrades gracefully when Redis is not configured and only logs once', async () => {
        delete process.env.UPSTASH_REDIS_REST_URL;
        delete process.env.UPSTASH_REDIS_REST_TOKEN;
        const { redisClient } = await loadModule();

        expect(await redisClient.get('missing')).toBeNull();
        expect(await redisClient.get('missing-again')).toBeNull();
        expect(redisClient.isConfigured()).toBe(false);
        expect(mockWarn).toHaveBeenCalledTimes(1);
        expect(mockRedisCtor).not.toHaveBeenCalled();
    });

    it('uses the live Redis client for normal operations', async () => {
        mockGet.mockResolvedValue('cached-value');
        mockSetex.mockResolvedValue('OK');
        mockSet.mockResolvedValue('OK');
        mockSetnx.mockResolvedValue(1);
        mockDel.mockResolvedValue(1);
        mockIncr.mockResolvedValue(2);
        mockExpire.mockResolvedValue(1);
        mockEval.mockResolvedValue('EVAL_OK');
        mockKeys.mockResolvedValue(['response:key']);
        const { redisClient } = await loadModule();

        expect(redisClient.isConfigured()).toBe(true);
        expect(await redisClient.get('demo')).toBe('cached-value');
        await redisClient.set('ttl-key', { ok: true }, { ex: 60 });
        await redisClient.set('plain-key', { ok: true });
        expect(await redisClient.setnx('lock-key', 'value')).toBe(1);
        await redisClient.del('ttl-key');
        expect(await redisClient.incr('counter')).toBe(2);
        await redisClient.expire('counter', 30);
        expect(await redisClient.eval('return 1', ['key'], ['arg'])).toBe('EVAL_OK');
        expect(await redisClient.keys('response:*')).toEqual(['response:key']);

        expect(mockSetex).toHaveBeenCalledWith('ttl-key', 60, JSON.stringify({ ok: true }));
        expect(mockSet).toHaveBeenCalledWith('plain-key', JSON.stringify({ ok: true }));
    });

    it('opens the circuit on transient failures and suppresses repeated client use during backoff', async () => {
        mockGet.mockRejectedValue(new Error('fetch failed'));
        const { redisClient } = await loadModule();

        expect(await redisClient.get('demo')).toBeNull();
        expect(await redisClient.get('demo-again')).toBeNull();
        expect(mockGet).toHaveBeenCalledTimes(1);
        expect(redisClient.isConfigured()).toBe(false);
        expect(mockWarn).toHaveBeenCalledWith(
            expect.objectContaining({ action: 'redis.circuit_open' }),
        );
    });

    it('logs and returns fallbacks on non-transient redis errors', async () => {
        mockGet.mockRejectedValue(new Error('permission denied'));
        mockSetnx.mockRejectedValue(new Error('permission denied'));
        mockIncr.mockRejectedValue(new Error('permission denied'));
        mockKeys.mockRejectedValue(new Error('permission denied'));
        const { redisClient } = await loadModule();

        expect(await redisClient.get('demo')).toBeNull();
        expect(await redisClient.setnx('lock-key', 'value')).toBe(1);
        expect(await redisClient.incr('counter')).toBe(0);
        expect(await redisClient.keys('response:*')).toEqual([]);
        expect(mockWarn).toHaveBeenCalledWith(
            expect.objectContaining({ action: 'redis.get.error', key: 'demo' }),
        );
    });
});
