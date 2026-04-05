import type { Metadata } from 'next';
import Link from 'next/link';
import { BulkDropZone } from '@/components/upload/BulkDropZone';

export const metadata: Metadata = {
    title: 'Bulk Scan | Insurance Clarity',
    description: 'Enterprise bulk upload for policy scan and AI analysis.',
};

export default function BulkScanPage() {
    return (
        <main className="min-h-screen pt-28 px-6 pb-14">
            <div className="mx-auto max-w-3xl space-y-6">
                <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-accent">Enterprise</p>
                    <h1 className="text-3xl font-bold text-theme-primary">Bulk Policy Scan</h1>
                    <p className="text-sm text-theme-secondary">
                        This workflow is available on Enterprise plans. If your plan does not include bulk scan,
                        the API will return an upgrade prompt.
                    </p>
                    <Link href="/pricing" className="inline-flex text-sm font-semibold text-accent underline">
                        View plan limits
                    </Link>
                </div>

                <BulkDropZone />
            </div>
        </main>
    );
}
