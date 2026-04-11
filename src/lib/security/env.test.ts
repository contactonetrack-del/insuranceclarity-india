import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    getAdminEmails,
    getBetterAuthBaseUrl,
    getGeminiApiKey,
    getGoogleOAuthConfig,
    getRazorpayCredentials,
    getRazorpayPlanId,
    getRazorpayPublicKeyId,
    getResendApiKey,
    getSanityConfig,
    getSanityToken,
    isPlaceholderValue,
    requireStrongBetterAuthSecret,
    requireStrongNextAuthSecret,
    validateAlertConfig,
} from './env';

const { mockWarn, mockError } = vi.hoisted(() => ({
    mockWarn: vi.fn(),
    mockError: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
    logger: {
        warn: mockWarn,
        error: mockError,
    },
}));

const originalEnv = { ...process.env };

describe('lib/security/env', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env = { ...originalEnv };
        delete process.env.VERCEL_ENV;
        delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
        vi.stubEnv('NODE_ENV', 'development');
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it('detects placeholder values', () => {
        expect(isPlaceholderValue('replace_with_real_secret')).toBe(true);
        expect(isPlaceholderValue('')).toBe(true);
        expect(isPlaceholderValue('live-value')).toBe(false);
    });

    it('warns on weak auth secrets in development and returns the value', () => {
        process.env.NEXTAUTH_SECRET = 'weak-secret';
        process.env.BETTER_AUTH_SECRET = 'another-weak-secret';

        expect(requireStrongNextAuthSecret()).toBe('weak-secret');
        expect(requireStrongBetterAuthSecret()).toBe('another-weak-secret');
        expect(mockWarn).toHaveBeenCalledTimes(2);
    });

    it('throws on weak auth secrets in production', () => {
        vi.stubEnv('NODE_ENV', 'production');
        process.env.NEXTAUTH_SECRET = 'weak-secret';
        process.env.BETTER_AUTH_SECRET = 'weak-secret';

        expect(() => requireStrongNextAuthSecret()).toThrow(/NEXTAUTH_SECRET is weak/);
        expect(() => requireStrongBetterAuthSecret()).toThrow(/BETTER_AUTH_SECRET is weak/);
    });

    it('resolves Better Auth base URL from available candidates and strips trailing slash', () => {
        process.env.NEXT_PUBLIC_APP_URL = 'https://insuranceclarity.in/';

        expect(getBetterAuthBaseUrl()).toBe('https://insuranceclarity.in');
    });

    it('falls back to localhost in development and throws in production when base URL is missing', () => {
        expect(getBetterAuthBaseUrl()).toBe('http://localhost:3000');
        expect(mockWarn).not.toHaveBeenCalled();

        vi.stubEnv('NODE_ENV', 'production');
        expect(() => getBetterAuthBaseUrl()).toThrow(/Better Auth base URL is missing/);
    });

    it('parses admin emails and ignores empty values', () => {
        process.env.ADMIN_EMAILS = 'Admin@Example.com, ops@example.com , ,';

        expect(getAdminEmails()).toEqual(['admin@example.com', 'ops@example.com']);
    });

    it('returns google oauth config when both values are live and disables it otherwise', () => {
        process.env.GOOGLE_CLIENT_ID = 'google-client-id';
        process.env.GOOGLE_CLIENT_SECRET = 'google-client-secret';
        expect(getGoogleOAuthConfig()).toEqual({
            clientId: 'google-client-id',
            clientSecret: 'google-client-secret',
        });

        process.env.GOOGLE_CLIENT_ID = 'placeholder';
        process.env.GOOGLE_CLIENT_SECRET = '';
        expect(getGoogleOAuthConfig()).toBeNull();
        expect(mockWarn).toHaveBeenCalledWith(
            expect.objectContaining({ action: 'auth.google.disabled' }),
        );
    });

    it('warns for missing Gemini and Resend keys in development and throws in production', () => {
        expect(getGeminiApiKey()).toBe('');
        expect(getResendApiKey()).toBe('');
        expect(mockWarn).toHaveBeenCalledWith(
            expect.objectContaining({ action: 'ai.gemini_key.missing' }),
        );
        expect(mockWarn).toHaveBeenCalledWith(
            expect.objectContaining({ action: 'email.resend_key.missing' }),
        );

        vi.stubEnv('NODE_ENV', 'production');
        expect(() => getGeminiApiKey()).toThrow(/GEMINI_API_KEY is missing/);
        expect(() => getResendApiKey()).toThrow(/RESEND_API_KEY is missing/);
    });

    it('returns Razorpay credentials and warns when webhook secret is missing', () => {
        process.env.RAZORPAY_KEY_ID = 'rzp_live_12345';
        process.env.RAZORPAY_KEY_SECRET = 'secret_value';
        process.env.RAZORPAY_WEBHOOK_SECRET = '';

        expect(getRazorpayCredentials()).toEqual({
            keyId: 'rzp_live_12345',
            keySecret: 'secret_value',
            webhookSecret: '',
        });
        expect(mockWarn).toHaveBeenCalledWith(
            expect.objectContaining({ action: 'payment.webhook.unconfigured' }),
        );
    });

    it('rejects missing or test Razorpay credentials in production', () => {
        process.env.RAZORPAY_KEY_ID = 'rzp_test_12345';
        process.env.RAZORPAY_KEY_SECRET = 'secret_value';
        process.env.RAZORPAY_WEBHOOK_SECRET = 'webhook_secret';
        vi.stubEnv('NODE_ENV', 'production');

        expect(() => getRazorpayCredentials()).toThrow(/test keys in production/);

        process.env.RAZORPAY_KEY_ID = '';
        expect(() => getRazorpayCredentials()).toThrow(/Razorpay credentials are missing/);
    });

    it('validates the public Razorpay key and plan ids', () => {
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID = 'rzp_live_public';
        expect(getRazorpayPublicKeyId()).toBe('rzp_live_public');
        expect(() => getRazorpayPublicKeyId('rzp_live_private')).toThrow(/public key mismatch/);

        process.env.RAZORPAY_PLAN_ID_PRO = 'plan_live_pro_001';
        process.env.RAZORPAY_PLAN_ID_ENTERPRISE = 'plan_live_enterprise_001';
        expect(getRazorpayPlanId('PRO')).toBe('plan_live_pro_001');
        expect(getRazorpayPlanId('ENTERPRISE')).toBe('plan_live_enterprise_001');

        process.env.RAZORPAY_PLAN_ID_PRO = 'rzp_live_wrong';
        expect(() => getRazorpayPlanId('PRO')).toThrow(/Invalid RAZORPAY_PLAN_ID_PRO format/);
    });

    it('returns Sanity config when present and throws for hosted production gaps', () => {
        process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'project123';
        process.env.NEXT_PUBLIC_SANITY_DATASET = 'production';
        expect(getSanityConfig()).toEqual({
            projectId: 'project123',
            dataset: 'production',
            isConfigured: true,
        });

        delete process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
        delete process.env.NEXT_PUBLIC_SANITY_DATASET;
        expect(getSanityConfig()).toEqual({
            projectId: 'missing-project-id',
            dataset: 'production',
            isConfigured: false,
        });

        vi.stubEnv('NODE_ENV', 'production');
        process.env.VERCEL_ENV = 'production';
        expect(() => getSanityConfig()).toThrow(/Sanity project configuration is missing/);
    });

    it('returns null for missing Sanity token and warns when a long production token is present', () => {
        expect(getSanityToken()).toBeNull();

        vi.stubEnv('NODE_ENV', 'production');
        process.env.SANITY_API_TOKEN = 'a'.repeat(60);
        expect(getSanityToken()).toBe('a'.repeat(60));
        expect(mockWarn).toHaveBeenCalledWith(
            expect.objectContaining({ action: 'sanity.token.scope_check' }),
        );
    });

    it('validates monitoring webhooks with environment-aware severity', () => {
        expect(validateAlertConfig()).toEqual({ discord: null, slack: null });
        expect(mockWarn).toHaveBeenCalledWith(
            expect.objectContaining({ action: 'alerts.config.missing' }),
        );

        vi.stubEnv('NODE_ENV', 'production');
        vi.clearAllMocks();
        expect(validateAlertConfig()).toEqual({ discord: null, slack: null });
        expect(mockError).toHaveBeenCalledWith(
            expect.objectContaining({ action: 'alerts.config.missing' }),
        );

        process.env.DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1';
        process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/1';
        expect(validateAlertConfig()).toEqual({
            discord: 'https://discord.com/api/webhooks/1',
            slack: 'https://hooks.slack.com/services/1',
        });
    });
});
