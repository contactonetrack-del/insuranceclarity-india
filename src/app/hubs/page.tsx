import { fetchFromSanity } from '@/sanity/client';
import { ALL_SEO_CLUSTERS_QUERY } from '@/sanity/queries';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;

type SeoCluster = {
    _id: string;
    title: string;
    slug: { current: string };
    description?: string | null;
    heroImage?: {
        asset?: {
            url?: string | null;
        } | null;
    } | null;
};

export default async function HubsPage() {
    const t = await getTranslations('hubsPage');
    const clusters = await fetchFromSanity<SeoCluster[]>(ALL_SEO_CLUSTERS_QUERY, {}, []);

    if (!clusters || clusters.length === 0) {
        return (
            <div className="min-h-screen pt-24 pb-20 px-6 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <ShieldCheck className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-theme-primary mb-2">{t('emptyTitle')}</h2>
                    <p className="text-theme-secondary">{t('emptyDescription')}</p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen pt-24 pb-20 px-6">
            <div className="max-w-7xl mx-auto space-y-12">
                <header className="text-center">
                    <h1 className="font-display font-bold text-4xl text-theme-primary mb-4">{t('title')}</h1>
                    <p className="text-theme-secondary max-w-2xl mx-auto">
                        {t('subtitle')}
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {clusters.map((cluster) => (
                        <Link
                            key={cluster._id}
                            href={`/${cluster.slug.current}`}
                            className="group block h-full glass rounded-2xl border border-default hover:border-accent/40 transition-all hover:shadow-xl hover:shadow-accent/5 overflow-hidden"
                        >
                            <div className="relative w-full h-48 bg-slate-100 dark:bg-slate-800">
                                {cluster.heroImage?.asset?.url ? (
                                    <Image
                                        src={cluster.heroImage.asset.url}
                                        alt={cluster.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <ShieldCheck className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                                    </div>
                                )}
                            </div>
                            <div className="p-6">
                                <h2 className="text-xl font-bold text-theme-primary mb-2 group-hover:text-accent transition-colors">
                                    {cluster.title}
                                </h2>
                                <p className="text-theme-secondary text-sm">
                                    {cluster.description || t('fallbackDescription')}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
}
