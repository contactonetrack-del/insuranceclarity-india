import { logDbQuery, logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

export class CompareRepository {
    async listPoliciesWithType(limit = 40) {
        const start = Date.now();
        try {
            const result = await prisma.insurancePolicy.findMany({
                include: { type: true },
                take: limit,
            });
            logDbQuery('InsurancePolicy', 'listPoliciesWithType', Date.now() - start, { limit });
            return result;
        } catch (error) {
            logger.error(
                { error, action: 'listPoliciesWithType', model: 'InsurancePolicy', limit },
                'Repository Error: InsurancePolicy.listPoliciesWithType',
            );
            throw error;
        }
    }

    async listInsuranceTypes() {
        const start = Date.now();
        try {
            const result = await prisma.insuranceType.findMany();
            logDbQuery('InsuranceType', 'listInsuranceTypes', Date.now() - start);
            return result;
        } catch (error) {
            logger.error(
                { error, action: 'listInsuranceTypes', model: 'InsuranceType' },
                'Repository Error: InsuranceType.listInsuranceTypes',
            );
            throw error;
        }
    }
}

export const compareRepository = new CompareRepository();
