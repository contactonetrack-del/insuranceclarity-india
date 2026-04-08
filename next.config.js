/** @type {import('next').NextConfig} */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
    reactStrictMode: true,

    // Keep native PDF parsing dependencies out of Turbopack server bundles.
    serverExternalPackages: ['pdf-parse', '@napi-rs/canvas'],

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
    experimental: {
        staleTimes: {
            dynamic: 30,
        },
    },
};
const withNextIntl = require('next-intl/plugin')('./src/i18n.ts');

module.exports = withBundleAnalyzer(withNextIntl(nextConfig));
