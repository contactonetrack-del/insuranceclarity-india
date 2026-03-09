import { fetchFromSanity } from "@/sanity/client";
import { POST_BY_SLUG_QUERY } from "@/sanity/queries";
import { urlForImage } from "@/sanity/image";
import { PortableText } from "@portabletext/react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { JsonLd, generateArticleSchema } from "@/components/seo/JsonLd";
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export const revalidate = 60;

type BlogPost = {
    title: string;
    slug: { current: string };
    author?: string | null;
    mainImage?: unknown;
    publishedAt?: string | null;
    body?: any[];
    categories?: string[];
    seoDescription?: string | null;
};

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const post = await fetchFromSanity<BlogPost | null>(POST_BY_SLUG_QUERY, { slug: resolvedParams.slug }, null);

    if (!post) {
        notFound();
    }

    const postData: BlogPost = post;

    const articleSchema = generateArticleSchema({
        title: postData.title,
        description: postData.seoDescription || postData.title,
        image: postData.mainImage ? urlForImage(postData.mainImage).url() : "https://insuranceclarity.in/default-article.jpg",
        author: postData.author || "InsuranceClarity Expert",
        datePublished: postData.publishedAt || new Date().toISOString(),
        url: `https://insuranceclarity.in/blog/${postData.slug.current}`
    });

    return (
        <article className="min-h-screen pt-32 pb-20 px-6">
            <JsonLd data={articleSchema} />
            <div className="max-w-4xl mx-auto space-y-10">
                <Breadcrumbs />

                {/* Back Navigation */}
                <Link href="/blog" className="inline-flex items-center gap-2 text-theme-muted hover:text-accent transition-colors">
                    <ArrowLeft className="w-5 h-5" /> Back to Insights
                </Link>

                {/* Hero Section */}
                <header className="space-y-6">
                    <div className="flex flex-wrap items-center gap-2">
                        {postData.categories?.map((category: string) => (
                            <span key={category} className="text-xs font-bold uppercase tracking-wider text-accent bg-accent/10 px-3 py-1.5 rounded-lg border border-accent/20">
                                {category}
                            </span>
                        ))}
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-theme-primary leading-tight">
                        {postData.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 text-sm text-theme-muted font-medium py-4 border-y border-default">
                        {postData.author && (
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-accent" />
                                <span>{postData.author}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-accent" />
                            <span>{new Date(postData.publishedAt || new Date()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                    </div>
                </header>

                {/* Main Feature Image */}
                {postData.mainImage ? (
                    <div className="aspect-[21/9] w-full bg-slate-100 dark:bg-slate-800 rounded-3xl overflow-hidden shadow-xl border border-default relative">
                        <Image
                            src={urlForImage(postData.mainImage).url()}
                            alt={postData.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                ) : null}

                {/* Portable Text Content (Rich Text) */}
                <div className="prose prose-lg dark:prose-invert prose-headings:font-display prose-headings:font-bold prose-headings:text-theme-primary prose-a:text-accent prose-a:no-underline hover:prose-a:underline max-w-none">
                    {postData.body ? (
                        <PortableText value={postData.body} />
                    ) : (
                        <p className="text-theme-muted italic">This article has no content yet.</p>
                    )}
                </div>

            </div>
        </article>
    );
}
