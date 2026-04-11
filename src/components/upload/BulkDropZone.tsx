'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

type BulkResult = {
    fileName: string;
    ok: boolean;
    scanId?: string;
    message?: string;
    error?: string;
};

type BulkResponse = {
    successCount: number;
    failureCount: number;
    results: BulkResult[];
    error?: string;
    upgradeUrl?: string;
};

async function getCsrfToken(): Promise<string | null> {
    try {
        const res = await fetch('/api/csrf');
        if (!res.ok) return null;
        const body = await res.json() as { csrfToken?: string };
        return body.csrfToken ?? null;
    } catch {
        return null;
    }
}

export function BulkDropZone() {
    const t = useTranslations('auditI18n.bulkDropZone');
    const [files, setFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [upgradeUrl, setUpgradeUrl] = useState<string | null>(null);
    const [results, setResults] = useState<BulkResult[]>([]);

    const totalSizeMb = useMemo(
        () => files.reduce((sum, f) => sum + f.size, 0) / (1024 * 1024),
        [files],
    );

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (files.length < 2) {
            setError('Select at least 2 PDF files.');
            return;
        }

        setIsSubmitting(true);
        setError(null);
        setUpgradeUrl(null);
        setResults([]);

        try {
            const csrfToken = await getCsrfToken();
            const formData = new FormData();
            for (const file of files) {
                formData.append('files', file);
            }

            const response = await fetch('/api/upload/bulk', {
                method: 'POST',
                headers: csrfToken ? { 'x-csrf-token': csrfToken } : undefined,
                body: formData,
            });

            const body = await response.json() as BulkResponse;
            if (!response.ok) {
                setError(body.error ?? 'Bulk upload failed.');
                setUpgradeUrl(body.upgradeUrl ?? null);
                return;
            }

            setResults(body.results ?? []);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Bulk upload failed.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form className="glass-strong rounded-2xl border border-default p-6 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
                <h2 className="text-xl font-bold text-theme-primary">{t('title')}</h2>
                <p className="text-sm text-theme-secondary">
                    {t('subtitle')}
                </p>
            </div>

            <input
                type="file"
                accept="application/pdf"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                className="block w-full text-sm text-theme-secondary file:mr-4 file:rounded-lg file:border-0 file:bg-accent file:px-4 file:py-2 file:text-white"
            />

            <p className="text-xs text-theme-muted">
                Selected: {files.length} file(s) • Approx {totalSizeMb.toFixed(1)} MB
            </p>

            <button
                type="submit"
                disabled={isSubmitting || files.length < 2}
                className="inline-flex items-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
                {isSubmitting ? t('starting') : t('start')}
            </button>

            {error && (
                <div className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm text-rose-700">
                    <p>{error}</p>
                    {upgradeUrl && (
                        <Link className="mt-2 inline-block font-semibold underline" href={upgradeUrl}>
                            {t('upgradePlan')}
                        </Link>
                    )}
                </div>
            )}

            {results.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-semibold text-theme-primary">{t('resultsTitle')}</p>
                    <ul className="space-y-2">
                        {results.map((result) => (
                            <li
                                key={`${result.fileName}-${result.scanId ?? result.error}`}
                                className={`rounded-lg border p-3 text-sm ${
                                    result.ok ? 'border-success-500/25 bg-success-500/10' : 'border-danger-500/25 bg-danger-500/10'
                                }`}
                            >
                                <p className="font-medium">{result.fileName}</p>
                                {result.ok && result.scanId ? (
                                    <Link className="text-success-500 underline" href={`/scan/result/${result.scanId}`}>
                                        {t('viewReport')}
                                    </Link>
                                ) : (
                                    <p className="text-danger-500">{result.error ?? 'Failed'}</p>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </form>
    );
}
