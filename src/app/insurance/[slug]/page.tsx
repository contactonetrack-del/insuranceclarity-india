import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { fetchFromSanity } from "@/sanity/client";
import { POST_BY_SLUG_QUERY } from "@/sanity/queries";
import { urlFor } from "@/sanity/client";
import { Calendar, ShieldCheck, Clock, User } from "lucide-react";
import { PortableText } from '@portabletext/react';
import { JsonLd, generateBreadcrumbSchema } from "@/components/seo/JsonLd";
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import LeadCaptureForm from '@/components/ui/LeadCaptureForm';
import TrustSignals from '@/components/ui/TrustSignals';

export const revalidate = 3600; // Cache for 1 hour

type SanityImageRef = {
    _type: string;
    asset: { _ref: string; _type: string };
};

type PortableTextBlock = Record<string, unknown>;

type Post = {
    _id: string;
    title: string;
    slug: { current: string };
    author?: string;
    mainImage?: SanityImageRef;
    publishedAt?: string | null;
    body?: PortableTextBlock[];
    categories?: string[];
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const post = await fetchFromSanity<Post | null>(POST_BY_SLUG_QUERY, { slug: resolvedParams.slug }, null);

    if (!post) {
        return {
            title: 'Not Found | InsuranceClarity',
        };
    }

    return {
        title: `${post.title} | InsuranceClarity`,
        description: `Comprehensive guide to ${post.title}. Learn everything you need to know about this policy on InsuranceClarity India.`,
    };
}

export default async function InsuranceGuidePage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const post = await fetchFromSanity<Post | null>(POST_BY_SLUG_QUERY, { slug: resolvedParams.slug }, null);

    if (!post) {
        return notFound();
    }

    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', item: 'https://insuranceclarity.in' },
        { name: 'Insurance Guides', item: 'https://insuranceclarity.in/insurance' },
        { name: post.title, item: `https://insuranceclarity.in/insurance/${resolvedParams.slug}` }
    ]);

    return (
        <article className="min-h-screen pt-24 pb-20 px-6">
            <JsonLd data={breadcrumbSchema} />
            <div className="max-w-4xl mx-auto">
                <Breadcrumbs />
                <div className="mb-8 mt-4">
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                        {post.categories?.[0] && (
                            <span className="text-sm font-bold uppercase text-accent bg-accent/10 px-3 py-1 rounded-full">
                                {post.categories[0]}
                            </span>
                        )}
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-theme-primary mb-6 leading-tight">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 text-sm text-theme-muted mb-8 border-b border-default pb-8">
                        {post.author && (
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-accent" />
                                <span className="font-medium text-theme-secondary">{post.author}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recently Updated'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span>8 min read</span>
                        </div>
                    </div>
                </div>

                {post.mainImage && (
                    <div className="relative w-full h-[400px] md:h-[500px] mb-12 rounded-3xl overflow-hidden shadow-xl border border-default">
                        <Image
                            src={urlFor(post.mainImage).url()}
                            alt={post.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                )}

                <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-display prose-headings:font-bold prose-a:text-accent hover:prose-a:text-accent-hover prose-img:rounded-2xl">
                    {post.body ? (
                        <PortableText value={post.body as any} />
                    ) : (
                        <div className="glass p-12 text-center rounded-3xl border border-dashed border-default">
                            <ShieldCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-theme-primary mb-2">Detailed Guide Coming Soon</h3>
                            <p className="text-theme-muted">Our experts are currently writing the comprehensive guide for {post.title}.</p>
                        </div>
                    )}
                </div>

                <TrustSignals />

                <div className="mt-16 bg-theme-base/30 rounded-3xl p-1 shadow-sm border border-default">
                    <LeadCaptureForm
                        title={`Need Help Choosing ${post.categories?.[0] || 'a Policy'}?`}
                        subtitle="Let our IRDAI-certified experts design a custom plan for your unique needs."
                        defaultInsuranceType={post.categories?.[0] || 'Health Insurance'}
                    />
                </div>

                <div className="mt-8 pt-8 border-t border-default flex justify-between items-center">
                    <Link href="/hubs" className="btn-secondary">
                        Explore Knowledge Hubs
                    </Link>
                    <Link href="/tools/compare" className="btn-primary">
                        Compare Policies Now
                    </Link>
                </div>
            </div>
        </article>
    );
}
