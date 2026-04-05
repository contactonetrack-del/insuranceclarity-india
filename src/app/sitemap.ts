import { MetadataRoute } from 'next';
import { insuranceCategories, businessCategories, tools } from '@/config/home-data';
import { fetchFromSanity } from '@/sanity/client';
import { ALL_SEO_CLUSTERS_QUERY } from '@/sanity/queries';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://insuranceclarity.in';

    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.5,
        },
    ];

    const categoryPages: MetadataRoute.Sitemap = [...insuranceCategories, ...businessCategories].map(
        (category) => ({
            url: `${baseUrl}${category.href}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        })
    );

    const toolPages: MetadataRoute.Sitemap = tools.map((tool) => ({
        url: `${baseUrl}${tool.href}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.9,
    }));

    // add knowledge hubs (seo clusters) from Sanity
    // ── Timeout guard ────────────────────────────────────────────────────────
    // Without a timeout, a Sanity outage or slow cold-start will make Next.js
    // hang indefinitely during build/ISR revalidation, blocking deployments.
    // We accept an empty hubPages array — other sitemap sections still generate.
    let hubPages: MetadataRoute.Sitemap = [];
    try {
        const controller = new AbortController();
        const timeoutId  = setTimeout(() => controller.abort(), 3_000); // 3s max

        const clusters = await fetchFromSanity<{ slug: { current: string }; _updatedAt?: string }[]>(
            ALL_SEO_CLUSTERS_QUERY,
            {},
            [],
        );
        clearTimeout(timeoutId);

        hubPages = clusters.map((c) => ({
            url:             `${baseUrl}/${c.slug.current}`,
            lastModified:    new Date(c._updatedAt || Date.now()),
            changeFrequency: 'weekly',
            priority:        0.7,
        }));
    } catch (e) {
        // Log and continue — a missing Sanity section is non-fatal for the sitemap
        const reason = e instanceof Error && e.name === 'AbortError'
            ? 'Sanity request timed out (>3s)'
            : String(e);
        console.error(`[sitemap] Failed to fetch Sanity clusters: ${reason}`);
    }

    // In a full implementation, Prisma would be queried here to generate
    // dynamic URLs for all /tools/hidden-facts/[id] and /articles/[slug].
    // Example:
    // const facts = await prisma.hiddenFact.findMany({ select: { id: true, updatedAt: true } })

    return [...staticPages, ...categoryPages, ...toolPages, ...hubPages];
}
