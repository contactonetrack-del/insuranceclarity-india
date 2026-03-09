import { createClient } from "next-sanity";
import { createImageUrlBuilder } from "@sanity/image-url";

const configuredProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim();
const configuredDataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim();

export const isSanityConfigured = Boolean(configuredProjectId && configuredDataset);
export const projectId = configuredProjectId || "missing-project-id";
export const dataset = configuredDataset || "production";
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01';

export const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false, // Set to false if you want the freshest data, true for edge-cached data
});

const builder = createImageUrlBuilder(client);

export function urlFor(source: any) {
    return builder.image(source);
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
