import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Initialize Upstash Redis instance
const redis = Redis.fromEnv();

// Create a sliding window rate limiter
// Allows 100 requests per 60 seconds per IP for API routes
const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '60 s'),
    analytics: true,
});

export async function proxy(request: NextRequest) {
    // Edge runtime security: Add basic headers
    const response = NextResponse.next();

    response.headers.set('X-DNS-Prefetch-Control', 'on');
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'origin-when-cross-origin');

    // Implement Content Security Policy (CSP)
    const csp = `
        default-src 'self';
        script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com;
        style-src 'self' 'unsafe-inline';
        img-src 'self' data: blob: https://images.unsplash.com https://www.google-analytics.com;
        font-src 'self' data:;
        connect-src 'self' https://www.google-analytics.com;
        frame-src 'self';
        base-uri 'self';
        form-action 'self';
    `.replace(/\s{2,}/g, ' ').trim();

    response.headers.set('Content-Security-Policy', csp);


    const path = request.nextUrl.pathname;

    // Apply strict rate limiting to sensitive endpoints via Redis
    if (path.startsWith('/api/') && !path.startsWith('/api/auth')) { // Exclude auth routes from general limiting
        const ip = request.headers.get('x-real-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';

        try {
            const { success, limit, reset, remaining } = await ratelimit.limit(ip);

            // Set rate limit headers
            response.headers.set('X-RateLimit-Limit', limit.toString());
            response.headers.set('X-RateLimit-Remaining', remaining.toString());
            response.headers.set('X-RateLimit-Reset', reset.toString());

            if (!success) {
                return new NextResponse(
                    JSON.stringify({ error: 'Too Many Requests. Please try again later.' }),
                    { status: 429, headers: { 'Content-Type': 'application/json', ...Object.fromEntries(response.headers.entries()) } }
                );
            }
        } catch (error) {
            console.error('Rate limiting error:', error);
            // Fall open (allow request) if Redis is unreachable temporarily so site doesn't go down
        }
    }

    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
