import { fetchFromSanity } from "@/sanity/client";
import { headers } from "next/headers";
import { CLUSTER_BY_SLUG_QUERY, POSTS_BY_CLUSTER_QUERY } from "@/sanity/queries";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Calendar, ChevronRight, ShieldCheck } from "lucide-react";
import { urlFor } from "@/sanity/client";
import { JsonLd, generateBreadcrumbSchema } from "@/components/seo/JsonLd";
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { getTranslations } from "next-intl/server";

export const revalidate = 3600; // Cache for 1 hour

type Cluster = {
    title: string;
    description?: string | null;
    heroImage?: unknown;
};

type ClusterPost = {
    _id: string;
    title: string;
    slug: { current: string };
    mainImage?: unknown;
    publishedAt?: string | null;
    searchIntent?: string | null;
    seoDescription?: string | null;
    categories?: string[];
};

export async function generateMetadata({ params }: { params: Promise<{ clusterSlug: string }> }) {
    const resolvedParams = await params;
    const t = await getTranslations('seoClusterPage');
    const cluster = await fetchFromSanity<Cluster | null>(CLUSTER_BY_SLUG_QUERY, { slug: resolvedParams.clusterSlug }, null);

    if (!cluster) return { title: t('metadata.notFoundTitle') };

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://insuranceclarity.in';

    return {
        title: `${cluster.title} | ${t('metadata.titleSuffix')}`,
        description: cluster.description,
        alternates: {
            canonical: `${baseUrl}/${resolvedParams.clusterSlug}`,
        },
        openGraph: {
            title: cluster.title,
            description: cluster.description || '',
            url: `${baseUrl}/${resolvedParams.clusterSlug}`,
            siteName: t('metadata.siteName'),
            type: 'article',
        },
    };
}

export default async function ClusterLandingPage({ params }: { params: Promise<{ clusterSlug: string }> }) {
    const resolvedParams = await params;
    const t = await getTranslations('seoClusterPage');
    const cluster = await fetchFromSanity<Cluster | null>(CLUSTER_BY_SLUG_QUERY, { slug: resolvedParams.clusterSlug }, null);

    if (!cluster) {
        return notFound();
    }

    const nonce = (await headers()).get('x-nonce') || undefined;

    const posts = await fetchFromSanity<ClusterPost[]>(POSTS_BY_CLUSTER_QUERY, { clusterSlug: resolvedParams.clusterSlug }, []);


    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: t('breadcrumbs.home'), item: 'https://insuranceclarity.in' },
        { name: t('breadcrumbs.insuranceGuides'), item: 'https://insuranceclarity.in/insurance' },
        { name: cluster.title, item: `https://insuranceclarity.in/category/${resolvedParams.clusterSlug}` }
    ]);

    return (
        <div className="min-h-screen pt-24 pb-20 px-6">
            <JsonLd data={breadcrumbSchema} nonce={nonce} />
            <div className="max-w-7xl mx-auto space-y-12">
                <Breadcrumbs />

                {/* Cluster Hero Section */}
                <div className="relative w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl border border-default">
                    {cluster.heroImage ? (
                        <Image
                            src={urlFor(cluster.heroImage).url()}
                            alt={cluster.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900" />
                    )}
                    <div className="absolute inset-0 bg-black/50" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                        <span className="px-4 py-1.5 rounded-full bg-accent text-white text-xs font-bold uppercase tracking-widest shadow-lg mb-6">
                            {t('hero.badge')}
                        </span>
                        <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 drop-shadow-md">
                            {cluster.title}
                        </h1>
                        <p className="text-lg md:text-xl text-slate-100 dark:text-slate-200 max-w-3xl drop-shadow-sm leading-relaxed">
                            {cluster.description || t('hero.fallbackDescription')}
                        </p>
                    </div>
                </div>

                {/* Sub-Topics / Posts Grid */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-display font-bold text-theme-primary">
                            {t('list.heading')}
                        </h2>
                        <span className="text-sm font-medium text-theme-muted bg-theme-surface px-3 py-1 rounded-full border border-default">
                            {t('list.topicsCount', { count: posts.length })}
                        </span>
                    </div>

                    {posts.length === 0 ? (
                        <div className="glass flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                            <BookOpen className="w-12 h-12 text-slate-400 mb-4" />
                            <h3 className="text-xl font-bold text-theme-primary mb-2">{t('list.emptyTitle')}</h3>
                            <p className="text-theme-muted text-center max-w-md">{t('list.emptyDescription')}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {posts.map((post: ClusterPost) => (
                                <Link key={post._id} href={`/blog/${post.slug.current}`} className="group h-full">
                                    <div className="glass rounded-2xl overflow-hidden border border-default hover:border-accent/40 transition-all hover:shadow-xl hover:shadow-accent/5 h-full flex flex-col">

                                        <div className="relative w-full h-48 bg-slate-100 dark:bg-slate-800">
                                            {post.mainImage ? (
                                                <Image
                                                    src={urlFor(post.mainImage).url()}
                                                    alt={post.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <ShieldCheck className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex items-center gap-2 mb-4 flex-wrap">
                                                <span className="text-[10px] font-bold uppercase text-accent bg-accent/10 px-2 py-0.5 rounded-md">
                                                    {post.searchIntent || t('list.intentFallback')}
                                                </span>
                                                {post.categories?.[0] && (
                                                    <span className="text-[10px] font-bold uppercase text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                                        {post.categories[0]}
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="font-bold text-lg text-theme-primary mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                                                {post.title}
                                            </h3>

                                            <p className="text-sm text-theme-muted mb-6 line-clamp-3 flex-1">
                                                {post.seoDescription || t('list.cardDescriptionFallback')}
                                            </p>

                                            <div className="flex items-center justify-between text-xs text-theme-muted pt-4 border-t border-default mt-auto">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : t('list.dateFallback')}
                                                </div>
                                                <div className="flex items-center gap-1 font-bold text-accent">
                                                    {t('list.readCta')} <ChevronRight className="w-3.5 h-3.5" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
