export function isCloudMeilisearchHost(host: string): boolean {
    const normalized = host.trim().toLowerCase();
    return normalized.startsWith('https://') && !normalized.includes('localhost');
}

export function getMeilisearchHost(): string {
    return process.env.MEILISEARCH_HOST?.trim() || 'http://localhost:7700';
}

export function ensureMeilisearchProductionReady(): void {
    const host = getMeilisearchHost();

    if (process.env.NODE_ENV === 'production' && !isCloudMeilisearchHost(host)) {
        throw new Error(
            'Meilisearch production host is not configured for cloud. Set MEILISEARCH_HOST to your Meilisearch Cloud HTTPS endpoint.',
        );
    }
}
