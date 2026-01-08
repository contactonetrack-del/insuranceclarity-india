/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable React strict mode for better development warnings
    reactStrictMode: true,

    // Image optimization settings
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
        ],
        // Optimize images for performance
        formats: ['image/avif', 'image/webp'],
    },

    // Production security headers (applied via headers() for all routes)
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on',
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload',
                    },
                ],
            },
        ];
    },

    // Improve build performance
    experimental: {
        // Enable optimistic client cache
        staleTimes: {
            dynamic: 30,
        },
    },
};

module.exports = nextConfig;
