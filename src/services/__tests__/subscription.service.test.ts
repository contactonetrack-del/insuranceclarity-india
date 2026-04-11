import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import crypto from 'crypto';
import {
    activateSubscription,
    cancelSubscription,
    createRazorpaySubscription,
    verifyWebhookSignature,
} from '../subscription.service';

const {
    mockInfo,
    mockWarn,
    mockSendWelcomeEmail,
    mockGetRazorpayPlanId,
    mockFindLatestActiveOrCreatedForUser,
    mockUpsertCreatedSubscription,
    mockFindForActivation,
    mockActivateAndUpgradeUser,
    mockFindByRazorpaySubscriptionIdForCancel,
    mockCancelByRazorpaySubscriptionIdWithTimestamp,
    mockDowngradeUserPlan,
    mockCreateSubscription,
    mockCancelProviderSubscription,
    mockAfter,
} = vi.hoisted(() => ({
    mockInfo: vi.fn(),
    mockWarn: vi.fn(),
    mockSendWelcomeEmail: vi.fn(),
    mockGetRazorpayPlanId: vi.fn(),
    mockFindLatestActiveOrCreatedForUser: vi.fn(),
    mockUpsertCreatedSubscription: vi.fn(),
    mockFindForActivation: vi.fn(),
    mockActivateAndUpgradeUser: vi.fn(),
    mockFindByRazorpaySubscriptionIdForCancel: vi.fn(),
    mockCancelByRazorpaySubscriptionIdWithTimestamp: vi.fn(),
    mockDowngradeUserPlan: vi.fn(),
    mockCreateSubscription: vi.fn(),
    mockCancelProviderSubscription: vi.fn(),
    mockAfter: vi.fn((callback: () => void) => callback()),
}));

vi.mock('@/lib/logger', () => ({
    logger: {
        info: mockInfo,
        warn: mockWarn,
    },
}));

vi.mock('@/services/email.service', () => ({
    sendWelcomeEmail: mockSendWelcomeEmail,
}));

vi.mock('@/lib/security/env', () => ({
    getRazorpayPlanId: mockGetRazorpayPlanId,
}));

vi.mock('@/repositories/subscription.repository', () => ({
    subscriptionRepository: {
        findLatestActiveOrCreatedForUser: mockFindLatestActiveOrCreatedForUser,
        upsertCreatedSubscription: mockUpsertCreatedSubscription,
        findForActivation: mockFindForActivation,
        activateAndUpgradeUser: mockActivateAndUpgradeUser,
        findByRazorpaySubscriptionIdForCancel: mockFindByRazorpaySubscriptionIdForCancel,
        cancelByRazorpaySubscriptionIdWithTimestamp: mockCancelByRazorpaySubscriptionIdWithTimestamp,
        downgradeUserPlan: mockDowngradeUserPlan,
    },
}));

vi.mock('@/lib/payments/provider', () => ({
    getPaymentProvider: () => ({
        createSubscription: mockCreateSubscription,
        cancelSubscription: mockCancelProviderSubscription,
    }),
}));

vi.mock('next/server', async () => {
    const actual = await vi.importActual<typeof import('next/server')>('next/server');
    return {
        ...actual,
        after: mockAfter,
    };
});

