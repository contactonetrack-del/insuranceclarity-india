export const schemaTypes = [
    {
        name: 'post',
        title: 'Blog Post',
        type: 'document',
        fields: [
            { name: 'title', title: 'Title', type: 'string' },
            { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' } },
            { name: 'author', title: 'Author', type: 'string' },
            { name: 'mainImage', title: 'Main image', type: 'image', options: { hotspot: true } },
            { name: 'categories', title: 'Categories', type: 'array', of: [{ type: 'reference', to: { type: 'category' } }] },
            { name: 'cluster', title: 'SEO Cluster', type: 'reference', to: { type: 'seoCluster' }, description: 'Assign to a primary Content Hub' },
            { name: 'publishedAt', title: 'Published at', type: 'datetime' },
            // Advanced SEO Meta
            { name: 'seoTitle', title: 'SEO Meta Title', type: 'string', description: 'Optimal length: 50-60 characters', validation: (Rule: { max: (n: number) => { warning: (s: string) => void } }) => Rule.max(65).warning('Longer titles may be truncated by search engines') },
            { name: 'seoDescription', title: 'SEO Meta Description', type: 'text', description: 'Optimal length: 150-160 characters', validation: (Rule: { max: (n: number) => { warning: (s: string) => void } }) => Rule.max(160).warning('Ideally keep this under 160 characters') },
            { name: 'searchIntent', title: 'Search Intent', type: 'string', options: { list: ['Informational', 'Transactional', 'Commercial Investigation', 'Navigational'] } },
            { name: 'focusKeywords', title: 'Focus Keywords', type: 'array', of: [{ type: 'string' }], description: 'Target long-tail and LSI keywords' },
            // Body
            { name: 'body', title: 'Body Content', type: 'array', of: [{ type: 'block' }, { type: 'faqGroup' }] },
        ],
    },
    {
        name: 'category',
        title: 'Category',
        type: 'document',
        fields: [
            { name: 'title', title: 'Title', type: 'string' },
            { name: 'description', title: 'Description', type: 'text' },
        ],
    },
    {
        name: 'product',
        title: 'Insurance Product',
        type: 'document',
        fields: [
            { name: 'name', title: 'Product Name', type: 'string' },
            { name: 'provider', title: 'Provider', type: 'string' },
            { name: 'type', title: 'Insurance Type', type: 'string', options: { list: ['Health', 'Life', 'Term', 'Motor'] } },
            { name: 'highlights', title: 'Key Highlights', type: 'array', of: [{ type: 'string' }] },
            { name: 'brochure', title: 'Brochure PDF', type: 'file' },
        ],
    },
    {
        name: 'seoCluster',
        title: 'SEO Content Cluster (Hub)',
        type: 'document',
        fields: [
            { name: 'title', title: 'Cluster Hub Name', type: 'string', description: 'e.g., Health Insurance Hub' },
            { name: 'slug', title: 'Hub Slug', type: 'slug', options: { source: 'title' } },
            { name: 'description', title: 'Hub Description', type: 'text' },
            { name: 'heroImage', title: 'Hero Image', type: 'image', options: { hotspot: true } },
        ],
    },
    {
        name: 'faqGroup',
        title: 'FAQ Group (JSON-LD Supported)',
        type: 'object',
        fields: [
            { name: 'heading', title: 'FAQ Section Heading', type: 'string' },
            {
                name: 'questions',
                title: 'Questions & Answers',
                type: 'array',
                of: [
                    {
                        type: 'object',
                        fields: [
                            { name: 'question', title: 'Question', type: 'string' },
                            { name: 'answer', title: 'Answer', type: 'text' },
                        ],
                    },
                ],
            },
        ],
    }
];
