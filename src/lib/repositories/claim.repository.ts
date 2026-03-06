import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma'; // The Singleton instance from Phase 3

export class ClaimRepository {
    async create(data: Prisma.ClaimCaseCreateInput) {
        return prisma.claimCase.create({
            data,
        });
    }

    async findById(id: string) {
        return prisma.claimCase.findUnique({
            where: { id }
        });
    }

    async updateStatus(id: string, status: 'APPROVED' | 'DENIED' | 'MANUAL_REVIEW') {
        return prisma.claimCase.update({
            where: { id },
            data: { status },
        });
    }
}

export const claimRepository = new ClaimRepository();
