import { afterEach, describe, expect, it } from 'vitest';
import {
    getPublicAppUrl,
    getQueueProvider,
    getQueueSecret,
    getQstashRetries,
    getQstashRetryDelayExpression,
    getQstashTimeoutSeconds,
} from './config';

const ORIGINAL_ENV = { ...process.env };

function resetEnv(overrides: Record<string, string | undefined> = {}) {
    process.env = { ...ORIGINAL_ENV, ...overrides };
}

describe('queue config', () => {
    afterEach(() => {
        process.env = { ...ORIGINAL_ENV };
    });

    it('defaults provider to http when qstash token is absent', () => {
        resetEnv({
            QUEUE_PROVIDER: undefined,
            QSTASH_TOKEN: undefined,
        });

        expect(getQueueProvider()).toBe('http');
    });

    it('defaults provider to qstash when qstash token exists', () => {
        resetEnv({
            QUEUE_PROVIDER: undefined,
            QSTASH_TOKEN: 'qstash_test_token',
        });

        expect(getQueueProvider()).toBe('qstash');
    });

    it('respects explicit queue provider', () => {
        resetEnv({
            QUEUE_PROVIDER: 'http',
            QSTASH_TOKEN: 'qstash_test_token',
        });

        expect(getQueueProvider()).toBe('http');
    });

    it('throws when queue secret is placeholder or missing', () => {
        resetEnv({ QUEUE_SECRET: 'REPLACE_WITH_QUEUE_SECRET' });
        expect(() => getQueueSecret()).toThrowError();
    });

    it('returns public app url from env and strips trailing slash', () => {
        resetEnv({
            APP_BASE_URL: 'https://insuranceclarity.in/',
            NODE_ENV: 'production',
        });

        expect(getPublicAppUrl()).toBe('https://insuranceclarity.in');
    });

    it('falls back to localhost in non-production when public url is missing', () => {
        resetEnv({
            APP_BASE_URL: undefined,
            NEXT_PUBLIC_APP_URL: undefined,
            NEXTAUTH_URL: undefined,
            VERCEL_URL: undefined,
            NODE_ENV: 'development',
        });

        expect(getPublicAppUrl()).toBe('http://localhost:3000');
    });

    it('normalizes qstash retry tuning values', () => {
        resetEnv({
            QSTASH_MAX_DELIVERY_RETRIES: '99',
            QSTASH_RETRY_DELAY: '',
            QSTASH_DELIVERY_TIMEOUT_SECONDS: '9999',
        });

        expect(getQstashRetries()).toBe(10);
        expect(getQstashRetryDelayExpression()).toBe('min(60000, 1000 * pow(2, retried))');
        expect(getQstashTimeoutSeconds()).toBe(900);
    });
});

