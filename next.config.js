/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable React strict mode for better development warnings
    reactStrictMode: true,

    // Keep images unoptimized so the app behaves consistently across generic Node hosts.
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
    // Improve build performance
    experimental: {
        // Enable optimistic client cache
        staleTimes: {
            dynamic: 30,
        },
    },
};

module.exports = nextConfig;

