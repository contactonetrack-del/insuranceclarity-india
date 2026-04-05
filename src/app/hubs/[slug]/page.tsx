import { fetchFromSanity } from "@/sanity/client";
import { CLUSTER_BY_SLUG_QUERY, POSTS_BY_CLUSTER_QUERY } from "@/sanity/queries";
import { urlForImage } from "@/sanity/image";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Layers } from "lucide-react";
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export const revalidate = 60; // Revalidate every minute

type Cluster = {
    title: string;
    slug: { current: string };
    description?: string;
    heroImage?: unknown;
};

type PostSnippet = {
    _id: string;
    title: string;
    slug: { current: string };
    author?: string;
    mainImage?: unknown;
    publishedAt?: string;
    searchIntent?: string;
    seoDescription?: string;
    categories?: string[];
};

export default async function HubPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    
    // Fetch cluster matching the slug
    const cluster = await fetchFromSanity<Cluster | null>(CLUSTER_BY_SLUG_QUERY, { slug: resolvedParams.slug }, null);
    
    if (!cluster) {
        notFound();
    }

    // Fetch all posts belonging to this cluster
    const posts = await fetchFromSanity<PostSnippet[]>(POSTS_BY_CLUSTER_QUERY, { clusterSlug: resolvedParams.slug }, []);

    return (
        <div className="min-h-screen pt-24 pb-20">
            {/* Hub Header */}
            <header className="relative py-20 px-6 border-b border-default overflow-hidden">
                {/* Background Image logic if available */}
                {!!cluster.heroImage && (
                    <div className="absolute inset-0 z-0 opacity-10 dark:opacity-20 pointer-events-none">
                        <Image
                            src={urlForImage(cluster.heroImage).url()}
                            alt={cluster.title}
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-theme-base via-theme-base/80 to-transparent" />
                    </div>
                )}
                
                <div className="max-w-7xl mx-auto relative z-10">
                    <Breadcrumbs />
                    
                    <div className="flex items-center gap-3 mb-4 mt-6">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                            <Layers className="w-5 h-5 text-accent" />
                        </div>
                        <span className="text-sm font-bold tracking-widest text-accent uppercase">Resource Hub</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-theme-primary mb-6 max-w-4xl">
                        {cluster.title}
                    </h1>

                    {cluster.description && (
                        <p className="text-xl text-theme-secondary max-w-2xl leading-relaxed">
                            {cluster.description}
                        </p>
                    )}
                </div>
            </header>

            {/* Articles Grid */}
            <main className="max-w-7xl mx-auto px-6 py-16">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h2 className="text-2xl font-display font-bold text-theme-primary">Pillar Articles & Guides</h2>
                        <p className="text-theme-secondary mt-1">Deep dive into {posts.length} specialist articles curated for this hub.</p>
                    </div>
                </div>

                {posts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post) => (
                            <Link 
                                key={post._id} 
                                href={`/blog/${post.slug.current}`}
                                className="group flex flex-col h-full bg-theme-base border border-default hover:border-theme-primary hover:shadow-xl rounded-2xl overflow-hidden transition-all duration-300"
                            >
                                <div className="aspect-[16/9] w-full bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                                    {post.mainImage ? (
                                        <Image
                                            src={urlForImage(post.mainImage).width(600).height(400).url()}
                                            alt={post.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-theme-muted">
                                            <BookOpen className="w-8 h-8 opacity-20" />
                                        </div>
                                    )}
                                    {post.searchIntent && (
                                        <div className="absolute top-4 left-4">
                                            <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white border border-white/10 rounded-full text-xs font-bold tracking-wide">
                                                {post.searchIntent}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <h3 className="text-xl font-bold font-display text-theme-primary mb-3 leading-snug group-hover:text-accent transition-colors">
                                        {post.title}
                                    </h3>
                                    <p className="text-theme-secondary text-sm line-clamp-3 mb-6 flex-grow">
                                        {post.seoDescription || "Read our comprehensive guide to learn more about this topic and protect yourself."}
                                    </p>
                                    
                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-default text-sm">
                                        <span className="text-theme-muted font-medium">
                                            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                                        </span>
                                        <span className="text-accent font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                                            Read Guide <ArrowRight className="w-4 h-4" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-theme-base border border-dashed border-default rounded-3xl">
                        <BookOpen className="w-12 h-12 text-theme-muted mx-auto mb-4" />
                        <h3 className="text-xl font-bold font-display text-theme-primary mb-2">Check back soon</h3>
                        <p className="text-theme-secondary max-w-sm mx-auto">
                            We are currently compiling expert guides and resources for the '{cluster.title}' hub.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
