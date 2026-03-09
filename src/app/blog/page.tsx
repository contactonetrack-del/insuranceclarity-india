import { fetchFromSanity } from "@/sanity/client";
import { ALL_POSTS_QUERY } from "@/sanity/queries";
import { urlForImage } from "@/sanity/image";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

export const revalidate = 60; // Revalidate every 60 seconds

type BlogListPost = {
    _id: string;
    title: string;
    slug: { current: string };
    author?: string | null;
    mainImage?: unknown;
    publishedAt?: string | null;
    categories?: string[];
};

export default async function BlogIndexPage() {
    const posts = await fetchFromSanity<BlogListPost[]>(ALL_POSTS_QUERY, {}, []);

    return (
        <div className="min-h-screen pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* Header */}
                <div className="text-center space-y-4 max-w-2xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-theme-primary">
                        Insurance <span className="text-gradient">Insights</span>
                    </h1>
                    <p className="text-theme-muted text-lg">
                        Expert guides, policy breakdowns, and industry news to help you make informed decisions.
                    </p>
                </div>

                {/* Blog Grid */}
                {posts && posts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post: any) => (
                            <Link key={post._id} href={`/blog/${post.slug.current}`} className="group glass-strong rounded-3xl overflow-hidden border border-default hover:border-accent/30 transition-all hover-lift">
                                <div className="aspect-video w-full bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                                    {post.mainImage ? (
                                        <img
                                            src={urlForImage(post.mainImage).url()}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            <BookOpen className="w-12 h-12" />
                                        </div>
                                    )}
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="flex items-center gap-2">
                                        {post.categories?.map((category: string) => (
                                            <span key={category} className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-1 rounded-md">
                                                {category}
                                            </span>
                                        ))}
                                    </div>
                                    <h2 className="text-xl font-bold text-theme-primary group-hover:text-accent transition-colors">
                                        {post.title}
                                    </h2>
                                    <div className="flex items-center justify-between text-xs text-theme-muted font-medium">
                                        <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1 text-accent">
                                            Read Article <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="glass-strong rounded-3xl p-16 text-center border border-dashed border-default max-w-2xl mx-auto">
                        <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-theme-primary mb-2">No Articles Found</h3>
                        <p className="text-theme-muted">We're currently preparing comprehensive insurance guides. They will appear here once published manually via the Sanity Studio.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
