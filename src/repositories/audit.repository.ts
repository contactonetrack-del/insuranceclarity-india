import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export class AuditRepository {
    createLog(data: Prisma.AuditLogUncheckedCreateInput) {
        return prisma.auditLog.create({ data });
    }

    listByUserId(userId: string, limit = 50) {
        return prisma.auditLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }

    listByAction(action: string, limit = 100) {
        return prisma.auditLog.findMany({
            where: { action },
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }

    listSince(since: Date, limit = 100) {
        return prisma.auditLog.findMany({
            where: {
                createdAt: { gte: since },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }
}

export const auditRepository = new AuditRepository();
