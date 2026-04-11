import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    countCapturedPaymentsSince,
    countErrorLogs,
    countLeads,
    countPendingPaymentsForReconciliation,
    countScansSince,
    countStaleCreatedPayments,
    countStaleScans,
    downgradeExpiredSubscription,
    failPaymentAndScan,
    findExpiredSubscriptions,
    findPendingPaymentsForReconciliation,
    findResultAccessScan,
    findStaleCreatedPayments,
    groupAffectedUsers,
    groupErrorLogsByCode,
    groupErrorLogsByRoute,
    groupErrorLogsBySeverity,
    groupErrorLogsByStatus,
    listLeadsBatch,
    listRateLimitAnomaliesSince,
    listRecentErrors,
    markStaleScansAndPayments,
    pingDatabase,
    reconcileCapturedPaymentById,
    resetMonthlyScansForFreeAndPro,
} from '../ops.service';

const mocks = vi.hoisted(() => ({
    pingDatabase: vi.fn(),
    countCapturedPaymentsSince: vi.fn(),
    countScansSince: vi.fn(),
    markStaleScansAndPayments: vi.fn(),
    findStaleCreatedPayments: vi.fn(),
    failPaymentAndScan: vi.fn(),
    findPendingPaymentsForReconciliation: vi.fn(),
    countPendingPaymentsForReconciliation: vi.fn(),
    countStaleCreatedPayments: vi.fn(),
    countStaleScans: vi.fn(),
    reconcileCapturedPaymentById: vi.fn(),
    resetMonthlyScansForFreeAndPro: vi.fn(),
    findExpiredSubscriptions: vi.fn(),
    downgradeExpiredSubscription: vi.fn(),
    findResultAccessScan: vi.fn(),
    groupErrorLogsByCode: vi.fn(),
    groupErrorLogsByRoute: vi.fn(),
    groupErrorLogsByStatus: vi.fn(),
    groupErrorLogsBySeverity: vi.fn(),
    listRecentErrors: vi.fn(),
    listRateLimitAnomaliesSince: vi.fn(),
    groupAffectedUsers: vi.fn(),
    countErrorLogs: vi.fn(),
    countLeads: vi.fn(),
    listLeadsBatch: vi.fn(),
}));

vi.mock('@/repositories/ops.repository', () => ({
    opsRepository: mocks,
}));

describe('ops.service delegation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('delegates all runtime ops helpers to opsRepository', async () => {
        const now = new Date('2024-01-01T00:00:00Z');
        const where = { severity: 'HIGH' };

        mocks.pingDatabase.mockResolvedValue(undefined);
        mocks.countCapturedPaymentsSince.mockResolvedValue(2);
        mocks.countScansSince.mockResolvedValue(5);
        mocks.markStaleScansAndPayments.mockResolvedValue([{ count: 1 }, { count: 2 }]);
        mocks.findStaleCreatedPayments.mockResolvedValue([{ id: 'payment_1' }]);
        mocks.failPaymentAndScan.mockResolvedValue(undefined);
        mocks.findPendingPaymentsForReconciliation.mockResolvedValue([{ id: 'payment_2' }]);
        mocks.countPendingPaymentsForReconciliation.mockResolvedValue(3);
        mocks.countStaleCreatedPayments.mockResolvedValue(4);
        mocks.countStaleScans.mockResolvedValue(5);
        mocks.reconcileCapturedPaymentById.mockResolvedValue(undefined);
        mocks.resetMonthlyScansForFreeAndPro.mockResolvedValue({ count: 10 });
        mocks.findExpiredSubscriptions.mockResolvedValue([{ id: 'sub_1' }]);
        mocks.downgradeExpiredSubscription.mockResolvedValue(undefined);
        mocks.findResultAccessScan.mockResolvedValue({ userId: 'user_1' });
        mocks.groupErrorLogsByCode.mockResolvedValue([{ errorCode: 'E1' }]);
        mocks.groupErrorLogsByRoute.mockResolvedValue([{ route: '/api/demo' }]);
        mocks.groupErrorLogsByStatus.mockResolvedValue([{ httpStatus: 500 }]);
        mocks.groupErrorLogsBySeverity.mockResolvedValue([{ severity: 'HIGH' }]);
        mocks.listRecentErrors.mockResolvedValue([{ errorCode: 'E1' }]);
        mocks.listRateLimitAnomaliesSince.mockResolvedValue([{ ipAddress: '127.0.0.1' }]);
        mocks.groupAffectedUsers.mockResolvedValue([{ userId: 'user_1' }]);
        mocks.countErrorLogs.mockResolvedValue(7);
        mocks.countLeads.mockResolvedValue(8);
        mocks.listLeadsBatch.mockResolvedValue([{ id: 'lead_1' }]);

        await pingDatabase();
        expect(await countCapturedPaymentsSince(now)).toBe(2);
        expect(await countScansSince(now)).toBe(5);
        expect(await markStaleScansAndPayments(now, now)).toEqual([{ count: 1 }, { count: 2 }]);
        expect(await findStaleCreatedPayments(now)).toEqual([{ id: 'payment_1' }]);
        await failPaymentAndScan('payment_1', 'scan_1');
        expect(await findPendingPaymentsForReconciliation(now, 20)).toEqual([{ id: 'payment_2' }]);
        expect(await countPendingPaymentsForReconciliation(now)).toBe(3);
        expect(await countStaleCreatedPayments(now)).toBe(4);
        expect(await countStaleScans(now)).toBe(5);
        await reconcileCapturedPaymentById('payment_1', 'scan_1', 'rzp_pay_1');
        expect(await resetMonthlyScansForFreeAndPro()).toEqual({ count: 10 });
        expect(await findExpiredSubscriptions(now)).toEqual([{ id: 'sub_1' }]);
        await downgradeExpiredSubscription('sub_1', 'user_1', 'ACTIVE');
        expect(await findResultAccessScan('scan_1')).toEqual({ userId: 'user_1' });
        expect(await groupErrorLogsByCode(where)).toEqual([{ errorCode: 'E1' }]);
        expect(await groupErrorLogsByRoute(where)).toEqual([{ route: '/api/demo' }]);
        expect(await groupErrorLogsByStatus(where)).toEqual([{ httpStatus: 500 }]);
        expect(await groupErrorLogsBySeverity(where)).toEqual([{ severity: 'HIGH' }]);
        expect(await listRecentErrors(where, 10)).toEqual([{ errorCode: 'E1' }]);
        expect(await listRateLimitAnomaliesSince(now, 5)).toEqual([{ ipAddress: '127.0.0.1' }]);
        expect(await groupAffectedUsers(where, 2)).toEqual([{ userId: 'user_1' }]);
        expect(await countErrorLogs(where)).toBe(7);
        expect(await countLeads()).toBe(8);
        expect(await listLeadsBatch('lead_1', 25)).toEqual([{ id: 'lead_1' }]);

        expect(mocks.countCapturedPaymentsSince).toHaveBeenCalledWith(now);
        expect(mocks.findPendingPaymentsForReconciliation).toHaveBeenCalledWith(now, 20);
        expect(mocks.listRecentErrors).toHaveBeenCalledWith(where, 10);
        expect(mocks.groupAffectedUsers).toHaveBeenCalledWith(where, 2);
        expect(mocks.listLeadsBatch).toHaveBeenCalledWith('lead_1', 25);
    });
});
