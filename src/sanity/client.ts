import { createClient } from "next-sanity";
import { createImageUrlBuilder } from "@sanity/image-url";
import { getSanityConfig } from '@/lib/security/env';

const sanityConfig = getSanityConfig();

export const isSanityConfigured = sanityConfig.isConfigured;
export const projectId = sanityConfig.projectId;
export const dataset = sanityConfig.dataset;
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01';

export const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false, // Set to false if you want the freshest data, true for edge-cached data
});

const builder = createImageUrlBuilder(client);

export function urlFor(source: unknown) {
    return builder.image(source as any);
}

export async function fetchFromSanity<T>(
    query: string,
    params: Record<string, unknown> = {},
    fallback: T
): Promise<T> {
    if (!isSanityConfigured) {
        return fallback;
    }

    try {
        return await client.fetch<T>(query, params);
    } catch (error) {
        console.error("Sanity fetch failed:", error);
        return fallback;
    }
}
