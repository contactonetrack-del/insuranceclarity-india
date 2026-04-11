import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { AnalysisResult } from '@/services/ai.service';
import type { ScanStatus } from '@/types/report.types';

export class ReportRepository {
    findExistingCompletedScanByHash(fileHash: string, accessWhere: Prisma.ScanWhereInput) {
        return prisma.scan.findFirst({
            where: {
                fileHash,
                status: 'COMPLETED',
                ...accessWhere,
            },
            orderBy: { createdAt: 'desc' },
            select: { id: true },
        });
    }

    countAnonymousScansSince(ipAddress: string, since: Date) {
        return prisma.scan.count({
            where: {
                userId: null,
                ipAddress,
                createdAt: { gte: since },
            },
        });
    }

    createScan(input: {
        userId?: string;
        fileUrl: string;
        fileName: string;
        fileHash: string;
        fileSizeKb: number;
        ipAddress?: string;
    }) {
        return prisma.scan.create({
            data: {
                userId: input.userId ?? null,
                fileUrl: input.fileUrl,
                fileName: input.fileName,
                fileHash: input.fileHash,
                fileSizeKb: input.fileSizeKb,
                ipAddress: input.ipAddress ?? null,
                status: 'PENDING',
            },
        });
    }

    updateScanStatus(scanId: string, status: ScanStatus, score?: number) {
        return prisma.scan.update({
            where: { id: scanId },
            data: {
                status,
                score: score ?? undefined,
            },
        });
    }

    async saveReport(scanId: string, result: AnalysisResult) {
        const { report, tokensUsed, processingMs } = result;
        await prisma.$transaction([
            prisma.report.create({
                data: {
                    scanId,
                    summary: report.summary,
                    score: report.score,
                    risks: report.risks as unknown as Prisma.InputJsonValue,
                    exclusions: report.exclusions as unknown as Prisma.InputJsonValue,
                    suggestions: report.suggestions as unknown as Prisma.InputJsonValue,
                    hiddenClauses: report.hiddenClauses as unknown as Prisma.InputJsonValue,
                    rawGptOutput: report.rawText ?? null,
                    tokensUsed,
                    processingMs,
                },
            }),
            prisma.scan.update({
                where: { id: scanId },
                data: { status: 'COMPLETED', score: report.score },
            }),
        ]);
    }

    markScanFailed(scanId: string) {
        return prisma.scan.update({
            where: { id: scanId },
            data: { status: 'FAILED' },
        });
    }

    findCompletedScanWithReportById(scanId: string) {
        return prisma.scan.findUnique({
            where: { id: scanId },
            include: { report: true },
        });
    }

    findScanStatusById(scanId: string) {
        return prisma.scan.findUnique({
            where: { id: scanId },
            select: { id: true, status: true, score: true, isPaid: true, updatedAt: true },
        });
    }

    markStaleScanFailed(scanId: string) {
        return prisma.scan.update({
            where: { id: scanId },
            data: { status: 'FAILED' },
        });
    }

    findScanForProcessing(scanId: string) {
        return prisma.scan.findUnique({
            where: { id: scanId },
            select: {
                id: true,
                fileUrl: true,
                fileName: true,
                fileHash: true,
                userId: true,
                status: true,
            },
        });
    }

