'use client';

/**
 * Result Page - /scan/result/[id]
 *
 * Polls for scan status, then displays the full or paywalled report.
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PaywallGate } from '@/components/report/PaywallGate';
import { RiskCard, ExclusionCard, HiddenClauseCard, SuggestionCard } from '@/components/report/RiskCard';
import { ScoreRing } from '@/components/report/ScoreRing';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import type {
    FreeReportResponse,
    FullReportResponse,
    ReportResponse,
    ScanStatus,
} from '@/types/report.types';

const POLL_INTERVAL_MS = 4000;
const MAX_POLL_ATTEMPTS = 30;

async function getCsrfToken(): Promise<string | null> {
    if (typeof document !== 'undefined') {
        const match = document.cookie.match(/(?:^|;\s*)__csrf=([^;]+)/);
        if (match) return decodeURIComponent(match[1]);
    }

    try {
        const res = await fetch('/api/csrf');
        if (!res.ok) return null;
        const data = await res.json() as { csrfToken?: string };
        return data.csrfToken ?? null;
    } catch {
        return null;
    }
}

function ProcessingScreen({
    scanId,
    attempts,
}: {
    scanId: string;
    attempts: number;
}) {
    const t = useTranslations('scan.resultPage.processing');
    const steps = [
        { icon: '📤', label: t('steps.uploaded') },
        { icon: '📖', label: t('steps.extracting') },
        { icon: '🔍', label: t('steps.identifying') },
        { icon: '🤖', label: t('steps.analyzing') },
        { icon: '📊', label: t('steps.scoring') },
    ];

    const [notifyEmail, setNotifyEmail] = useState('');
    const [notifyState, setNotifyState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [notifyError, setNotifyError] = useState<string | null>(null);
    const progressPercent = Math.min(95, Math.max(8, Math.round((attempts / MAX_POLL_ATTEMPTS) * 100)));
    const activeStep = Math.min(
        steps.length - 1,
        Math.max(0, Math.floor((progressPercent / 100) * steps.length)),
    );

    const handleNotify = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!notifyEmail || notifyState === 'saving' || notifyState === 'saved') return;

        setNotifyState('saving');
        setNotifyError(null);

        try {
            const csrfToken = await getCsrfToken();
            const response = await fetch('/api/scan/notify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
                },
                body: JSON.stringify({
                    scanId,
                    email: notifyEmail,
                }),
            });

            const data = await response.json() as { success?: boolean; message?: string; error?: string };
            if (!response.ok || data.success === false) {
                throw new Error(data.error ?? data.message ?? t('errors.saveFailed'));
            }

            setNotifyState('saved');
        } catch (error) {
            setNotifyState('error');
            setNotifyError(error instanceof Error ? error.message : t('errors.saveFailed'));
        }
    }, [notifyEmail, notifyState, scanId, t]);

    return (
        <div
            className="flex flex-col items-center gap-6 px-6 py-[60px] text-center animate-[fade-in_var(--motion-fast)_var(--ease-out-expo)]"
            aria-live="polite"
            aria-label={t('ariaAnalyzingPolicy')}
        >
            <div className="relative flex h-20 w-20 items-center justify-center">
                <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-r-[rgb(var(--token-brand-hover))] border-t-[rgb(var(--token-brand))]" aria-hidden />
                <span className="text-[2rem] animate-[float_3s_var(--ease-in-out)_infinite]" aria-hidden>🛡️</span>
            </div>

            <h1 className="m-0 text-[clamp(1.5rem,4vw,2rem)] font-extrabold tracking-[-0.02em] text-[rgb(var(--color-text-primary))]">
                {t('title')}
            </h1>
            <p className="m-0 max-w-[400px] text-base text-[rgb(var(--color-text-secondary))]">
                {t('subtitle')}
            </p>

            <div className="mt-1 flex w-full max-w-[520px] flex-col gap-2" role="status" aria-live="polite">
                <div className="h-2.5 w-full overflow-hidden rounded-full border border-[var(--border-default)] bg-[rgba(var(--color-bg-tertiary),0.9)]" aria-hidden>
                    <div
                        className="relative h-full rounded-full bg-[var(--token-gradient-accent)] transition-[width] duration-500 ease-[var(--ease-out-expo)] after:absolute after:inset-0 after:bg-[length:200%_100%] after:bg-[linear-gradient(90deg,transparent_0%,rgb(255_255_255_/_0.3)_50%,transparent_100%)] after:content-[''] after:animate-[shimmer_1.5s_linear_infinite]"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
                <div className="flex items-center justify-between gap-2.5 text-[0.78rem] text-[rgb(var(--color-text-muted))]">
                    <span>{t('progressComplete', { percent: progressPercent })}</span>
                    <span>{t('checkingEvery', { seconds: Math.round(POLL_INTERVAL_MS / 1000) })}</span>
                </div>
            </div>

            <ol className="m-0 flex min-w-[260px] list-none flex-col gap-2.5 p-0 text-left" aria-label={t('ariaProcessingSteps')}>
                {steps.map((step, index) => {
                    const isDone = index < activeStep;
                    const isActive = index === activeStep;

                    return (
                        <li
                            key={step.label}
                            className={[
                                'flex items-center gap-3 rounded-md px-3.5 py-2.5 text-[0.9rem] font-medium transition-[color,background] duration-[var(--motion-fast)] ease-[var(--ease-out-expo)]',
                                isDone ? 'text-[rgb(var(--token-semantic-success))]' : 'text-[rgb(var(--color-text-muted))]',
                                isActive ? 'bg-[rgb(var(--token-brand)_/_0.06)] font-semibold text-[rgb(var(--color-text-primary))]' : '',
                            ].join(' ')}
                        >
                            <span className="w-6 shrink-0 text-center text-[1.1rem]" aria-hidden>{step.icon}</span>
                            {step.label}
                        </li>
                    );
                })}
            </ol>

            <p className="text m-0 text-xs text-[rgb(var(--color-text-muted))]">
                {t('reportId')} <code className="rounded bg-[rgba(var(--color-bg-tertiary),0.8)] px-1.5 py-0.5 font-mono text-[0.7rem]">{scanId}</code>
            </p>

            <form
                className="flex w-full max-w-[520px] flex-col gap-2.5 rounded-lg border border-[var(--border-default)] bg-[rgba(var(--color-card-bg),0.85)] p-3.5 backdrop-blur-[12px]"
                onSubmit={handleNotify}
            >
                <label htmlFor="scan-notify-email" className="text-left text-[0.85rem] font-semibold text-[rgb(var(--color-text-secondary))]">
                    {t('notify.label')}
                </label>

                <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                        id="scan-notify-email"
                        type="email"
                        value={notifyEmail}
                        onChange={(event) => setNotifyEmail(event.target.value)}
                        placeholder={t('notify.emailPlaceholder')}
                        className="min-h-10 flex-1 rounded-md border border-[var(--border-default)] bg-[rgba(var(--color-bg-tertiary),0.9)] px-3 text-[0.9rem] text-[rgb(var(--color-text-primary))] focus:border-[rgb(var(--token-brand)_/_0.5)] focus:outline-none focus:shadow-[0_0_0_3px_rgb(var(--token-brand)_/_0.12)]"
                        required
                        disabled={notifyState === 'saving' || notifyState === 'saved'}
                    />
                    <button
                        type="submit"
                        className="min-h-10 rounded-md border-none bg-[var(--token-gradient-accent)] px-3.5 text-[0.85rem] font-bold text-white transition-[transform,opacity] duration-[var(--motion-fast)] ease-[var(--ease-spring)] hover:translate-y-[-1px] disabled:cursor-default disabled:opacity-75"
                        disabled={notifyState === 'saving' || notifyState === 'saved'}
                    >
                        {notifyState === 'saving' ? t('notify.saving') : notifyState === 'saved' ? t('notify.savedButton') : t('notify.cta')}
                    </button>
                </div>

                {notifyState === 'saved' && (
                    <p className="m-0 text-left text-[0.8rem] text-[rgb(var(--token-semantic-success))]">{t('notify.savedSuccess')}</p>
                )}
                {notifyState === 'error' && notifyError && (
                    <p className="m-0 text-left text-[0.8rem] text-[rgb(var(--token-semantic-danger))]" role="alert">
                        {notifyError}
                    </p>
                )}
            </form>
        </div>
    );
}

function ReportDisplay({
    report,
    scanId,
    onUnlocked,
}: {
    report: ReportResponse;
    scanId: string;
    onUnlocked: () => void;
}) {
    const t = useTranslations('scan.resultPage.report');
    const isFree = report.isPaid === false;
    const free = report as FreeReportResponse;
    const full = report as FullReportResponse;

    const shareUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/scan/result/${scanId}`
        : '';
    const claimToken = typeof window !== 'undefined'
        ? sessionStorage.getItem(`scan_claim_${scanId}`)
        : null;
    const pdfExportUrl = claimToken
        ? `/api/result/${scanId}/pdf?ct=${encodeURIComponent(claimToken)}`
        : `/api/result/${scanId}/pdf`;

    const handleShare = useCallback(async () => {
        const text = t('share.summaryText', { score: report.score });
        if (navigator.share) {
            await navigator.share({ title: t('share.title'), text, url: shareUrl });
        } else {
            await navigator.clipboard.writeText(`${text}\n${shareUrl}`);
            alert(t('share.copySuccess'));
        }
    }, [report.score, shareUrl, t]);

    return (
        <div className="flex flex-col gap-8 animate-[fade-in-up_var(--motion-medium)_var(--ease-out-expo)]" id="report-content">
            <header className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="mb-1.5 text-[clamp(1.5rem,4vw,2rem)] font-extrabold tracking-[-0.025em] text-[rgb(var(--color-text-primary))]">
                        {t('header.title')}
                    </h1>
                    <p className="m-0 text-[0.9375rem] text-[rgb(var(--color-text-secondary))]">
                        {t('header.subtitle')}
                    </p>
                </div>

                <div className="inline-flex shrink-0 flex-wrap items-center justify-end gap-2.5">
                    {!isFree && (
                        <a
                            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-[rgb(var(--token-brand)_/_0.28)] bg-[rgb(var(--token-brand)_/_0.1)] px-[18px] py-[9px] text-[0.875rem] font-semibold text-[rgb(var(--color-text-secondary))] no-underline transition-[border-color,transform,color,background] duration-[var(--motion-fast)] ease-[var(--ease-out-expo)] hover:translate-y-[-1px] hover:border-[var(--border-hover)] hover:text-[rgb(var(--color-accent))]"
                            href={pdfExportUrl}
                            aria-label={t('actions.downloadAria')}
                            id="download-report-pdf-btn"
                        >
                            {t('actions.download')}
                        </a>
                    )}

                    <button
                        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-[var(--border-default)] bg-[rgba(var(--color-card-bg),0.9)] px-[18px] py-[9px] text-[0.875rem] font-semibold text-[rgb(var(--color-text-secondary))] transition-[border-color,transform,color] duration-[var(--motion-fast)] ease-[var(--ease-out-expo)] hover:translate-y-[-1px] hover:border-[var(--border-hover)] hover:text-[rgb(var(--color-accent))]"
                        onClick={() => void handleShare()}
                        aria-label={t('actions.shareAria')}
                        id="share-report-btn"
                    >
                        {t('actions.share')}
                    </button>
                </div>
            </header>

            <section
                className="flex flex-col items-center gap-8 rounded-xl border border-[var(--border-default)] bg-[rgba(var(--color-card-bg),0.85)] p-8 shadow-[var(--shadow-md)] backdrop-blur-[16px] sm:flex-row sm:items-start"
                aria-label={t('sections.scoreAria')}
            >
                <ScoreRing score={report.score} size={200} animated />
                <div className="flex flex-1 flex-col gap-3">
                    <h2 className="m-0 text-lg font-bold text-[rgb(var(--color-text-primary))]">
                        {t('sections.summaryTitle')}
                    </h2>
                    <p className="m-0 text-[0.9375rem] leading-[1.7] text-[rgb(var(--color-text-secondary))]">{report.summary}</p>

                    <div className="mt-2 flex flex-wrap gap-5" role="list" aria-label={t('sections.statsAria')}>
                        <div role="listitem" className="flex min-w-[52px] flex-col items-center gap-0.5">
                            <span className="text-2xl font-extrabold leading-none text-[rgb(var(--token-brand))]">{free.risks?.length ?? 0}</span>
                            <span className="text-center text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-[rgb(var(--color-text-muted))]">
                                {t('stats.risksFound')}
                            </span>
                        </div>

                        {!isFree && (
                            <>
                                <div role="listitem" className="flex min-w-[52px] flex-col items-center gap-0.5">
                                    <span className="text-2xl font-extrabold leading-none text-[rgb(var(--token-brand))]">{full.exclusions?.length ?? 0}</span>
                                    <span className="text-center text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-[rgb(var(--color-text-muted))]">
                                        {t('stats.exclusions')}
                                    </span>
                                </div>
                                <div role="listitem" className="flex min-w-[52px] flex-col items-center gap-0.5">
                                    <span className="text-2xl font-extrabold leading-none text-[rgb(var(--token-brand))]">{full.suggestions?.length ?? 0}</span>
                                    <span className="text-center text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-[rgb(var(--color-text-muted))]">
                                        {t('stats.suggestions')}
                                    </span>
                                </div>
                                <div role="listitem" className="flex min-w-[52px] flex-col items-center gap-0.5">
                                    <span className="text-2xl font-extrabold leading-none text-[rgb(var(--token-brand))]">{full.hiddenClauses?.length ?? 0}</span>
                                    <span className="text-center text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-[rgb(var(--color-text-muted))]">
                                        {t('stats.hiddenClauses')}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </section>

            <section className="flex flex-col gap-4" aria-label={t('sections.topRisksAria')}>
                <h2 className="m-0 border-b border-[var(--border-default)] pb-3 text-lg font-bold text-[rgb(var(--color-text-primary))]">
                    {t('sections.topRisks', { count: free.risks?.length ?? 0 })}
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {(free.risks ?? []).map((risk, index) => (
                        <RiskCard key={index} risk={risk} index={index} />
                    ))}
                </div>
            </section>

            {isFree ? (
                <PaywallGate
                    scanId={scanId}
                    message={free.paywallMessage}
                    exclusionsCount={free.exclusionsCount}
                    suggestionsCount={free.suggestionsCount}
                    hiddenClausesCount={free.hiddenClausesCount}
                    onUnlocked={onUnlocked}
                />
            ) : (
                <>
                    {full.exclusions?.length > 0 && (
                        <section className="flex flex-col gap-4" aria-label={t('sections.exclusionsAria')}>
                            <h2 className="m-0 border-b border-[var(--border-default)] pb-3 text-lg font-bold text-[rgb(var(--color-text-primary))]">
                                {t('sections.exclusions', { count: full.exclusions.length })}
                            </h2>
                            <div className="flex flex-col gap-2.5">
                                {full.exclusions.map((exclusion, index) => (
                                    <ExclusionCard key={index} exclusion={exclusion} index={index} />
                                ))}
                            </div>
                        </section>
                    )}

                    {full.hiddenClauses?.length > 0 && (
                        <section className="flex flex-col gap-4" aria-label={t('sections.hiddenClausesAria')}>
                            <h2 className="m-0 border-b border-[var(--border-default)] pb-3 text-lg font-bold text-[rgb(var(--color-text-primary))]">
                                {t('sections.hiddenClauses', { count: full.hiddenClauses.length })}
                            </h2>
                            <div className="flex flex-col gap-2.5">
                                {full.hiddenClauses.map((hiddenClause, index) => (
                                    <HiddenClauseCard key={index} hiddenClause={hiddenClause} index={index} />
                                ))}
                            </div>
                        </section>
                    )}

                    {full.suggestions?.length > 0 && (
                        <section className="flex flex-col gap-4" aria-label={t('sections.suggestionsAria')}>
                            <h2 className="m-0 border-b border-[var(--border-default)] pb-3 text-lg font-bold text-[rgb(var(--color-text-primary))]">
                                {t('sections.suggestions', { count: full.suggestions.length })}
                            </h2>
                            <div className="flex flex-col gap-2.5">
                                {full.suggestions.map((suggestion, index) => (
                                    <SuggestionCard key={index} suggestion={suggestion} index={index} />
                                ))}
                            </div>
                        </section>
                    )}
                </>
            )}

            <div className="flex flex-col items-center gap-3.5 border-t border-[var(--border-default)] pt-2">
                <Link
                    href="/scan"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[rgb(var(--token-brand)_/_0.25)] bg-[rgb(var(--token-brand)_/_0.08)] px-7 py-3 text-[0.9375rem] font-semibold text-[rgb(var(--token-brand))] no-underline transition-[background,transform,border-color] duration-[var(--motion-fast)] ease-[var(--ease-out-expo)] hover:translate-y-[-2px] hover:border-[rgb(var(--token-brand)_/_0.4)] hover:bg-[rgb(var(--token-brand)_/_0.12)]"
                    id="scan-another-btn"
                >
                    {t('footer.scanAnother')}
                </Link>

                <p className="m-0 max-w-[480px] text-center text-xs leading-[1.6] text-[rgb(var(--color-text-muted))]">
                    {t('footer.disclaimer')}
                </p>
            </div>
        </div>
    );
}

function ErrorScreen({ scanId }: { scanId: string }) {
    const t = useTranslations('scan.resultPage.error');

    return (
        <div className="flex flex-col items-center gap-4 px-6 py-[60px] text-center animate-[fade-in_var(--motion-fast)_var(--ease-out-expo)]" role="alert">
            <span className="text-5xl" aria-hidden>❌</span>
            <h1 className="m-0 text-[1.75rem] font-extrabold text-[rgb(var(--color-text-primary))]">{t('title')}</h1>
            <p className="m-0 max-w-[400px] text-[0.9375rem] leading-[1.65] text-[rgb(var(--color-text-secondary))]">
                {t('description')}
            </p>
            <p className="m-0 font-mono text-xs text-[rgb(var(--color-text-muted))]">
                {t('reportId', { id: scanId })}
            </p>
            <Link
                href="/scan"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--token-gradient-accent)] px-7 py-3 font-bold text-white no-underline transition-[transform,box-shadow] duration-[var(--motion-fast)] ease-[var(--ease-spring)] hover:translate-y-[-2px] hover:shadow-[var(--shadow-lg)]"
                id="retry-scan-btn"
            >
                {t('retry')}
            </Link>
        </div>
    );
}

export default function ResultPage() {
    const params = useParams<{ id: string }>();
    const scanId = params.id;

    const [scanStatus, setScanStatus] = useState<ScanStatus>('PENDING');
    const [report, setReport] = useState<ReportResponse | null>(null);
    const [attempts, setAttempts] = useState(0);

    const fetchReport = useCallback(async () => {
        try {
            const claimToken = typeof window !== 'undefined'
                ? sessionStorage.getItem(`scan_claim_${scanId}`)
                : null;

            const res = await fetch(`/api/result/${scanId}`, {
                headers: {
                    ...(claimToken ? { 'X-Claim-Token': claimToken } : {}),
                },
            });

            if (res.status === 202) {
                const data = await res.json() as { status: ScanStatus };
                setScanStatus(data.status);
                return false;
            }

            if (res.status === 422) {
                setScanStatus('FAILED');
                return true;
            }

            if (res.ok) {
                const data = await res.json() as ReportResponse;
                setReport(data);
                setScanStatus('COMPLETED');
                return true;
            }

            return false;
        } catch {
            return false;
        }
    }, [scanId]);

    useEffect(() => {
        if (!scanId) return;

        let timeout: ReturnType<typeof setTimeout> | null = null;
        let cancelled = false;
        let attemptCount = 0;

        const poll = async () => {
            if (cancelled) return;

            const done = await fetchReport();
            attemptCount += 1;
            setAttempts(attemptCount);

            if (done) return;

            if (attemptCount >= MAX_POLL_ATTEMPTS) {
                setScanStatus('FAILED');
                return;
            }

            timeout = setTimeout(poll, POLL_INTERVAL_MS);
        };

        void poll();
        return () => {
            cancelled = true;
            if (timeout) clearTimeout(timeout);
        };
    }, [scanId, fetchReport]);

    const handleUnlocked = useCallback(() => {
        void fetchReport();
    }, [fetchReport]);

    return (
        <section className="min-h-screen px-4 pb-20 pt-12">
            <div className="mx-auto max-w-[800px]">
                <ErrorBoundary>
                    {scanStatus === 'FAILED' && <ErrorScreen scanId={scanId} />}

                    {(scanStatus === 'PENDING' || scanStatus === 'PROCESSING') && !report && (
                        <ProcessingScreen scanId={scanId} attempts={attempts} />
                    )}

                    {report && (
                        <ReportDisplay
                            report={report}
                            scanId={scanId}
                            onUnlocked={handleUnlocked}
                        />
                    )}
                </ErrorBoundary>
            </div>
        </section>
    );
}
