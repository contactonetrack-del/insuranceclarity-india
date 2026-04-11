import { taxonomyRepository } from '@/repositories/taxonomy.repository';

interface TaxonomyRelation {
    toId?: string;
    fromId?: string;
    relationType: string;
}

interface TaxonomyType {
    id: string;
    name: string;
    relatedTo: TaxonomyRelation[];
    relatedFrom: TaxonomyRelation[];
}

interface TaxonomySubcategory {
    id: string;
    name: string;
    types: TaxonomyType[];
}

interface TaxonomyCategory {
    id: string;
    name: string;
    slug: string;
    subcat: TaxonomySubcategory[];
}

export async function getTaxonomyGraph() {
    const categories = await taxonomyRepository.listCategoriesWithRelations() as TaxonomyCategory[];

    const graph = categories.map((cat) => ({
        id: cat.id,
        category: cat.name,
        slug: cat.slug,
        subcategories: cat.subcat.map((sub) => ({
            id: sub.id,
            name: sub.name,
            products: sub.types.map((type) => ({
                id: type.id,
                name: type.name,
                links_to: type.relatedTo.map((rel) => ({
                    typeId: rel.toId,
                    relation: rel.relationType,
                })),
                links_from: type.relatedFrom.map((rel) => ({
                    typeId: rel.fromId,
                    relation: rel.relationType,
                })),
            })),
        })),
    }));

    return { categoriesCount: categories.length, graph };
}

export async function getInsuranceCategoryByPossibleSlugs(possibleSlugs: string[]) {
    return taxonomyRepository.findCategoryByPossibleSlugs(possibleSlugs);
}
