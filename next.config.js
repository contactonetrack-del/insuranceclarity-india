/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable React strict mode for better development warnings
    reactStrictMode: true,

    // Image optimization settings for next-image-export-optimizer
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
        ],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    },
    env: {
        nextImageExportOptimizer_imageFolderPath: "public/images",
        nextImageExportOptimizer_exportFolderPath: "out",
        nextImageExportOptimizer_quality: "75",
        nextImageExportOptimizer_storePicturesInWEBP: "true",
        nextImageExportOptimizer_exportFolderName: "nextImageExportOptimizer",
        nextImageExportOptimizer_generateAndUseBlurImages: "true"
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
