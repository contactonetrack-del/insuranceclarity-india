import { notFound } from "next/navigation";
import { headers } from "next/headers";
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
import { prisma } from '@/lib/prisma';
import { ArrowRight, Shield, Check } from 'lucide-react';

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

    const nonce = (await headers()).get('x-nonce') || undefined;

    // Try matching slug to Prisma categories (either direct match or appending '-insurance')
    const possibleDbSlugs = [resolvedParams.slug, `${resolvedParams.slug}-insurance`];
    const dbCategory = await prisma.insuranceCategory.findFirst({
        where: { slug: { in: possibleDbSlugs } },
        include: {
            subcat: {
                include: {
                    types: {
                        include: {
                            policies: { take: 4 } // Get up to 4 top policies per type
                        }
                    }
                }
            }
        }
    });

    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', item: 'https://insuranceclarity.in' },
        { name: 'Insurance Guides', item: 'https://insuranceclarity.in/insurance' },
        { name: post.title, item: `https://insuranceclarity.in/insurance/${resolvedParams.slug}` }
    ]);

    return (
        <article className="min-h-screen pt-24 pb-20 px-6">
            <JsonLd data={breadcrumbSchema} nonce={nonce} />
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

                {/* Database Products Integration */}
                {dbCategory && dbCategory.subcat.some(sub => sub.types.some(t => t.policies.length > 0)) && (
                    <div className="mt-16 mb-12">
                        <h2 className="text-3xl font-display font-bold text-theme-primary mb-8">
                            Top <span className="text-gradient">{dbCategory.name}</span> Plans in India
                        </h2>
                        
                        <div className="space-y-12">
                            {dbCategory.subcat.map(sub => (
                                <div key={sub.id}>
                                    <h3 className="text-xl font-bold text-theme-secondary mb-6 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                                            <Shield className="w-4 h-4" />
                                        </div>
                                        {sub.name}
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {sub.types.flatMap(t => t.policies).slice(0, 4).map(policy => (
                                            <div key={policy.id} className="glass p-6 rounded-2xl border border-default hover:border-accent transition-colors group">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <span className="text-xs font-bold uppercase tracking-wider text-accent mb-1 block">
                                                            {policy.providerName}
                                                        </span>
                                                        <h4 className="text-lg font-bold text-theme-primary leading-tight">
                                                            {policy.productName}
                                                        </h4>
                                                    </div>
                                                </div>
                                                
                                                <ul className="space-y-2 mb-6">
                                                    {policy.benefits.slice(0, 3).map((benefit, i) => (
                                                        <li key={i} className="text-sm text-theme-muted flex items-start gap-2">
                                                            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                                            <span className="line-clamp-1">{benefit}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                                
                                                <Link href={`/tools/compare?policy=${policy.seoSlug}`} className="btn-secondary w-full justify-center group-hover:bg-accent group-hover:text-white transition-all">
                                                    View Details <ArrowRight className="w-4 h-4 ml-1" />
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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
