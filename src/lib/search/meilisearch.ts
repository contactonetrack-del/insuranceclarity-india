import { Meilisearch } from 'meilisearch';
import { getMeilisearchHost } from './config';

const globalForMeili = global as unknown as { meiliClient: Meilisearch };

export const meiliClient =
    globalForMeili.meiliClient ||
    new Meilisearch({
        host: getMeilisearchHost(),
        apiKey: process.env.MEILISEARCH_API_KEY || 'vercel_build_bypass_key',
    });

if (process.env.NODE_ENV !== 'production') globalForMeili.meiliClient = meiliClient;

// Define specific index instances for easier imports in services
export const indexes = {
    products: meiliClient.index('insurance_products'),
    hiddenFacts: meiliClient.index('hidden_facts'),
    claimCases: meiliClient.index('claim_cases'),
};
