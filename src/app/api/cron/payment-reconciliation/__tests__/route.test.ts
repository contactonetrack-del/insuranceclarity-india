import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from '../route';
import { resetPaymentProviderForTests } from '@/lib/payments/provider';

const {
    mockFindPendingPaymentsForReconciliation,
    mockReconcileCapturedPaymentById,
    mockMarkPaymentFailedById,
    mockGetRazorpayCredentials,
    mockSendUrgentWebhook,
    mockOrdersFetch,
    mockOrdersFetchPayments,
} = vi.hoisted(() => ({
    mockFindPendingPaymentsForReconciliation: vi.fn(),
    mockReconcileCapturedPaymentById: vi.fn(),
    mockMarkPaymentFailedById: vi.fn(),
    mockGetRazorpayCredentials: vi.fn(),
    mockSendUrgentWebhook: vi.fn(),
    mockOrdersFetch: vi.fn(),
    mockOrdersFetchPayments: vi.fn(),
}));

vi.mock('@/services/ops.service', () => ({
    findPendingPaymentsForReconciliation: mockFindPendingPaymentsForReconciliation,
    reconcileCapturedPaymentById: mockReconcileCapturedPaymentById,
}));

vi.mock('@/services/payment.service', () => ({
    markPaymentFailedById: mockMarkPaymentFailedById,
}));

vi.mock('@/lib/security/env', () => ({
    getRazorpayCredentials: mockGetRazorpayCredentials,
}));

vi.mock('@/lib/observability/alerts', () => ({
    sendUrgentWebhook: mockSendUrgentWebhook,
}));

vi.mock('razorpay', () => ({
    default: class RazorpayMock {
        orders = {
            fetch: mockOrdersFetch,
            fetchPayments: mockOrdersFetchPayments,
        };
    },
}));

vi.mock('@/lib/logger', () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

describe('GET /api/cron/payment-reconciliation', () => {
    const originalCronSecret = process.env.CRON_SECRET;

    const createRequest = (headers: Record<string, string> = {}) =>
        new Request('http://localhost:3000/api/cron/payment-reconciliation', {
            method: 'GET',
            headers,
        });

    beforeEach(() => {
        vi.clearAllMocks();
        resetPaymentProviderForTests();
        process.env.CRON_SECRET = 'cron-secret';
        mockGetRazorpayCredentials.mockReturnValue({ keyId: 'key_id', keySecret: 'key_secret' });
        mockFindPendingPaymentsForReconciliation.mockResolvedValue([]);
        mockOrdersFetch.mockResolvedValue({ status: 'created', created_at: Math.floor(Date.now() / 1000) });
        mockOrdersFetchPayments.mockResolvedValue({ items: [] });
    });

    afterEach(() => {
        process.env.CRON_SECRET = originalCronSecret;
    });

    it('returns 401 when authorization header is invalid', async () => {
        const response = await GET(createRequest({ Authorization: 'Bearer wrong' }));
        const json = await response.json();

        expect(response.status).toBe(401);
        expect(json).toEqual({ error: 'Unauthorized' });
        expect(mockFindPendingPaymentsForReconciliation).not.toHaveBeenCalled();
    });

    it('returns no-op message when no pending payments exist', async () => {
        const response = await GET(createRequest({ Authorization: 'Bearer cron-secret' }));
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toEqual({ message: 'No pending payments to reconcile' });
    });

    it('reconciles captured payments and sends warning on high count', async () => {
        const pending = Array.from({ length: 6 }).map((_, index) => ({
            id: `pay_${index}`,
            scanId: `scan_${index}`,
            razorpayOrderId: `order_${index}`,
        }));
        mockFindPendingPaymentsForReconciliation.mockResolvedValue(pending);
        mockOrdersFetch.mockResolvedValue({ status: 'paid', created_at: Math.floor(Date.now() / 1000) });
        mockOrdersFetchPayments.mockResolvedValue({
            items: [{ id: 'rzp_pay_1', status: 'captured' }],
        });

        const response = await GET(createRequest({ Authorization: 'Bearer cron-secret' }));
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toEqual({ message: 'Reconciled 6 payments.', swept: 6 });
        expect(mockReconcileCapturedPaymentById).toHaveBeenCalledTimes(6);
        expect(mockSendUrgentWebhook).toHaveBeenCalledWith(
            'High Payment Reconciliation Rate',
            expect.stringContaining('Reconciled 6 dropped webhooks'),
            'WARNING',
        );
    });

    it('marks very old uncaptured orders as failed', async () => {
        mockFindPendingPaymentsForReconciliation.mockResolvedValue([
            { id: 'pay_old', scanId: 'scan_old', razorpayOrderId: 'order_old' },
        ]);
        mockOrdersFetch.mockResolvedValue({
            status: 'created',
            created_at: Math.floor(Date.now() / 1000) - 3 * 24 * 60 * 60,
        });

        const response = await GET(createRequest({ Authorization: 'Bearer cron-secret' }));

        expect(response.status).toBe(200);
        expect(mockMarkPaymentFailedById).toHaveBeenCalledWith('pay_old');
    });

    it('continues sweep when an individual order fetch fails', async () => {
        mockFindPendingPaymentsForReconciliation.mockResolvedValue([
            { id: 'pay_err', scanId: 'scan_err', razorpayOrderId: 'order_err' },
        ]);
        mockOrdersFetch.mockRejectedValueOnce(new Error('razorpay timeout'));

        const response = await GET(createRequest({ Authorization: 'Bearer cron-secret' }));
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toEqual({ message: 'Reconciled 0 payments.', swept: 1 });
        expect(mockReconcileCapturedPaymentById).not.toHaveBeenCalled();
        expect(mockMarkPaymentFailedById).not.toHaveBeenCalled();
    });

    it('returns 500 and sends critical alert on fatal failure', async () => {
        mockGetRazorpayCredentials.mockImplementation(() => {
            throw new Error('missing keys');
        });

        const response = await GET(createRequest({ Authorization: 'Bearer cron-secret' }));
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json).toEqual({ error: 'missing keys' });
        expect(mockSendUrgentWebhook).toHaveBeenCalledWith(
            'Cron Fatal Error',
            expect.stringContaining('Payment Reconciliation crashed: missing keys'),
            'CRITICAL',
        );
    });
});
