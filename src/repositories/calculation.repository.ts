import type { Prisma } from '@prisma/client';
import { logDbQuery, logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

export class CalculationRepository {
    async findUserIdByEmail(email: string) {
        const start = Date.now();
        try {
            const result = await prisma.user.findUnique({
                where: { email },
                select: { id: true },
            });
            logDbQuery('User', 'findUserIdByEmail', Date.now() - start, { email });
            return result;
        } catch (error) {
            logger.error({ error, action: 'findUserIdByEmail', model: 'User', email }, 'Repository Error: User.findUserIdByEmail');
            throw error;
        }
    }

    async createUserCalculation(params: {
        userId: string;
        type: string;
        inputData: unknown;
        result: unknown;
    }) {
        const start = Date.now();
        try {
            const created = await prisma.userCalculation.create({
                data: {
                    userId: params.userId,
                    type: params.type,
                    inputData: params.inputData as Prisma.InputJsonValue,
                    result: params.result as Prisma.InputJsonValue,
                },
            });
            logDbQuery('UserCalculation', 'createUserCalculation', Date.now() - start, { userId: params.userId, type: params.type });
            return created;
        } catch (error) {
            logger.error({ error, action: 'createUserCalculation', model: 'UserCalculation', userId: params.userId, type: params.type }, 'Repository Error: UserCalculation.createUserCalculation');
            throw error;
        }
    }

    async listUserCalculationsByUserId(userId: string, limit = 20) {
        const start = Date.now();
        try {
            const result = await prisma.userCalculation.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: limit,
            });
            logDbQuery('UserCalculation', 'listUserCalculationsByUserId', Date.now() - start, { userId, limit });
            return result;
        } catch (error) {
            logger.error({ error, action: 'listUserCalculationsByUserId', model: 'UserCalculation', userId, limit }, 'Repository Error: UserCalculation.listUserCalculationsByUserId');
            throw error;
        }
    }
}

export const calculationRepository = new CalculationRepository();
