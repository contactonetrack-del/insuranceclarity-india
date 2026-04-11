import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SubscriptionRepository } from './subscription.repository';

const {
    mockCount,
    mockFindUnique,
    mockUpdate,
    mockFindFirst,
    mockUpsert,
    mockSubscriptionUpdate,
    mockUserUpdate,
    mockTransaction,
    mockLogDbQuery,
    mockError,
} = vi.hoisted(() => ({
    mockCount: vi.fn(),
    mockFindUnique: vi.fn(),
    mockUpdate: vi.fn(),
    mockFindFirst: vi.fn(),
    mockUpsert: vi.fn(),
    mockSubscriptionUpdate: vi.fn(),
    mockUserUpdate: vi.fn(),
    mockTransaction: vi.fn(),
    mockLogDbQuery: vi.fn(),
    mockError: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
    prisma: {
        subscription: {
            count: mockCount,
            findUnique: mockFindUnique,
            update: mockUpdate,
            findFirst: mockFindFirst,
            upsert: mockUpsert,
        },
        user: {
            update: mockUserUpdate,
        },
        $transaction: mockTransaction,
    },
}));

vi.mock('@/lib/logger', () => ({
    logDbQuery: mockLogDbQuery,
    logger: {
        error: mockError,
    },
}));

describe('SubscriptionRepository', () => {
    const repository = new SubscriptionRepository();

    beforeEach(() => {
        vi.clearAllMocks();
        mockSubscriptionUpdate.mockResolvedValue({ id: 'sub_1' });
        mockUserUpdate.mockResolvedValue({ id: 'user_1' });
        mockUpdate.mockResolvedValue({ id: 'sub_1' });
        mockTransaction.mockResolvedValue([{ id: 'sub_1' }, { id: 'user_1' }]);
    });

    it('counts active subscriptions', async () => {
        mockCount.mockResolvedValue(5);
        await expect(repository.countActive()).resolves.toBe(5);
        expect(mockCount).toHaveBeenCalledWith({ where: { status: 'ACTIVE' } });
    });

    it('finds and cancels subscriptions by Razorpay subscription id', async () => {
        mockFindUnique.mockResolvedValue({ id: 'sub_1', userId: 'user_1', plan: 'PRO' });

        await expect(repository.findByRazorpaySubscriptionId('rzp_sub_1')).resolves.toEqual({
            id: 'sub_1',
            userId: 'user_1',
            plan: 'PRO',
        });
        await expect(repository.findByRazorpaySubscriptionIdForCancel('rzp_sub_1')).resolves.toEqual({
            id: 'sub_1',
            userId: 'user_1',
            plan: 'PRO',
        });
        await expect(repository.cancelByRazorpaySubscriptionId('rzp_sub_1')).resolves.toEqual({ id: 'sub_1' });
        await expect(repository.cancelByRazorpaySubscriptionIdWithTimestamp('rzp_sub_1', new Date('2024-01-01'))).resolves.toEqual({ id: 'sub_1' });
    });

    it('finds the latest active or created subscription for a user', async () => {
        mockFindFirst.mockResolvedValue({ id: 'sub_1' });

        await expect(repository.findLatestActiveOrCreatedForUser('user_1')).resolves.toEqual({ id: 'sub_1' });
        expect(mockFindFirst).toHaveBeenCalledWith({
            where: {
                userId: 'user_1',
                status: { in: ['CREATED', 'AUTHENTICATED', 'ACTIVE'] },
            },
            orderBy: { createdAt: 'desc' },
        });
    });

    it('upserts created subscriptions', async () => {
        mockUpsert.mockResolvedValue({ id: 'sub_1' });

        await expect(
            repository.upsertCreatedSubscription({
                userId: 'user_1',
                plan: 'PRO',
                razorpaySubscriptionId: 'rzp_sub_1',
                razorpayPlanId: 'plan_1',
            }),
        ).resolves.toEqual({ id: 'sub_1' });

        expect(mockUpsert).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { razorpaySubscriptionId: 'rzp_sub_1' },
                create: expect.objectContaining({ status: 'CREATED' }),
                update: expect.objectContaining({ cancelledAt: null }),
            }),
        );
    });

    it('finds subscriptions for activation', async () => {
        mockFindUnique.mockResolvedValue({ id: 'sub_1', user: { email: 'demo@example.com' } });

        await expect(repository.findForActivation('rzp_sub_1')).resolves.toEqual({
            id: 'sub_1',
            user: { email: 'demo@example.com' },
        });
        expect(mockFindUnique).toHaveBeenCalledWith({
            where: { razorpaySubscriptionId: 'rzp_sub_1' },
            include: { user: { select: { email: true, name: true } } },
        });
    });

    it('uses transactions for activation and downgrade flows', async () => {
        mockUpdate.mockResolvedValueOnce({ id: 'sub_1' }).mockResolvedValueOnce({ id: 'sub_1' });

        await expect(
            repository.activateAndUpgradeUser({
                razorpaySubscriptionId: 'rzp_sub_1',
                userId: 'user_1',
                plan: 'PRO',
                currentPeriodStart: new Date('2024-01-01'),
                currentPeriodEnd: new Date('2024-02-01'),
            }),
        ).resolves.toEqual([{ id: 'sub_1' }, { id: 'user_1' }]);

        await expect(
            repository.completePauseOrExpireAndDowngrade({
                razorpaySubscriptionId: 'rzp_sub_1',
                status: 'PAUSED',
                userId: 'user_1',
            }),
        ).resolves.toEqual([{ id: 'sub_1' }, { id: 'user_1' }]);

        expect(mockTransaction).toHaveBeenCalledTimes(2);
    });

    it('downgrades user plan directly', async () => {
        mockUserUpdate.mockResolvedValue({ id: 'user_1', plan: 'FREE' });

        await expect(repository.downgradeUserPlan('user_1')).resolves.toEqual({ id: 'user_1', plan: 'FREE' });
        expect(mockUserUpdate).toHaveBeenCalledWith({
            where: { id: 'user_1' },
            data: { plan: 'FREE', planExpiresAt: null },
        });
    });

    it('logs and rethrows failures', async () => {
        const error = new Error('db failed');
        mockUpsert.mockRejectedValue(error);

        await expect(
            repository.upsertCreatedSubscription({
                userId: 'user_1',
                plan: 'PRO',
                razorpaySubscriptionId: 'rzp_sub_1',
                razorpayPlanId: 'plan_1',
            }),
        ).rejects.toThrow('db failed');
        expect(mockError).toHaveBeenCalledWith(
            expect.objectContaining({ action: 'upsertCreatedSubscription', model: 'Subscription', userId: 'user_1' }),
            'Repository Error: Subscription.upsertCreatedSubscription',
        );
    });
});
