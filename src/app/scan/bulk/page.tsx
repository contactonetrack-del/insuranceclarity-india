import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { BulkDropZone } from '@/components/upload/BulkDropZone';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('auditI18n.bulkScanPage');

    return {
        title: t('metadataTitle'),
        description: t('metadataDescription'),
    };
}

export default async function BulkScanPage() {
    const t = await getTranslations('auditI18n.bulkScanPage');

    return (
        <main className="min-h-screen pt-28 px-6 pb-14">
            <div className="mx-auto max-w-3xl space-y-6">
                <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-accent">{t('badge')}</p>
                    <h1 className="text-3xl font-bold text-theme-primary">{t('title')}</h1>
                    <p className="text-sm text-theme-secondary">
                        {t('description')}
                    </p>
                    <Link href="/pricing" className="inline-flex text-sm font-semibold text-accent underline">
                        {t('viewPlanLimits')}
                    </Link>
                </div>

                <BulkDropZone />
            </div>
        </main>
    );
}
