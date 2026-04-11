import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getInsuranceCategoryByPossibleSlugs, getTaxonomyGraph } from '../taxonomy.service';

const {
    mockListCategoriesWithRelations,
    mockFindCategoryByPossibleSlugs,
} = vi.hoisted(() => ({
    mockListCategoriesWithRelations: vi.fn(),
    mockFindCategoryByPossibleSlugs: vi.fn(),
}));

vi.mock('@/repositories/taxonomy.repository', () => ({
    taxonomyRepository: {
        listCategoriesWithRelations: mockListCategoriesWithRelations,
        findCategoryByPossibleSlugs: mockFindCategoryByPossibleSlugs,
    },
}));

describe('taxonomy.service repository delegation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('maps graph data from taxonomy repository', async () => {
        mockListCategoriesWithRelations.mockResolvedValue([
            {
                id: 'cat_1',
                name: 'Health',
                slug: 'health-insurance',
                subcat: [
                    {
                        id: 'sub_1',
                        name: 'Mediclaim',
                        types: [
                            {
                                id: 'type_1',
                                name: 'Family Floater',
                                relatedTo: [{ toId: 'type_2', relationType: 'ALTERNATIVE' }],
                                relatedFrom: [],
                            },
                        ],
                    },
                ],
            },
        ]);

        const result = await getTaxonomyGraph();

        expect(mockListCategoriesWithRelations).toHaveBeenCalledTimes(1);
        expect(result.categoriesCount).toBe(1);
        expect(result.graph).toEqual([
            {
                id: 'cat_1',
                category: 'Health',
                slug: 'health-insurance',
                subcategories: [
                    {
                        id: 'sub_1',
                        name: 'Mediclaim',
                        products: [
                            {
                                id: 'type_1',
                                name: 'Family Floater',
                                links_to: [{ typeId: 'type_2', relation: 'ALTERNATIVE' }],
                                links_from: [],
                            },
                        ],
                    },
                ],
            },
        ]);
    });

    it('delegates possible slug lookup to taxonomy repository', async () => {
        mockFindCategoryByPossibleSlugs.mockResolvedValue({ id: 'cat_1', slug: 'health-insurance' });

        const result = await getInsuranceCategoryByPossibleSlugs(['health-insurance', 'health']);

        expect(mockFindCategoryByPossibleSlugs).toHaveBeenCalledWith(['health-insurance', 'health']);
        expect(result).toEqual({ id: 'cat_1', slug: 'health-insurance' });
    });
});