    findUserContactById(userId: string) {
        return prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, name: true },
        });
    }

    listPendingScanNotifyLeads(scanId: string) {
        return prisma.lead.findMany({
            where: {
                insuranceType: 'SCAN_NOTIFY',
                notes: { startsWith: `scan:${scanId}` },
                status: 'NEW',
            },
            select: {
                id: true,
                email: true,
                name: true,
                notes: true,
                source: true,
            },
        });
    }

    markScanNotifyLeadContacted(leadId: string) {
        return prisma.lead.update({
            where: { id: leadId },
            data: { status: 'CONTACTED' },
        });
    }

    runInTransaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>) {
        return prisma.$transaction(fn);
    }

    findUserPlanUsageById(userId: string) {
        return prisma.user.findUnique({
            where: { id: userId },
            select: { plan: true, scansUsed: true, savedFacts: true },
        });
    }

    incrementUserScansUsed(tx: Prisma.TransactionClient, userId: string) {
        return tx.user.update({
            where: { id: userId },
            data: { scansUsed: { increment: 1 } },
            select: { scansUsed: true },
        });
    }

    countReferralConversionsByCode(code: string) {
        return prisma.lead.count({
            where: {
                source: 'REFERRAL',
                notes: `ref:${code}`,
            },
        });
    }

    findReferralConversionByEmailAndCode(email: string, code: string) {
        return prisma.lead.findFirst({
            where: {
                email,
                source: 'REFERRAL',
                notes: `ref:${code}`,
            },
            select: { id: true },
        });
    }

    createReferralConversion(params: {
        name: string;
        email: string;
        phone: string;
        code: string;
    }) {
        return prisma.lead.create({
            data: {
                name: params.name,
                email: params.email,
                phone: params.phone,
                insuranceType: 'REFERRAL',
                source: 'REFERRAL',
                notes: `ref:${params.code}`,
            },
        });
    }

    findSuppressionLeadByEmail(email: string) {
        return prisma.lead.findFirst({
            where: {
                email,
                insuranceType: 'UNSUBSCRIBE',
            },
            select: { id: true },
        });
    }

    updateSuppressionLead(params: {
        leadId: string;
        source: 'ORGANIC' | 'REFERRAL' | 'PAID' | 'SOCIAL' | 'EMAIL';
        notes: string;
    }) {
        return prisma.lead.update({
            where: { id: params.leadId },
            data: {
                status: 'CLOSED',
                source: params.source,
                notes: params.notes,
            },
        });
    }

    createSuppressionLead(params: {
        email: string;
        source: 'ORGANIC' | 'REFERRAL' | 'PAID' | 'SOCIAL' | 'EMAIL';
        notes: string;
    }) {
        return prisma.lead.create({
            data: {
                name: params.email.split('@')[0] || 'subscriber',
                email: params.email,
                phone: 'N/A',
                insuranceType: 'UNSUBSCRIBE',
                status: 'CLOSED',
                source: params.source,
                notes: params.notes,
            },
        });
    }

    deleteNewsletterByEmail(email: string) {
        return prisma.newsletter.deleteMany({ where: { email } });
    }

    deleteNewsletterLeadByEmail(email: string) {
        return prisma.lead.deleteMany({
            where: {
                email,
                insuranceType: 'NEWSLETTER',
            },
        });
    }

    deleteScanNotifyLeadByEmail(email: string) {
        return prisma.lead.deleteMany({
            where: {
                email,
                insuranceType: 'SCAN_NOTIFY',
            },
        });
    }

    createErrorLog(data: Prisma.ErrorLogCreateInput) {
        return prisma.errorLog.create({ data });
    }

    createManyErrorLogs(data: Prisma.ErrorLogCreateManyInput[]) {
        return prisma.errorLog.createMany({ data });
    }

    groupErrorLogsByCodeAndSeverity(sinceDate: Date) {
        return prisma.errorLog.groupBy({
            by: ['errorCode', 'severity'],
            where: {
                timestamp: {
                    gte: sinceDate,
                },
            },
            _count: {
                id: true,
            },
            orderBy: {
                _count: {
                    id: 'desc',
                },
            },
        });
    }

    getErrorTimeline(sinceDate: Date) {
        return prisma.$queryRaw<Array<{ date: Date; severity: string; count: number }>>`
      SELECT 
        DATE(timestamp) as date,
        severity,
        COUNT(*) as count
      FROM error_logs
      WHERE timestamp >= ${sinceDate}
      GROUP BY DATE(timestamp), severity
      ORDER BY date ASC, severity
    `;
    }

    createRateLimitAnomaly(params: {
        ipAddress: string;
        scope: string;
        requestCount: number;
        windowSeconds: number;
    }) {
        return prisma.rateLimitAnomaly.create({
            data: {
                ipAddress: params.ipAddress,
                scope: params.scope,
                requestCount: params.requestCount,
                windowSeconds: params.windowSeconds,
            },
        });
    }

    countRecentRateLimitAnomaliesByScope(scope: string, since: Date) {
        return prisma.rateLimitAnomaly.count({
            where: {
                scope,
                detectedAt: { gte: since },
            },
        });
    }

    listRateLimitAnomaliesByScope(scope: string, since: Date, take = 100) {
        return prisma.rateLimitAnomaly.findMany({
            where: {
                scope,
                detectedAt: { gte: since },
            },
            orderBy: { detectedAt: 'desc' },
            take,
        });
    }

    countRecentRateLimitAnomaliesByIp(ipAddress: string, since: Date) {
        return prisma.rateLimitAnomaly.count({
            where: {
                ipAddress,
                detectedAt: { gte: since },
            },
        });
    }

    findUserById(userId: string) {
        return prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, name: true },
        });
    }

    findScanById(scanId: string) {
        return prisma.scan.findUnique({
            where: { id: scanId },
            select: {
                id: true,
                fileUrl: true,
                fileName: true,
                fileHash: true,
                userId: true,
                status: true,
            },
        });
    }

    findNewsletterSubscriberByEmail(email: string) {
        return prisma.newsletter.findUnique({ where: { email } });
    }

    createNewsletterSubscriber(email: string) {
        return prisma.newsletter.create({ data: { email } });
    }
}

export const reportRepository = new ReportRepository();
