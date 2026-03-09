import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis only if the environment variables are present
// This prevents build errors if Upstash isn't fully configured yet.
const redisUrl = process.env.UPSTASH_REDIS_REST_URL || "";
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || "";

const redis = redisUrl && redisToken ? new Redis({
    url: redisUrl,
    token: redisToken,
}) : null;

// Create a new ratelimiter, that allows 10 requests per 10 seconds
const ratelimit = redis ? new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(10, '10 s'),
    analytics: true,
}) : null;

import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
    // Determine the IP address of the user
    // Fallback to anonymous if local or unresolved
    const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';

    const pathname = request.nextUrl.pathname;

    // --- PROTECT ADMIN / STUDIO / DASHBOARD ROUTES --------------------------------
    if (pathname.startsWith('/studio') || pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) {
        // verify user has a valid session token
        const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

        if (!token) {
            const url = request.nextUrl.clone();
            url.pathname = '/api/auth/signin';
            url.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(url);
        }

        // admin and studio require ADMIN role
        if ((pathname.startsWith('/studio') || pathname.startsWith('/admin')) && token.role !== 'ADMIN') {
            // Redirect non-admins to dashboard or home
            const url = request.nextUrl.clone();
            url.pathname = '/dashboard';
            return NextResponse.redirect(url);
        }
    }

    // --- RATE LIMITING -------------------------------------------------------------
    if (pathname.startsWith('/api/')) {
        // Skip rate limiting if Redis isn't configured
        if (!ratelimit) {
            console.warn('⚠️ Upstash Redis is not configured. Rate limiting is bypassed.');
            return NextResponse.next();
        }

        const { success, limit, reset, remaining } = await ratelimit.limit(ip);

        if (!success) {
            return new NextResponse('Too Many Requests. Please slow down.', {
                status: 429,
                headers: {
                    'X-RateLimit-Limit': limit.toString(),
                    'X-RateLimit-Remaining': remaining.toString(),
                    'X-RateLimit-Reset': reset.toString(),
                    'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString()
                }
            });
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/api/:path*',
        '/studio/:path*',
        '/admin/:path*',
        '/dashboard/:path*',
    ],
};
