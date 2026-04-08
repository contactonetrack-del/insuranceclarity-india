const PRISMA_FALLBACK_PATTERNS = [
    'password authentication failed',
    'raw query failed',
    "can't reach database server",
    'getaddrinfo enotfound',
    'connect econnrefused',
    'connect etimedout',
    'read econnreset',
    'fetch failed',
    'p1000',
    'p1001',
] as const;

export function isExpectedDbFallbackError(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error);
    const normalized = message.toLowerCase();

    return PRISMA_FALLBACK_PATTERNS.some((pattern) => normalized.includes(pattern));
}

export function getDbFallbackErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}
