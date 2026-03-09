import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://insuranceclarity.in';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/api/',          // Disallow search engines from pinging API routes
                '/admin/',        // Protect any future admin dashboards
                '/_next/',        // Ignore internal Next.js assets
                '/track/',        // Prevent indexing parametric tracking URLs
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
