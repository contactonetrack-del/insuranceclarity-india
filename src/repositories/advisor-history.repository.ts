import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { logDbQuery, logger } from '@/lib/logger';

export class AdvisorHistoryRepository {
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

    async findHistoryByIdForUser(id: string, userId: string) {
        const start = Date.now();
        try {
            const result = await prisma.chatHistory.findUnique({
                where: { id, userId },
            });
            logDbQuery('ChatHistory', 'findHistoryByIdForUser', Date.now() - start, { id, userId });
            return result;
        } catch (error) {
            logger.error({ error, action: 'findHistoryByIdForUser', model: 'ChatHistory', id, userId }, 'Repository Error: ChatHistory.findHistoryByIdForUser');
            throw error;
        }
    }

    async listHistoriesByUser(userId: string) {
        const start = Date.now();
        try {
            const result = await prisma.chatHistory.findMany({
                where: { userId },
                orderBy: { updatedAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            logDbQuery('ChatHistory', 'listHistoriesByUser', Date.now() - start, { userId });
            return result;
        } catch (error) {
            logger.error({ error, action: 'listHistoriesByUser', model: 'ChatHistory', userId }, 'Repository Error: ChatHistory.listHistoriesByUser');
            throw error;
        }
    }

    async createHistory(params: {
        userId: string;
        title: string;
        messages: unknown[];
    }) {
        const start = Date.now();
        try {
            const result = await prisma.chatHistory.create({
                data: {
                    userId: params.userId,
                    title: params.title,
                    messages: params.messages as Prisma.InputJsonValue,
                },
            });
            logDbQuery('ChatHistory', 'createHistory', Date.now() - start, { userId: params.userId });
            return result;
        } catch (error) {
            logger.error({ error, action: 'createHistory', model: 'ChatHistory', userId: params.userId }, 'Repository Error: ChatHistory.createHistory');
            throw error;
        }
    }

    async updateHistory(params: {
        id: string;
        userId: string;
        title: string;
        messages: unknown[];
    }) {
        const start = Date.now();
        try {
            const result = await prisma.chatHistory.update({
                where: { id: params.id, userId: params.userId },
                data: {
                    title: params.title,
                    messages: params.messages as Prisma.InputJsonValue,
                },
            });
            logDbQuery('ChatHistory', 'updateHistory', Date.now() - start, { id: params.id, userId: params.userId });
            return result;
        } catch (error) {
            logger.error({ error, action: 'updateHistory', model: 'ChatHistory', id: params.id, userId: params.userId }, 'Repository Error: ChatHistory.updateHistory');
            throw error;
        }
    }
}

export const advisorHistoryRepository = new AdvisorHistoryRepository();
