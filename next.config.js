/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable static HTML export for GitHub Pages deployment
    output: 'export',

    // Enable React strict mode for better development warnings
    reactStrictMode: true,

    // Image optimization settings
    // Note: images.unoptimized is required for static export
    images: {
        unoptimized: true,
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

    // Improve build performance
    experimental: {
        // Enable optimistic client cache
        staleTimes: {
            dynamic: 30,
        },
    },
};

module.exports = nextConfig;

