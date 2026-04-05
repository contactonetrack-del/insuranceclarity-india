import { createClient } from 'next-sanity';
import { createImageUrlBuilder } from '@sanity/image-url';
import { getSanityConfig } from '@/lib/security/env';

const sanityConfig = getSanityConfig();

export const client = createClient({
    projectId: sanityConfig.projectId,
    dataset: sanityConfig.dataset,
    apiVersion: '2023-05-03',
    useCdn: process.env.NODE_ENV === 'production',
});

const builder = createImageUrlBuilder(client);

export function urlFor(source: unknown) {
    return builder.image(source as any);
}

export async function getPosts() {
    return await client.fetch(`*[_type == "post"]{
    title,
    slug,
    publishedAt,
    mainImage,
    "categories": categories[]->title
  }`);
}
