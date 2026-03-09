import { groq } from "next-sanity";

export const ALL_POSTS_QUERY = groq`
  *[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    author,
    mainImage,
    publishedAt,
    "categories": categories[]->title
  }
`;

export const POST_BY_SLUG_QUERY = groq`
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    author,
    mainImage,
    publishedAt,
    body,
    "categories": categories[]->title
  }
`;

export const ALL_CATEGORIES_QUERY = groq`
  *[_type == "category"] | order(title asc) {
    _id,
    title,
    description
  }
`;

export const ALL_PRODUCTS_QUERY = groq`
  *[_type == "product"] | order(provider asc, name asc) {
    _id,
    name,
    provider,
    type,
    highlights,
    "brochureUrl": brochure.asset->url
  }
`;

export const ALL_SEO_CLUSTERS_QUERY = groq`
  *[_type == "seoCluster"] | order(title asc) {
    _id,
    title,
    slug,
    description,
    heroImage
  }
`;

export const CLUSTER_BY_SLUG_QUERY = groq`
  *[_type == "seoCluster" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    description,
    heroImage
  }
`;

export const POSTS_BY_CLUSTER_QUERY = groq`
  *[_type == "post" && cluster->slug.current == $clusterSlug] | order(publishedAt desc) {
    _id,
    title,
    slug,
    author,
    mainImage,
    publishedAt,
    searchIntent,
    seoDescription,
    "categories": categories[]->title
  }
`;
