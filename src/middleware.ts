import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple in-memory rate limiter (for production, use Redis)
const rateLimit = new Map<string, { count: number; timestamp: number }>()

const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS = 100 // max requests per window

function getRateLimitKey(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
    return ip
}

function isRateLimited(key: string): boolean {
    const now = Date.now()
    const record = rateLimit.get(key)

    if (!record) {
        rateLimit.set(key, { count: 1, timestamp: now })
        return false
    }

    if (now - record.timestamp > RATE_LIMIT_WINDOW) {
        rateLimit.set(key, { count: 1, timestamp: now })
        return false
    }

    record.count++

    if (record.count > MAX_REQUESTS) {
        return true
    }

    return false
}

// Cleanup old entries (called on each request instead of setInterval for Edge Runtime compatibility)
function cleanupRateLimitEntries(): void {
    const now = Date.now()
    // Only cleanup occasionally to avoid performance impact
    if (Math.random() > 0.99) { // 1% chance per request
        const entries = Array.from(rateLimit.entries())
        for (const [key, value] of entries) {
            if (now - value.timestamp > RATE_LIMIT_WINDOW * 2) {
                rateLimit.delete(key)
            }
        }
    }
}

export function middleware(request: NextRequest) {
    const response = NextResponse.next()

    // Cleanup stale entries occasionally
    cleanupRateLimitEntries()

    // Apply rate limiting only to API routes
    if (request.nextUrl.pathname.startsWith('/api')) {
        const key = getRateLimitKey(request)

        if (isRateLimited(key)) {
            return new NextResponse(
                JSON.stringify({ error: 'Too many requests. Please try again later.' }),
                {
                    status: 429,
                    headers: {
                        'Content-Type': 'application/json',
                        'Retry-After': '60'
                    }
                }
            )
        }

        // Add rate limit headers
        const record = rateLimit.get(key)
        if (record) {
            response.headers.set('X-RateLimit-Limit', MAX_REQUESTS.toString())
            response.headers.set('X-RateLimit-Remaining', (MAX_REQUESTS - record.count).toString())
        }
    }

    // Add request ID for tracing
    const requestId = crypto.randomUUID()
    response.headers.set('X-Request-Id', requestId)

    return response
}

export const config = {
    matcher: [
        // Match all API routes
        '/api/:path*',
        // Match all page routes except static files
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}
