import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { logDbQuery, logger } from '@/lib/logger';

export class QuoteRepository {
    /**
     * Retrieves all quotes from the database.
     * In a real application, you'd add pagination and filtering here.
     */
    async findAll() {
        const start = Date.now();
        try {
            const result = await prisma.quote.findMany({
                orderBy: { createdAt: 'desc' },
                take: 50,
            });
            logDbQuery('Quote', 'findAll', Date.now() - start);
            return result;
        } catch (error) {
            logger.error({ error, action: 'findAll', model: 'Quote' }, 'Repository Error: Quote.findAll');
            throw error;
        }
    }

    /**
     * Finds a specific quote by ID.
     */
    async findById(id: string) {
        const start = Date.now();
        try {
            const result = await prisma.quote.findUnique({
                where: { id },
            });
            logDbQuery('Quote', 'findById', Date.now() - start, { id });
            return result;
        } catch (error) {
            logger.error({ error, action: 'findById', model: 'Quote', id }, 'Repository Error: Quote.findById');
            throw error;
        }
    }

    /**
     * Creates a new quote record.
     */
    async create(data: Prisma.QuoteCreateInput) {
        const start = Date.now();
        try {
            const result = await prisma.quote.create({
                data,
            });
            logDbQuery('Quote', 'create', Date.now() - start);
            return result;
        } catch (error) {
            logger.error({ error, action: 'create', model: 'Quote' }, 'Repository Error: Quote.create');
            throw error;
        }
    }

    /**
     * Updates an existing quote.
     */
    async update(id: string, data: Prisma.QuoteUpdateInput) {
        const start = Date.now();
        try {
            const result = await prisma.quote.update({
                where: { id },
                data,
            });
            logDbQuery('Quote', 'update', Date.now() - start, { id });
            return result;
        } catch (error) {
            logger.error({ error, action: 'update', model: 'Quote', id }, 'Repository Error: Quote.update');
            throw error;
        }
    }
}

// Export a singleton instance for use in services
export const quoteRepository = new QuoteRepository();
