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
}

export const claimRepository = new ClaimRepository();
