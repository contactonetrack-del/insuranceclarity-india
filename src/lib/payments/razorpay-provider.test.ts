import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RazorpayPaymentProvider } from './razorpay-provider';

const {
    mockOrdersCreate,
    mockOrdersFetch,
    mockOrdersFetchPayments,
    mockGetRazorpayCredentials,
} = vi.hoisted(() => ({
    mockOrdersCreate: vi.fn(),
    mockOrdersFetch: vi.fn(),
    mockOrdersFetchPayments: vi.fn(),
    mockGetRazorpayCredentials: vi.fn(),
}));

vi.mock('@/lib/security/env', () => ({
    getRazorpayCredentials: mockGetRazorpayCredentials,
}));

vi.mock('razorpay', () => ({
    default: class RazorpayMock {
        orders = {
            create: mockOrdersCreate,
            fetch: mockOrdersFetch,
            fetchPayments: mockOrdersFetchPayments,
        };
    },
}));

describe('RazorpayPaymentProvider', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetRazorpayCredentials.mockReturnValue({
            keyId: 'rzp_test_key',
            keySecret: 'rzp_test_secret',
            webhookSecret: 'whsec_test',
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('creates and maps payment orders via provider interface', async () => {
        mockOrdersCreate.mockResolvedValue({
            id: 'order_123',
            status: 'created',
            created_at: 12345,
        });

        const provider = new RazorpayPaymentProvider();
        const order = await provider.createOrder({
            amount: 19900,
            currency: 'INR',
            receipt: 'scan_abc',
            notes: { scanId: 'scan_abc' },
        });

        expect(mockOrdersCreate).toHaveBeenCalledWith(
            expect.objectContaining({
                amount: 19900,
                currency: 'INR',
                receipt: 'scan_abc',
            }),
        );
        expect(order).toEqual({
            id: 'order_123',
            status: 'created',
            createdAtUnix: 12345,
        });
    });

    it('fetches order and payments via provider interface', async () => {
        mockOrdersFetch.mockResolvedValue({
            id: 'order_456',
            status: 'paid',
            created_at: 98765,
        });
        mockOrdersFetchPayments.mockResolvedValue({
            items: [
                { id: 'pay_1', status: 'captured' },
                { id: 'pay_2', status: 'failed' },
            ],
        });

        const provider = new RazorpayPaymentProvider();
        const order = await provider.fetchOrder('order_456');
        const payments = await provider.fetchOrderPayments('order_456');

        expect(order).toEqual({
            id: 'order_456',
            status: 'paid',
            createdAtUnix: 98765,
        });
        expect(payments.items).toHaveLength(2);
        expect(payments.items[0]).toEqual({ id: 'pay_1', status: 'captured' });
    });

    it('creates and cancels subscriptions via provider interface', async () => {
        const fetchMock = vi.fn()
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    id: 'sub_123',
                    plan_id: 'plan_pro',
                    short_url: 'https://rzp.io/sub_123',
                    status: 'created',
                }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({}),
            });
        vi.stubGlobal('fetch', fetchMock);

        const provider = new RazorpayPaymentProvider();
        const subscription = await provider.createSubscription({
            planId: 'plan_pro',
            totalCount: 12,
            quantity: 1,
            notifyEmail: 'user@example.com',
            userId: 'user_1',
            plan: 'PRO',
            userName: 'User',
        });
        await provider.cancelSubscription('sub_123', true);

        expect(subscription).toEqual({
            id: 'sub_123',
            planId: 'plan_pro',
            shortUrl: 'https://rzp.io/sub_123',
            status: 'created',
        });
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(fetchMock).toHaveBeenNthCalledWith(
            1,
            'https://api.razorpay.com/v1/subscriptions',
            expect.objectContaining({ method: 'POST' }),
        );
        expect(fetchMock).toHaveBeenNthCalledWith(
            2,
            'https://api.razorpay.com/v1/subscriptions/sub_123/cancel',
            expect.objectContaining({ method: 'POST' }),
        );
    });
});
