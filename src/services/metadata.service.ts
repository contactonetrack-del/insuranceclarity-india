import { unstable_cache } from 'next/cache';

/**
 * Metadata Service utilizing Next.js Edge Caching
 * 
 * Heavily queried, invariant datasets (like Insurance Categories, Base Rates, 
 * or State compliance disclaimers) should never repeatedly hit the PostgreSQL 
 * database. 
 * 
 * `unstable_cache` stores the resolved promise output in the Next.js Data Cache
 * globally across regions, falling back to the database only on a cache MISS.
 */

export class MetadataService {

    /**
     * Retrieves static insurance risk categories.
     * Cached indefinitely until specifically revalidated via `tags`.
     */
    getRiskCategories = unstable_cache(
        async () => {
            // Simulate a slow database lookup for large configuration sets
            await new Promise(resolve => setTimeout(resolve, 1500));

            return [
                { id: 'cat_smoker', multiplier: 1.5, label: 'Tobacco User' },
                { id: 'cat_hazardous', multiplier: 1.8, label: 'Hazardous Occupation' },
                { id: 'cat_clean_record', multiplier: 0.8, label: 'No Prior Claims (5yr)' }
            ];
        },
        ['global-risk-categories'], // Cache Key
        {
            tags: ['metadata', 'risk-factors'], // On-Demand Revalidation Tags
            revalidate: 86400 // Time-based revalidation: 24 hours
        }
    );

    /**
     * Fetches real-time base premium rates per State.
     * Frequently accessed, cached for 1 hour.
     */
    getBaseRatesByState = unstable_cache(
        async (stateCode: string) => {
            // Simulate DB lookup
            return {
                state: stateCode,
                lifeBaseLimit: 250000,
                minimumPremium: 25.00
            };
        },
        ['base-rates-state'], // Cache Key prefix
        {
            revalidate: 3600 // 1 hour
        }
    );
}

export const metadataService = new MetadataService();
