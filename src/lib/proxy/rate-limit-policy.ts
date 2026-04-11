import { NextResponse, type NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { isRuntimeAnalyticsDisabled } from '@/lib/runtime-flags';

const redisUrl = process.env.UPSTASH_REDIS_REST_URL ?? '';
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN ?? '';
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

const ratelimit = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100, '60 s'),
        analytics: process.env.NODE_ENV === 'production' && !isRuntimeAnalyticsDisabled(),
    })
    : null;

function getClientIp(request: NextRequest): string {
    const realIp = request.headers.get('x-real-ip')?.trim();
    if (realIp) return realIp;
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) return forwarded.split(',')[0]?.trim() || '127.0.0.1';
    return '127.0.0.1';
}

function isRateLimitedApi(pathname: string): boolean {
    if (!pathname.startsWith('/api/')) return false;
    return ![
        '/api/auth',
        '/api/payment/webhook',
        '/api/subscription/webhook',
        '/api/cron/',
        '/api/jobs/document-worker',
        '/api/jobs/document-worker/failure',
    ].some((prefix) => pathname.startsWith(prefix));
}

function shouldFailClosed(pathname: string): boolean {
    return [
        '/api/payment/create-order',
        '/api/payment/verify',
        '/api/subscription/create',
    ].some((prefix) => pathname.startsWith(prefix));
}

export async function applyRateLimitPolicy(params: {
    request: NextRequest;
    pathname: string;
    response: NextResponse;
}): Promise<NextResponse> {
    const { request, pathname, response } = params;
    if (!(isRateLimitedApi(pathname) && response.status < 300 && ratelimit)) {
        return response;
    }

    try {
        const { success, limit, remaining, reset } = await ratelimit.limit(getClientIp(request));
        if (!success) {
            return NextResponse.json(
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
        }

        response.headers.set('X-RateLimit-Limit', limit.toString());
        response.headers.set('X-RateLimit-Remaining', remaining.toString());
        response.headers.set('X-RateLimit-Reset', reset.toString());
        return response;
    } catch {
        if (shouldFailClosed(pathname)) {
            return NextResponse.json(
                { error: 'Temporarily unable to verify request limits. Please retry shortly.' },
                { status: 503 },
            );
        }
        return response;
    }
}
