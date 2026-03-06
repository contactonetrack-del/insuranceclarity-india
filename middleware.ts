import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Security Middleware
 * Adds essential security headers for insurance platform compliance
 */
// Simple in-memory store for rate limiting (Note: in serverless edges this is per isolate, but sufficient for basic abuse prevention)
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT = 100; // max requests
const TIME_WINDOW = 60 * 1000; // 1 minute

export function middleware(request: NextRequest) {
    // Basic Rate Limiting check
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    const currentTime = Date.now();

    if (ip !== 'unknown') {
        const record = rateLimitMap.get(ip);
        if (record) {
            if (currentTime - record.timestamp < TIME_WINDOW) {
                if (record.count >= RATE_LIMIT) {
                    return new NextResponse('Too Many Requests. Please wait.', { status: 429 });
                }
                record.count += 1;
            } else {
                rateLimitMap.set(ip, { count: 1, timestamp: currentTime });
            }
        } else {
            rateLimitMap.set(ip, { count: 1, timestamp: currentTime });
        }
    }

    const response = NextResponse.next();

    // Prevent clickjacking attacks
    response.headers.set('X-Frame-Options', 'DENY');

    // Prevent MIME type sniffing
    response.headers.set('X-Content-Type-Options', 'nosniff');

    // Enable XSS filter in older browsers
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // Control referrer information
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions Policy (formerly Feature-Policy)
    response.headers.set(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=(), interest-cohort=()'
    );

    // Content Security Policy
    const cspHeader = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  // Required for Next.js
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://*.sentry.io",  // For future Sentry
        "frame-ancestors 'none'",
    ].join('; ');

    response.headers.set('Content-Security-Policy', cspHeader);

    return response;
}

// Apply to all routes except static files and API routes that need different handling
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
