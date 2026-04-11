import type { Prisma } from '@prisma/client';
import { opsRepository } from '@/repositories/ops.repository';

export function pingDatabase() {
    return opsRepository.pingDatabase();
}

export function countCapturedPaymentsSince(date: Date) {
    return opsRepository.countCapturedPaymentsSince(date);
}

export function countScansSince(date: Date) {
    return opsRepository.countScansSince(date);
}

export function markStaleScansAndPayments(staleScanBefore: Date, stalePaymentBefore: Date) {
    return opsRepository.markStaleScansAndPayments(staleScanBefore, stalePaymentBefore);
}

export function findStaleCreatedPayments(before: Date) {
    return opsRepository.findStaleCreatedPayments(before);
}

export function failPaymentAndScan(paymentId: string, scanId?: string | null) {
    return opsRepository.failPaymentAndScan(paymentId, scanId);
}

export function findPendingPaymentsForReconciliation(before: Date, take: number) {
    return opsRepository.findPendingPaymentsForReconciliation(before, take);
}

export function countPendingPaymentsForReconciliation(before: Date) {
    return opsRepository.countPendingPaymentsForReconciliation(before);
}

export function countStaleCreatedPayments(before: Date) {
    return opsRepository.countStaleCreatedPayments(before);
}

export function countStaleScans(before: Date) {
    return opsRepository.countStaleScans(before);
}

export function reconcileCapturedPaymentById(paymentId: string, scanId: string, razorpayPaymentId: string) {
    return opsRepository.reconcileCapturedPaymentById(paymentId, scanId, razorpayPaymentId);
}

export function resetMonthlyScansForFreeAndPro() {
    return opsRepository.resetMonthlyScansForFreeAndPro();
}

export function findExpiredSubscriptions(now: Date) {
    return opsRepository.findExpiredSubscriptions(now);
}

export function downgradeExpiredSubscription(
    subscriptionId: string,
    userId: string,
    status: 'ACTIVE' | 'CANCELLED',
) {
    return opsRepository.downgradeExpiredSubscription(subscriptionId, userId, status);
}

export function findResultAccessScan(scanId: string) {
    return opsRepository.findResultAccessScan(scanId);
}

export function groupErrorLogsByCode(where: Prisma.ErrorLogWhereInput) {
    return opsRepository.groupErrorLogsByCode(where);
}

export function groupErrorLogsByRoute(where: Prisma.ErrorLogWhereInput) {
    return opsRepository.groupErrorLogsByRoute(where);
}

export function groupErrorLogsByStatus(where: Prisma.ErrorLogWhereInput) {
    return opsRepository.groupErrorLogsByStatus(where);
}

export function groupErrorLogsBySeverity(where: Prisma.ErrorLogWhereInput) {
    return opsRepository.groupErrorLogsBySeverity(where);
}

export function listRecentErrors(where: Prisma.ErrorLogWhereInput, take = 50) {
    return opsRepository.listRecentErrors(where, take);
}

export function listRateLimitAnomaliesSince(sinceDate: Date, take = 20) {
    return opsRepository.listRateLimitAnomaliesSince(sinceDate, take);
}

export function groupAffectedUsers(where: Prisma.ErrorLogWhereInput, take = 10) {
    return opsRepository.groupAffectedUsers(where, take);
}

export function countErrorLogs(where: Prisma.ErrorLogWhereInput) {
    return opsRepository.countErrorLogs(where);
}

export function countLeads() {
    return opsRepository.countLeads();
}

export function listLeadsBatch(cursor: string | undefined, take: number) {
    return opsRepository.listLeadsBatch(cursor, take);
}
