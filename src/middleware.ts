import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Edge runtime security: Add basic headers
    const response = NextResponse.next();

    response.headers.set('X-DNS-Prefetch-Control', 'on');
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'origin-when-cross-origin');

    // Edge In-Memory Rate Limiting (Token Bucket Simulation)
    // Production would use Upstash Redis `@upstash/ratelimit`
    if (request.nextUrl.pathname.startsWith('/api/')) {
        const forwardedFor = request.headers.get('x-forwarded-for');
        const ip = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1';
        response.headers.set('x-forwarded-for', ip);

        // Very basic edge-compatible Map fallback (Clears on cold starts)
        const now = Date.now();
        const requestLog = getRateLimitProfile(ip);

        if (requestLog.count >= 20 && now - requestLog.startTime < 60000) {
            // Block if > 20 reqs per minute
            return new NextResponse(
                JSON.stringify({ error: 'Too Many Requests' }),
                { status: 429, headers: { 'Content-Type': 'application/json' } }
            );
        } else if (now - requestLog.startTime >= 60000) {
            // Reset after 1 min
            requestLog.count = 1;
            requestLog.startTime = now;
        } else {
            requestLog.count++;
        }
    }

    return response;
}

// Memory fallback for Single Instance Edge Environments
const edgeMemoryMap = new Map<string, { count: number, startTime: number }>();
function getRateLimitProfile(ip: string) {
    if (!edgeMemoryMap.has(ip)) {
        edgeMemoryMap.set(ip, { count: 0, startTime: Date.now() });
    }
    return edgeMemoryMap.get(ip)!;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
