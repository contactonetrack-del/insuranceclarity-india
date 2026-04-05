import { NextResponse, type NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { auth } from '@/auth';

const redisUrl = process.env.UPSTASH_REDIS_REST_URL ?? '';
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN ?? '';

const redis = redisUrl && redisToken
    ? new Redis({
        url: redisUrl,
        token: redisToken,
    })
    : null;

const ratelimit = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100, '60 s'),
        analytics: true,
    })
    : null;

type AuthenticatedRequest = NextRequest & {
    auth: {
        user?: {
            role?: string;
        };
    } | null;
};

function createNonce(): string {
    return crypto.randomUUID().replace(/-/g, '');
}

function getClientIp(request: NextRequest): string {
    const realIp = request.headers.get('x-real-ip')?.trim();
    if (realIp) {
        return realIp;
    }

    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0]?.trim() || '127.0.0.1';
    }

    return '127.0.0.1';
}

function shouldProtectRoute(pathname: string): boolean {
    return pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname.startsWith('/studio');
}

function isAdminRoute(pathname: string): boolean {
    return pathname.startsWith('/admin') || pathname.startsWith('/studio');
}

function isRateLimitedApi(pathname: string): boolean {
    if (!pathname.startsWith('/api/')) {
        return false;
    }

    return ![
        '/api/auth',
        '/api/payment/webhook',
        '/api/subscription/webhook',
        '/api/cron/',
        '/api/jobs/document-worker',
        '/api/jobs/document-worker/failure',
    ].some((prefix) => pathname.startsWith(prefix));
}

function buildCsp(nonce: string): string {
    const isDev = process.env.NODE_ENV === 'development';

    const directives = [
        "default-src 'self'",
        [
            "script-src 'self'",
            `'nonce-${nonce}'`,
            "'strict-dynamic'",
            isDev ? "'unsafe-eval'" : '',
            'https://www.googletagmanager.com',
            'https://www.google-analytics.com',
            'https://cdn.sanity.io',
            'https://checkout.razorpay.com',
        ].filter(Boolean).join(' '),
        [
            "style-src 'self'",
            isDev ? "'unsafe-inline'" : '',
            'https://fonts.googleapis.com',
        ].filter(Boolean).join(' '),
        "style-src-elem 'self' https://fonts.googleapis.com",
        "style-src-attr 'unsafe-inline'",
        "img-src 'self' blob: data: https://cdn.sanity.io https://images.unsplash.com https://lh3.googleusercontent.com https://res.cloudinary.com https://www.google-analytics.com",
        "font-src 'self' data: https://fonts.gstatic.com",
        "connect-src 'self' https://*.sanity.io https://*.sentry.io https://o*.ingest.sentry.io https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://*.upstash.io https://api.razorpay.com https://lumberjack.razorpay.com https://generativelanguage.googleapis.com https://res.cloudinary.com",
        "frame-src 'self' https://checkout.razorpay.com https://api.razorpay.com",
        "worker-src 'self' blob:",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        process.env.NODE_ENV === 'production' ? 'upgrade-insecure-requests' : '',
    ];

    return directives.filter(Boolean).join('; ');
}

export default auth(async function proxy(request: AuthenticatedRequest) {
    const nonce = createNonce();
    const pathname = request.nextUrl.pathname;
    const csp = buildCsp(nonce);

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-nonce', nonce);
    requestHeaders.set('Content-Security-Policy', csp);

    let response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

    if (shouldProtectRoute(pathname)) {
        if (!request.auth) {
            const url = request.nextUrl.clone();
            url.pathname = '/auth/signin';
            url.searchParams.set('callbackUrl', pathname);
            response = NextResponse.redirect(url);
        } else if (isAdminRoute(pathname) && request.auth.user?.role !== 'ADMIN') {
            const url = request.nextUrl.clone();
            url.pathname = '/dashboard';
            response = NextResponse.redirect(url);
        }
    }

    if (isRateLimitedApi(pathname) && response.status < 300 && ratelimit) {
        try {
            const { success, limit, remaining, reset } = await ratelimit.limit(getClientIp(request));

            if (!success) {
                response = NextResponse.json(
                    { error: 'Too Many Requests. Please try again later.' },
                    {
                        status: 429,
                        headers: {
                            'X-RateLimit-Limit': limit.toString(),
                            'X-RateLimit-Remaining': remaining.toString(),
                            'X-RateLimit-Reset': reset.toString(),
                            'Retry-After': Math.max(1, Math.ceil((reset - Date.now()) / 1000)).toString(),
                        },
                    },
                );
            } else {
                response.headers.set('X-RateLimit-Limit', limit.toString());
                response.headers.set('X-RateLimit-Remaining', remaining.toString());
                response.headers.set('X-RateLimit-Reset', reset.toString());
            }
        } catch {
            // Fall open when Redis is temporarily unavailable.
        }
    }

    response.headers.set('Content-Security-Policy', csp);
    return response;
});

export const config = {
    matcher: [
        {
            source: '/((?!_next/static|_next/image|favicon.ico|icon.png|sitemap.xml|robots.txt).*)',
            missing: [
                { type: 'header', key: 'next-router-prefetch' },
                { type: 'header', key: 'purpose', value: 'prefetch' },
            ],
        },
    ],
};
