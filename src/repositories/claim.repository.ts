import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { logDbQuery, logger } from '@/lib/logger';

export class ClaimRepository {
    async create(data: Prisma.ClaimCaseCreateInput) {
        const start = Date.now();
        try {
            const result = await prisma.claimCase.create({ data });
            logDbQuery('ClaimCase', 'create', Date.now() - start);
            return result;
        } catch (error) {
            logger.error({ error, action: 'create', model: 'ClaimCase' }, 'Repository Error: ClaimCase.create');
            throw error;
        }
    }

    async findById(id: string) {
        const start = Date.now();
        try {
            const result = await prisma.claimCase.findUnique({ where: { id } });
            logDbQuery('ClaimCase', 'findById', Date.now() - start, { id });
            return result;
        } catch (error) {
            logger.error({ error, action: 'findById', model: 'ClaimCase', id }, 'Repository Error: ClaimCase.findById');
            throw error;
        }
    }

    async updateStatus(id: string, status: 'APPROVED' | 'DENIED' | 'MANUAL_REVIEW') {
        const start = Date.now();
        try {
            const result = await prisma.claimCase.update({
                where: { id },
                data: { status },
            });
            logDbQuery('ClaimCase', 'updateStatus', Date.now() - start, { id, status });
            return result;
        } catch (error) {
            logger.error({ error, action: 'updateStatus', model: 'ClaimCase', id, status }, 'Repository Error: ClaimCase.updateStatus');
            throw error;
        }
    }

    async findAll() {
        const start = Date.now();
        try {
            const result = await prisma.claimCase.findMany({
                orderBy: { createdAt: 'desc' },
            });
            logDbQuery('ClaimCase', 'findAll', Date.now() - start);
            return result;
        } catch (error) {
            logger.error({ error, action: 'findAll', model: 'ClaimCase' }, 'Repository Error: ClaimCase.findAll');
            throw error;
        }
    }

    async findRecent(limit = 50) {
        const start = Date.now();
        try {
            const result = await prisma.claimCase.findMany({
                orderBy: { createdAt: 'desc' },
                take: limit,
            });
            logDbQuery('ClaimCase', 'findRecent', Date.now() - start, { limit });
            return result;
        } catch (error) {
            logger.error({ error, action: 'findRecent', model: 'ClaimCase', limit }, 'Repository Error: ClaimCase.findRecent');
            throw error;
        }
    }

    async search(params: { query?: string; category?: string; limit?: number }) {
        const start = Date.now();
        const query = params.query?.trim() ?? '';
        const category = params.category?.trim() ?? 'All';
        const limit = params.limit ?? 20;

        const where: Prisma.ClaimCaseWhereInput = {};

        if (category !== 'All') {
            where.category = category;
        }

        if (query) {
            where.OR = [
                { title: { contains: query, mode: 'insensitive' } },
                { issue: { contains: query, mode: 'insensitive' } },
                { details: { contains: query, mode: 'insensitive' } },
                { lesson: { contains: query, mode: 'insensitive' } },
            ];
        }

        try {
            const result = await prisma.claimCase.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: limit,
            });
            logDbQuery('ClaimCase', 'search', Date.now() - start, { category, query, limit });
            return result;
        } catch (error) {
            logger.error({ error, action: 'search', model: 'ClaimCase', category, query, limit }, 'Repository Error: ClaimCase.search');
            throw error;
        }
    }
}

export const claimRepository = new ClaimRepository();
