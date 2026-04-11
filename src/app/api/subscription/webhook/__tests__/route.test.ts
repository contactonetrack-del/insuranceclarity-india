import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../route';

const { mockVerifyWebhookSignature, mockActivateSubscription } = vi.hoisted(() => ({
    mockVerifyWebhookSignature: vi.fn(),
    mockActivateSubscription: vi.fn(),
}));

const { mockSetnx, mockExpire } = vi.hoisted(() => ({
    mockSetnx: vi.fn(),
    mockExpire: vi.fn(),
}));

const {
    mockFindSubscriptionByRazorpayId,
    mockCancelSubscriptionByRazorpayId,
    mockCompletePauseOrExpireAndDowngrade,
} = vi.hoisted(() => ({
    mockFindSubscriptionByRazorpayId: vi.fn(),
    mockCancelSubscriptionByRazorpayId: vi.fn(),
    mockCompletePauseOrExpireAndDowngrade: vi.fn(),
}));

const { mockLogAuditEvent } = vi.hoisted(() => ({
    mockLogAuditEvent: vi.fn(),
}));

vi.mock('@/services/subscription.service', () => ({
    verifyWebhookSignature: mockVerifyWebhookSignature,
    activateSubscription: mockActivateSubscription,
}));

vi.mock('@/lib/cache/redis', () => ({
    redisClient: {
        setnx: mockSetnx,
        expire: mockExpire,
    },
}));

vi.mock('@/services/subscription-webhook.service', () => ({
    findSubscriptionByRazorpayId: mockFindSubscriptionByRazorpayId,
    cancelSubscriptionByRazorpayId: mockCancelSubscriptionByRazorpayId,
    completePauseOrExpireAndDowngrade: mockCompletePauseOrExpireAndDowngrade,
}));

vi.mock('@/services/audit.service', () => ({
    logAuditEvent: mockLogAuditEvent,
}));

vi.mock('@/lib/logger', () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

describe('POST /api/subscription/webhook', () => {
    const createRequest = (
        body: string,
        headers: Record<string, string> = {},
    ) =>
        new NextRequest('http://localhost:3000/api/subscription/webhook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-razorpay-signature': 'sig',
                ...headers,
            },
            body,
        });

    beforeEach(() => {
        vi.clearAllMocks();
        mockVerifyWebhookSignature.mockReturnValue(true);
        mockSetnx.mockResolvedValue(1);
        mockExpire.mockResolvedValue(1);
        mockActivateSubscription.mockResolvedValue({ id: 'sub_db_1', userId: 'user_1' });
        mockFindSubscriptionByRazorpayId.mockResolvedValue({
            id: 'sub_db_1',
            userId: 'user_1',
            plan: 'PRO',
        });
        mockCancelSubscriptionByRazorpayId.mockResolvedValue({ id: 'sub_db_1' });
        mockCompletePauseOrExpireAndDowngrade.mockResolvedValue([{ id: 'sub_db_1' }, { id: 'user_1' }]);
        mockLogAuditEvent.mockResolvedValue(undefined);
    });

    it('returns valid:false when signature verification fails', async () => {
        mockVerifyWebhookSignature.mockReturnValue(false);
        const body = JSON.stringify({ event: 'subscription.activated' });

        const response = await POST(createRequest(body));
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toEqual({ received: true, valid: false });
    });

    it('returns received:true when payload json is malformed', async () => {
        const response = await POST(createRequest('{bad-json'));
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toEqual({ received: true });
    });

    it('returns duplicate when same event id was already processed', async () => {
        mockSetnx.mockResolvedValue(0);
        const body = JSON.stringify({
            event: 'subscription.activated',
            payload: { subscription: { entity: { id: 'sub_razor_1', status: 'active' } } },
        });

        const response = await POST(createRequest(body, { 'x-razorpay-event-id': 'evt_sub_1' }));
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toEqual({ received: true, status: 'duplicate' });
        expect(mockActivateSubscription).not.toHaveBeenCalled();
    });

    it('handles subscription.activated via activateSubscription flow', async () => {
        const body = JSON.stringify({
            event: 'subscription.activated',
            payload: {
                subscription: {
                    entity: {
                        id: 'sub_razor_1',
                        status: 'active',
                        current_start: 1712707200,
                        current_end: 1715299200,
                    },
                },
            },
        });

        const response = await POST(createRequest(body, { 'x-razorpay-event-id': 'evt_sub_2' }));
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toEqual({ received: true });
        expect(mockActivateSubscription).toHaveBeenCalledWith(
            'sub_razor_1',
            expect.any(Date),
            expect.any(Date),
        );
        expect(mockLogAuditEvent).toHaveBeenCalled();
    });

    it('handles subscription.completed by downgrading user plan to FREE', async () => {
        const body = JSON.stringify({
            event: 'subscription.completed',
            payload: {
                subscription: {
                    entity: {
                        id: 'sub_razor_1',
                        status: 'completed',
                    },
                },
            },
        });

        const response = await POST(createRequest(body));
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toEqual({ received: true });
        expect(mockCompletePauseOrExpireAndDowngrade).toHaveBeenCalledWith({
            razorpaySubscriptionId: 'sub_razor_1',
            status: 'COMPLETED',
            userId: 'user_1',
        });
        expect(mockLogAuditEvent).toHaveBeenCalled();
    });

    it('returns early when webhook payload has no subscription id', async () => {
        const body = JSON.stringify({
            event: 'subscription.cancelled',
            payload: { subscription: { entity: { status: 'cancelled' } } },
        });

        const response = await POST(createRequest(body));
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toEqual({ received: true });
        expect(mockFindSubscriptionByRazorpayId).not.toHaveBeenCalled();
        expect(mockActivateSubscription).not.toHaveBeenCalled();
    });

    it('returns received:true for unhandled but valid subscription events', async () => {
        const body = JSON.stringify({
            event: 'subscription.pending',
            payload: {
                subscription: {
                    entity: {
                        id: 'sub_razor_auth_1',
                        status: 'pending',
                    },
                },
            },
        });

        const response = await POST(createRequest(body));
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toEqual({ received: true });
        expect(mockActivateSubscription).not.toHaveBeenCalled();
    });
});
