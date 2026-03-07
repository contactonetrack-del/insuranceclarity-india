import { prisma } from '../db/prisma';
import type { Prisma } from '@prisma/client';

export class QuoteRepository {
    /**
     * Retrieves all quotes from the database.
     * In a real application, you'd add pagination and filtering here.
     */
    async findAll() {
        return prisma.quote.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }

    /**
     * Finds a specific quote by ID.
     */
    async findById(id: string) {
        return prisma.quote.findUnique({
            where: { id },
        });
    }

    /**
     * Creates a new quote record.
     */
    async create(data: Prisma.QuoteCreateInput | any) {
        return prisma.quote.create({
            data,
        });
    }

    /**
     * Updates an existing quote.
     */
    async update(id: string, data: Partial<Prisma.QuoteUpdateInput | any>) {
        return prisma.quote.update({
            where: { id },
            data,
        });
    }
}

// Export a singleton instance for use in services
export const quoteRepository = new QuoteRepository();