describe('subscription.service', () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
        vi.clearAllMocks();
        process.env = { ...originalEnv, NODE_ENV: 'development' };
        process.env.RAZORPAY_WEBHOOK_SECRET = 'webhook_secret';
        mockGetRazorpayPlanId.mockReturnValue('plan_live_pro_001');
        mockCreateSubscription.mockResolvedValue({
            id: 'sub_123',
            planId: 'plan_live_pro_001',
            shortUrl: 'https://pay.example.com/sub_123',
            status: 'created',
        });
        mockSendWelcomeEmail.mockResolvedValue(true);
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('creates a subscription through the payment provider and persists it', async () => {
        mockFindLatestActiveOrCreatedForUser.mockResolvedValue(null);
        mockUpsertCreatedSubscription.mockResolvedValue({ id: 'db_sub_1' });

        const result = await createRazorpaySubscription({
            userId: 'user_1',
            plan: 'PRO',
            userEmail: 'demo@example.com',
            userName: 'Demo User',
        });

        expect(mockGetRazorpayPlanId).toHaveBeenCalledWith('PRO');
        expect(mockCreateSubscription).toHaveBeenCalledWith(
            expect.objectContaining({
                planId: 'plan_live_pro_001',
                notifyEmail: 'demo@example.com',
                userId: 'user_1',
            }),
        );
        expect(mockUpsertCreatedSubscription).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: 'user_1',
                razorpaySubscriptionId: 'sub_123',
            }),
        );
        expect(result).toEqual({
            subscriptionId: 'sub_123',
            planId: 'plan_live_pro_001',
            shortUrl: 'https://pay.example.com/sub_123',
            status: 'created',
        });
    });

    it('blocks duplicate active subscriptions that are still within the active period', async () => {
        mockFindLatestActiveOrCreatedForUser.mockResolvedValue({
            status: 'ACTIVE',
            currentPeriodEnd: new Date('2099-01-01T00:00:00Z'),
        });

        await expect(
            createRazorpaySubscription({
                userId: 'user_1',
                plan: 'PRO',
                userEmail: 'demo@example.com',
                userName: 'Demo User',
            }),
        ).rejects.toThrow(/already have an active subscription/);
        expect(mockCreateSubscription).not.toHaveBeenCalled();
    });

    it('returns null when activating an unknown subscription', async () => {
        mockFindForActivation.mockResolvedValue(null);

        await expect(
            activateSubscription('sub_missing', new Date('2024-01-01'), new Date('2024-02-01')),
        ).resolves.toBeNull();
        expect(mockWarn).toHaveBeenCalledWith(
            expect.objectContaining({ action: 'subscription.activate.notfound', razorpaySubscriptionId: 'sub_missing' }),
        );
    });

    it('activates a subscription, upgrades the user, and schedules the welcome email', async () => {
        mockFindForActivation.mockResolvedValue({
            id: 'db_sub_1',
            userId: 'user_1',
            plan: 'PRO',
            user: { email: 'demo@example.com', name: 'Demo User' },
        });
        mockActivateAndUpgradeUser.mockResolvedValue(undefined);

        const result = await activateSubscription(
            'sub_123',
            new Date('2024-01-01T00:00:00Z'),
            new Date('2024-02-01T00:00:00Z'),
        );

        expect(mockActivateAndUpgradeUser).toHaveBeenCalledWith(
            expect.objectContaining({ razorpaySubscriptionId: 'sub_123', userId: 'user_1', plan: 'PRO' }),
        );
        expect(mockAfter).toHaveBeenCalledTimes(1);
        expect(mockSendWelcomeEmail).toHaveBeenCalledWith('demo@example.com', { userName: 'Demo User' });
        expect(result).toEqual({ id: 'db_sub_1', userId: 'user_1' });
    });

    it('cancels subscriptions locally even when the provider call fails and downgrades on immediate cancel', async () => {
        mockCancelProviderSubscription.mockRejectedValue(new Error('provider unavailable'));
        mockFindByRazorpaySubscriptionIdForCancel.mockResolvedValue({ id: 'db_sub_1', userId: 'user_1' });
        mockCancelByRazorpaySubscriptionIdWithTimestamp.mockResolvedValue(undefined);
        mockDowngradeUserPlan.mockResolvedValue(undefined);

        await cancelSubscription('sub_123', false);

        expect(mockWarn).toHaveBeenCalledWith(
            expect.objectContaining({ action: 'subscription.cancel.razorpay.failed' }),
        );
        expect(mockCancelByRazorpaySubscriptionIdWithTimestamp).toHaveBeenCalledWith(
            'sub_123',
            expect.any(Date),
        );
        expect(mockDowngradeUserPlan).toHaveBeenCalledWith('user_1');
    });

    it('verifies webhook signatures with constant-time comparison semantics', () => {
        const rawBody = JSON.stringify({ ok: true });
        const signature = crypto.createHmac('sha256', 'webhook_secret').update(rawBody).digest('hex');

        expect(verifyWebhookSignature(rawBody, signature)).toBe(true);

        delete process.env.RAZORPAY_WEBHOOK_SECRET;
        expect(verifyWebhookSignature(rawBody, signature)).toBe(false);
        expect(mockWarn).toHaveBeenCalledWith(
            expect.objectContaining({ action: 'webhook.secret.missing' }),
        );
    });
});
