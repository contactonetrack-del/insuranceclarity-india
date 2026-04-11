import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const opsRepository = {
    async pingDatabase() {
        await prisma.$queryRaw`SELECT 1`;
    },

    countCapturedPaymentsSince(date: Date) {
        return prisma.payment.count({
            where: { status: 'CAPTURED', updatedAt: { gte: date } },
        });
    },

    countScansSince(date: Date) {
        return prisma.scan.count({ where: { createdAt: { gte: date } } });
    },

    sumReportTokensUsed() {
        return prisma.report.aggregate({ _sum: { tokensUsed: true } });
    },

    markStaleScansAndPayments(staleScanBefore: Date, stalePaymentBefore: Date) {
        return prisma.$transaction([
            prisma.scan.updateMany({
                where: { status: { in: ['PENDING', 'PROCESSING'] }, updatedAt: { lt: staleScanBefore } },
                data: { status: 'FAILED' },
            }),
            prisma.payment.updateMany({
                where: { status: 'CREATED', createdAt: { lt: stalePaymentBefore } },
                data: { status: 'FAILED' },
            }),
        ]);
    },

    findStaleCreatedPayments(before: Date) {
        return prisma.payment.findMany({
            where: { status: 'CREATED', createdAt: { lt: before } },
        });
    },

    async failPaymentAndScan(paymentId: string, scanId?: string | null) {
        await prisma.payment.update({ where: { id: paymentId }, data: { status: 'FAILED' } });
        if (scanId) {
            await prisma.scan.update({ where: { id: scanId }, data: { status: 'FAILED' } });
        }
    },

    findPendingPaymentsForReconciliation(before: Date, take: number) {
        return prisma.payment.findMany({
            where: { status: 'CREATED', createdAt: { lte: before } },
            take,
        });
    },

    countPendingPaymentsForReconciliation(before: Date) {
        return prisma.payment.count({
            where: { status: 'CREATED', createdAt: { lte: before } },
        });
    },

    countStaleCreatedPayments(before: Date) {
        return prisma.payment.count({
            where: { status: 'CREATED', createdAt: { lt: before } },
        });
    },

    countStaleScans(before: Date) {
        return prisma.scan.count({
            where: { status: { in: ['PENDING', 'PROCESSING'] }, updatedAt: { lt: before } },
        });
    },

    async reconcileCapturedPaymentById(paymentId: string, scanId: string, razorpayPaymentId: string) {
        await prisma.$transaction([
            prisma.payment.update({
                where: { id: paymentId },
                data: { status: 'CAPTURED', razorpayPaymentId },
            }),
            prisma.scan.update({
                where: { id: scanId },
                data: { isPaid: true },
            }),
        ]);
    },

    resetMonthlyScansForFreeAndPro() {
        return prisma.user.updateMany({
            where: { plan: { in: ['FREE', 'PRO'] } },
            data: { scansUsed: 0 },
        });
    },

    findExpiredSubscriptions(now: Date) {
        return prisma.subscription.findMany({
            where: {
                currentPeriodEnd: { lt: now },
                status: { in: ['ACTIVE', 'CANCELLED'] },
            },
            include: { user: true },
        });
    },

    async downgradeExpiredSubscription(subscriptionId: string, userId: string, status: 'ACTIVE' | 'CANCELLED') {
        await prisma.user.update({ where: { id: userId }, data: { plan: 'FREE' } });
        if (status === 'ACTIVE') {
            await prisma.subscription.update({ where: { id: subscriptionId }, data: { status: 'COMPLETED' } });
        }
    },

    findResultAccessScan(scanId: string) {
        return prisma.scan.findUnique({
            where: { id: scanId },
            select: { userId: true, ipAddress: true, fileName: true },
        });
    },

    groupErrorLogsByCode(where: Prisma.ErrorLogWhereInput) {
        return prisma.errorLog.groupBy({
            by: ['errorCode', 'severity'],
            where,
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
        });
    },

    groupErrorLogsByRoute(where: Prisma.ErrorLogWhereInput) {
        return prisma.errorLog.groupBy({
            by: ['route', 'method'],
            where,
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
        });
    },

    groupErrorLogsByStatus(where: Prisma.ErrorLogWhereInput) {
        return prisma.errorLog.groupBy({
            by: ['httpStatus'],
            where,
            _count: { id: true },
            orderBy: { httpStatus: 'asc' },
        });
    },

    groupErrorLogsBySeverity(where: Prisma.ErrorLogWhereInput) {
        return prisma.errorLog.groupBy({
            by: ['severity'],
            where,
            _count: { id: true },
        });
    },

    listRecentErrors(where: Prisma.ErrorLogWhereInput, take = 50) {
        return prisma.errorLog.findMany({
            where,
            select: { errorCode: true, message: true, severity: true },
            orderBy: { timestamp: 'desc' },
            take,
        });
    },

    listRateLimitAnomaliesSince(sinceDate: Date, take = 20) {
        return prisma.rateLimitAnomaly.findMany({
            where: { detectedAt: { gte: sinceDate } },
            orderBy: { detectedAt: 'desc' },
            take,
        });
    },

    groupAffectedUsers(where: Prisma.ErrorLogWhereInput, take = 10) {
        return prisma.errorLog.groupBy({
            by: ['userId'],
            where: { ...where, userId: { not: null } },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take,
        });
    },

    countErrorLogs(where: Prisma.ErrorLogWhereInput) {
        return prisma.errorLog.count({ where });
    },

    countLeads() {
        return prisma.lead.count();
    },

    listLeadsBatch(cursor: string | undefined, take: number) {
        return prisma.lead.findMany({
            take,
            skip: cursor ? 1 : 0,
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: { createdAt: 'desc' },
        });
    },
};
