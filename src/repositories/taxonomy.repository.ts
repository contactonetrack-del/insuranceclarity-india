import { logDbQuery, logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

export class TaxonomyRepository {
    async listCategoriesWithRelations() {
        const start = Date.now();
        try {
            const result = await prisma.insuranceCategory.findMany({
                include: {
                    subcat: {
                        include: {
                            types: {
                                include: {
                                    relatedTo: true,
                                    relatedFrom: true,
                                },
                            },
                        },
                    },
                },
            });
            logDbQuery('InsuranceCategory', 'listCategoriesWithRelations', Date.now() - start);
            return result;
        } catch (error) {
            logger.error(
                { error, action: 'listCategoriesWithRelations', model: 'InsuranceCategory' },
                'Repository Error: InsuranceCategory.listCategoriesWithRelations',
            );
            throw error;
        }
    }

    async findCategoryByPossibleSlugs(possibleSlugs: string[]) {
        const start = Date.now();
        try {
            const result = await prisma.insuranceCategory.findFirst({
                where: { slug: { in: possibleSlugs } },
                include: {
                    subcat: {
                        include: {
                            types: {
                                include: {
                                    policies: { take: 4 },
                                },
                            },
                        },
                    },
                },
            });
            logDbQuery('InsuranceCategory', 'findCategoryByPossibleSlugs', Date.now() - start, {
                slugCount: possibleSlugs.length,
            });
            return result;
        } catch (error) {
            logger.error(
                { error, action: 'findCategoryByPossibleSlugs', model: 'InsuranceCategory', possibleSlugs },
                'Repository Error: InsuranceCategory.findCategoryByPossibleSlugs',
            );
            throw error;
        }
    }
}

export const taxonomyRepository = new TaxonomyRepository();
