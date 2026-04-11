import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { POST } from '../route';

const { mockGetRazorpayCredentials } = vi.hoisted(() => ({
    mockGetRazorpayCredentials: vi.fn(),
}));

const {
    mockFindPaymentUnique,
    mockUpdatePayment,
    mockUpdateManyPayments,
    mockUpdateScan,
    mockTransaction,
} = vi.hoisted(() => ({
    mockFindPaymentUnique: vi.fn(),
    mockUpdatePayment: vi.fn(),
    mockUpdateManyPayments: vi.fn(),
    mockUpdateScan: vi.fn(),
    mockTransaction: vi.fn(),
}));

const { mockSetnx, mockExpire, mockRedisDel } = vi.hoisted(() => ({
    mockSetnx: vi.fn(),
    mockExpire: vi.fn(),
    mockRedisDel: vi.fn(),
}));

const { mockLogAuditEvent } = vi.hoisted(() => ({
    mockLogAuditEvent: vi.fn(),
}));

vi.mock('@/lib/security/env', () => ({
    getRazorpayCredentials: mockGetRazorpayCredentials,
}));

vi.mock('@/lib/prisma', () => ({
    prisma: {
        payment: {
            findUnique: mockFindPaymentUnique,
            update: mockUpdatePayment,
            updateMany: mockUpdateManyPayments,
        },
        scan: {
            update: mockUpdateScan,
        },
        $transaction: mockTransaction,
    },
}));

vi.mock('@/lib/cache/redis', () => ({
    redisClient: {
        setnx: mockSetnx,
        expire: mockExpire,
        del: mockRedisDel,
    },
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

describe('POST /api/payment/webhook', () => {
    const secret = 'webhook_secret';

    const signBody = (body: string) =>
        crypto.createHmac('sha256', secret).update(body).digest('hex');

    const createRequest = (
        body: string,
        headers: Record<string, string> = {},
    ) =>
        new NextRequest('http://localhost:3000/api/payment/webhook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
            body,
        });

    beforeEach(() => {
        vi.clearAllMocks();
        mockGetRazorpayCredentials.mockReturnValue({ webhookSecret: secret });
        mockSetnx.mockResolvedValue(1);
        mockExpire.mockResolvedValue(1);
        mockRedisDel.mockResolvedValue(1);
        mockUpdatePayment.mockResolvedValue({ id: 'payment_1' });
        mockUpdateScan.mockResolvedValue({ id: 'scan_1' });
        mockUpdateManyPayments.mockResolvedValue({ count: 1 });
        mockTransaction.mockResolvedValue([]);
        mockLogAuditEvent.mockResolvedValue(undefined);
    });

    it('returns validation error when signature header is missing', async () => {
        const body = JSON.stringify({ event: 'payment.captured', payload: { payment: { entity: { order_id: 'order_1', id: 'pay_1' } } } });
        const response = await POST(createRequest(body));
        const json = await response.json();

        expect(response.status).toBe(400);
        expect(json.success).toBe(false);
        expect(json.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns validation error when signature is invalid', async () => {
        const body = JSON.stringify({ event: 'payment.captured', payload: { payment: { entity: { order_id: 'order_1', id: 'pay_1' } } } });
        const response = await POST(createRequest(body, { 'x-razorpay-signature': '0'.repeat(64) }));
        const json = await response.json();

        expect(response.status).toBe(400);
        expect(json.success).toBe(false);
        expect(json.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns duplicate response when webhook event id was already processed', async () => {
        const body = JSON.stringify({
            event: 'payment.captured',
            payload: { payment: { entity: { order_id: 'order_ABC123', id: 'pay_1' } } },
        });
        const signature = signBody(body);
        mockSetnx.mockResolvedValue(0);

        const response = await POST(
            createRequest(body, {
                'x-razorpay-signature': signature,
                'x-razorpay-event-id': 'evt_dup_1',
            }),
        );
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toEqual({ received: true, status: 'duplicate' });
        expect(mockFindPaymentUnique).not.toHaveBeenCalled();
    });

    it('handles payment.captured by updating payment+scan and invalidating cache', async () => {
        const body = JSON.stringify({
            event: 'payment.captured',
            payload: {
                payment: {
                    entity: { order_id: 'order_ABC123', id: 'pay_1', status: 'captured' },
                },
            },
        });
        const signature = signBody(body);

        mockFindPaymentUnique.mockResolvedValue({
            id: 'payment_1',
            scanId: 'scan_1',
            status: 'CREATED',
            userId: 'user_1',
            amount: 19900,
        });

        const response = await POST(
            createRequest(body, {
                'x-razorpay-signature': signature,
                'x-razorpay-event-id': 'evt_1',
                'x-forwarded-for': '10.0.0.1',
            }),
        );
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toEqual({ received: true });
        expect(mockExpire).toHaveBeenCalledWith('webhook:lock:evt_1', 86400);
        expect(mockTransaction).toHaveBeenCalledTimes(1);
        expect(mockRedisDel).toHaveBeenCalledWith('report:scan_1');
        expect(mockLogAuditEvent).toHaveBeenCalled();
    });

    it('handles payment.failed by marking payment records failed', async () => {
        const body = JSON.stringify({
            event: 'payment.failed',
            payload: {
                payment: {
                    entity: { order_id: 'order_ABC123', id: 'pay_failed', status: 'failed' },
                },
            },
        });
        const signature = signBody(body);

        const response = await POST(createRequest(body, { 'x-razorpay-signature': signature }));
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toEqual({ received: true });
        expect(mockUpdateManyPayments).toHaveBeenCalledWith({
            where: { razorpayOrderId: 'order_ABC123' },
            data: { status: 'FAILED' },
        });
    });

    it('returns not found when captured event order does not map to an internal payment', async () => {
        const body = JSON.stringify({
            event: 'payment.captured',
            payload: {
                payment: {
                    entity: { order_id: 'order_UNKNOWN', id: 'pay_unknown', status: 'captured' },
                },
            },
        });
        const signature = signBody(body);
        mockFindPaymentUnique.mockResolvedValue(null);

        const response = await POST(createRequest(body, { 'x-razorpay-signature': signature }));
        const json = await response.json();

        expect(response.status).toBe(404);
        expect(json.success).toBe(false);
        expect(json.error.code).toBe('NOT_FOUND');
        expect(mockTransaction).not.toHaveBeenCalled();
    });

    it('ignores unsupported payment events without mutating payment records', async () => {
        const body = JSON.stringify({
            event: 'payment.authorized',
            payload: {
                payment: {
                    entity: { order_id: 'order_ABC123', id: 'pay_auth', status: 'authorized' },
                },
            },
        });
        const signature = signBody(body);

        const response = await POST(createRequest(body, { 'x-razorpay-signature': signature }));
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toEqual({ received: true });
        expect(mockFindPaymentUnique).not.toHaveBeenCalled();
        expect(mockUpdateManyPayments).not.toHaveBeenCalled();
        expect(mockTransaction).not.toHaveBeenCalled();
    });
});
