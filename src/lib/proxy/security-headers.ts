import { NextResponse } from 'next/server';

export function createNonce(): string {
    return crypto.randomUUID().replace(/-/g, '');
}

function getAllowedTelemetryOrigins(): string[] {
    const configuredOrigins = [process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() ?? ''];
    return configuredOrigins.flatMap((value) => {
        if (!value) return [];
        try {
            return [new URL(value).origin];
        } catch {
            return [];
        }
    });
}

export function buildCsp(nonce: string, isDev: boolean): string {
    const telemetryOrigins = getAllowedTelemetryOrigins();
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
        "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "style-src-attr 'unsafe-inline'",
        [
            "img-src 'self' blob: data:",
            'https://cdn.sanity.io',
            'https://images.unsplash.com',
            'https://lh3.googleusercontent.com',
            'https://res.cloudinary.com',
            'https://www.google-analytics.com',
            ...telemetryOrigins,
        ].join(' '),
        "font-src 'self' data: https://fonts.gstatic.com",
        [
            "connect-src 'self'",
            'https://*.sanity.io',
            'https://*.sentry.io',
            'https://*.ingest.sentry.io',
            'https://www.google-analytics.com',
            'https://analytics.google.com',
            'https://www.googletagmanager.com',
            'https://*.upstash.io',
            'https://api.razorpay.com',
            'https://lumberjack.razorpay.com',
            'https://generativelanguage.googleapis.com',
            'https://res.cloudinary.com',
            ...telemetryOrigins,
        ].join(' '),
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

export function applySecurityHeaders(response: NextResponse, csp: string): void {
    response.headers.set('Content-Security-Policy', csp);
    response.headers.set('X-DNS-Prefetch-Control', 'on');
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
}
