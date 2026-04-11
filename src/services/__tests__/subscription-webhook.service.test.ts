import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    cancelSubscriptionByRazorpayId,
    completePauseOrExpireAndDowngrade,
    findSubscriptionByRazorpayId,
} from '../subscription-webhook.service';

const {
    mockFindByRazorpaySubscriptionId,
    mockCancelByRazorpaySubscriptionId,
    mockCompletePauseOrExpireAndDowngrade,
} = vi.hoisted(() => ({
    mockFindByRazorpaySubscriptionId: vi.fn(),
    mockCancelByRazorpaySubscriptionId: vi.fn(),
    mockCompletePauseOrExpireAndDowngrade: vi.fn(),
}));

vi.mock('@/repositories/subscription.repository', () => ({
    subscriptionRepository: {
        findByRazorpaySubscriptionId: mockFindByRazorpaySubscriptionId,
        cancelByRazorpaySubscriptionId: mockCancelByRazorpaySubscriptionId,
        completePauseOrExpireAndDowngrade: mockCompletePauseOrExpireAndDowngrade,
    },
}));

describe('subscription-webhook.service repository delegation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('delegates subscription webhook persistence operations to repository', async () => {
        mockFindByRazorpaySubscriptionId.mockResolvedValue({ id: 'sub_1', userId: 'user_1', plan: 'PRO' });
        mockCancelByRazorpaySubscriptionId.mockResolvedValue({ id: 'sub_1', status: 'CANCELLED' });
        mockCompletePauseOrExpireAndDowngrade.mockResolvedValue([{ id: 'sub_1' }, { id: 'user_1' }]);

        const findResult = await findSubscriptionByRazorpayId('sub_razor_1');
        const cancelResult = await cancelSubscriptionByRazorpayId('sub_razor_1');
        const completeResult = await completePauseOrExpireAndDowngrade({
            razorpaySubscriptionId: 'sub_razor_1',
            status: 'PAUSED',
            userId: 'user_1',
        });

        expect(mockFindByRazorpaySubscriptionId).toHaveBeenCalledWith('sub_razor_1');
        expect(mockCancelByRazorpaySubscriptionId).toHaveBeenCalledWith('sub_razor_1');
        expect(mockCompletePauseOrExpireAndDowngrade).toHaveBeenCalledWith({
            razorpaySubscriptionId: 'sub_razor_1',
            status: 'PAUSED',
            userId: 'user_1',
        });

        expect(findResult).toEqual({ id: 'sub_1', userId: 'user_1', plan: 'PRO' });
        expect(cancelResult).toEqual({ id: 'sub_1', status: 'CANCELLED' });
        expect(completeResult).toEqual([{ id: 'sub_1' }, { id: 'user_1' }]);
    });
});
