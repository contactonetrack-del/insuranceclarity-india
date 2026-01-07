/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    // Image optimization
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'images.unsplash.com' },
            { protocol: 'https', hostname: 'insuranceclarity.in' },
            { protocol: 'https', hostname: 'cdn.worldvectorlogo.com' },
            { protocol: 'https', hostname: 'logo.clearbit.com' },
            { protocol: 'https', hostname: 'upload.wikimedia.org' },
            { protocol: 'https', hostname: 'lifeinsuranceservicing.adityabirlacapital.com' },
            { protocol: 'https', hostname: 'static.wikia.nocookie.net' },
            { protocol: 'https', hostname: 'www.iciciprulife.com' },
        ],
        formats: ['image/avif', 'image/webp'],
    },

    // Enable compression
    compress: true,

    // Security headers
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on'
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block'
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin'
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()'
                    },
                    {
                        key: 'Content-Security-Policy',
                        value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https:; frame-ancestors 'self';"
                    }
                ]
            }
        ]
    },

    // Optimize packages
    experimental: {
        optimizePackageImports: ['lucide-react', 'framer-motion'],
    },
}

module.exports = nextConfig
