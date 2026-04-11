export function sanitizeRelativeCallbackUrl(
    callbackUrl?: string | null,
    fallback = '/dashboard',
): string {
    const trimmed = callbackUrl?.trim();

    if (!trimmed) {
        return fallback;
    }

    if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
        return fallback;
    }

    return trimmed;
}
