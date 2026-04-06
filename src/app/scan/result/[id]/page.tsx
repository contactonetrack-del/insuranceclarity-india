'use client';

/**
 * Result Page - /scan/result/[id]
 *
 * Polls for scan status, then displays the full or paywalled report.
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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

const POLL_INTERVAL_MS = 4000; // 4 seconds
const MAX_POLL_ATTEMPTS = 30; // 2 minutes max

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
    const steps = [
        { icon: '📤', label: 'Document uploaded' },
        { icon: '📖', label: 'Extracting policy text' },
        { icon: '🔍', label: 'Identifying risk clauses' },
        { icon: '🤖', label: 'AI analysis running' },
        { icon: '📊', label: 'Calculating score' },
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
                throw new Error(data.error ?? data.message ?? 'Failed to save email notification.');
            }

            setNotifyState('saved');
        } catch (error) {
            setNotifyState('error');
            setNotifyError(error instanceof Error ? error.message : 'Failed to save email notification.');
        }
    }, [notifyEmail, notifyState, scanId]);

    return (
        <div className="processing-screen" aria-live="polite" aria-label="Analyzing your policy">
            <div className="processing-screen__animation">
                <div className="processing-screen__spinner" aria-hidden />
                <span className="processing-screen__emoji" aria-hidden>🛡️</span>
            </div>

            <h1 className="processing-screen__title">Analyzing Your Policy...</h1>
            <p className="processing-screen__subtitle">
                Our AI is reading every clause. This usually takes about 60 seconds.
            </p>

            <div className="processing-progress" role="status" aria-live="polite">
                <div className="processing-progress__track" aria-hidden>
                    <div className="processing-progress__fill" style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="processing-progress__meta">
                    <span>{progressPercent}% complete</span>
                    <span>Checking every {Math.round(POLL_INTERVAL_MS / 1000)}s</span>
                </div>
            </div>

            <ol className="processing-steps" aria-label="Processing steps">
                {steps.map((step, index) => (
                    <li
                        key={step.label}
                        className={[
                            'processing-steps__item',
                            index < activeStep ? 'processing-steps__item--done' : '',
                            index === activeStep ? 'processing-steps__item--active' : '',
                        ].filter(Boolean).join(' ')}
                    >
                        <span className="processing-steps__icon" aria-hidden>{step.icon}</span>
                        {step.label}
                    </li>
                ))}
            </ol>

            <p className="processing-screen__scan-id">
                Report ID: <code>{scanId}</code>
            </p>

            <form className="processing-notify" onSubmit={handleNotify}>
                <label htmlFor="scan-notify-email" className="processing-notify__label">
                    Long wait? We can email your report when it is ready.
                </label>
                <div className="processing-notify__controls">
                    <input
                        id="scan-notify-email"
                        type="email"
                        value={notifyEmail}
                        onChange={(event) => setNotifyEmail(event.target.value)}
                        placeholder="you@example.com"
                        className="processing-notify__input"
                        required
                        disabled={notifyState === 'saving' || notifyState === 'saved'}
                    />
                    <button
                        type="submit"
                        className="processing-notify__btn"
                        disabled={notifyState === 'saving' || notifyState === 'saved'}
                    >
                        {notifyState === 'saving' ? 'Saving...' : notifyState === 'saved' ? 'Saved' : 'Email Me When Ready'}
                    </button>
                </div>

                {notifyState === 'saved' && (
                    <p className="processing-notify__success">Saved. We will email you once analysis is complete.</p>
                )}
                {notifyState === 'error' && notifyError && (
                    <p className="processing-notify__error" role="alert">{notifyError}</p>
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
        const text = `I scanned my insurance policy and got a ${report.score}/100 clarity score. Check yours at Insurance Clarity.`;
        if (navigator.share) {
            await navigator.share({ title: 'My Insurance Policy Scan', text, url: shareUrl });
        } else {
            await navigator.clipboard.writeText(`${text}\n${shareUrl}`);
            alert('Link copied to clipboard.');
        }
    }, [report.score, shareUrl]);

    return (
        <div className="report" id="report-content">
            <header className="report__header">
                <div className="report__header-left">
                    <h1 className="report__title">Policy Analysis Report</h1>
                    <p className="report__subtitle">
                        AI analysis complete - here is what your insurer did not tell you.
                    </p>
                </div>
                <div className="report__header-actions">
                    {!isFree && (
                        <a
                            className="report__download-btn"
                            href={pdfExportUrl}
                            aria-label="Download full report as PDF"
                            id="download-report-pdf-btn"
                        >
                            Download PDF
                        </a>
                    )}
                    <button
                        className="report__share-btn"
                        onClick={() => void handleShare()}
                        aria-label="Share this report"
                        id="share-report-btn"
                    >
                        Share
                    </button>
                </div>
            </header>

            <section className="report__score-section" aria-label="Policy clarity score">
                <ScoreRing score={report.score} size={200} animated />
                <div className="report__summary">
                    <h2 className="report__summary-title">Policy Summary</h2>
                    <p className="report__summary-text">{report.summary}</p>
                    <div className="report__stats" role="list" aria-label="Analysis statistics">
                        <div role="listitem" className="report__stat">
                            <span className="report__stat-num">{free.risks?.length ?? 0}</span>
                            <span className="report__stat-label">Risks Found</span>
                        </div>
                        {!isFree && (
                            <>
                                <div role="listitem" className="report__stat">
                                    <span className="report__stat-num">{full.exclusions?.length ?? 0}</span>
                                    <span className="report__stat-label">Exclusions</span>
                                </div>
                                <div role="listitem" className="report__stat">
                                    <span className="report__stat-num">{full.suggestions?.length ?? 0}</span>
                                    <span className="report__stat-label">Suggestions</span>
                                </div>
                                <div role="listitem" className="report__stat">
                                    <span className="report__stat-num">{full.hiddenClauses?.length ?? 0}</span>
                                    <span className="report__stat-label">Hidden Clauses</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </section>

            <section className="report__section" aria-label="Top risks identified">
                <h2 className="report__section-title">Top Risks ({free.risks?.length ?? 0} found)</h2>
                <div className="report__cards-grid">
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
                        <section className="report__section" aria-label="Policy exclusions">
                            <h2 className="report__section-title">Exclusions ({full.exclusions.length})</h2>
                            <div className="report__cards-list">
                                {full.exclusions.map((exclusion, index) => (
                                    <ExclusionCard key={index} exclusion={exclusion} index={index} />
                                ))}
                            </div>
                        </section>
                    )}

                    {full.hiddenClauses?.length > 0 && (
                        <section className="report__section" aria-label="Hidden clauses">
                            <h2 className="report__section-title">Hidden Clauses ({full.hiddenClauses.length})</h2>
                            <div className="report__cards-list">
                                {full.hiddenClauses.map((hiddenClause, index) => (
                                    <HiddenClauseCard key={index} hiddenClause={hiddenClause} index={index} />
                                ))}
                            </div>
                        </section>
                    )}

                    {full.suggestions?.length > 0 && (
                        <section className="report__section" aria-label="Actionable suggestions">
                            <h2 className="report__section-title">What to Do ({full.suggestions.length} actions)</h2>
                            <div className="report__cards-list">
                                {full.suggestions.map((suggestion, index) => (
                                    <SuggestionCard key={index} suggestion={suggestion} index={index} />
                                ))}
                            </div>
                        </section>
                    )}
                </>
            )}

            <div className="report__footer">
                <Link href="/scan" className="report__scan-another-btn" id="scan-another-btn">
                    Scan Another Policy
                </Link>
                <p className="report__disclaimer">
                    This report is generated by AI and is for informational purposes only.
                    It is not financial or legal advice. Always consult a certified insurance advisor.
                </p>
            </div>
        </div>
    );
}

function ErrorScreen({ scanId }: { scanId: string }) {
    return (
        <div className="result-error" role="alert">
            <span className="result-error__icon" aria-hidden>❌</span>
            <h1>Analysis Failed</h1>
            <p>
                We could not analyze this policy. The document may be scanned (image-based),
                password-protected, or in an unsupported format.
            </p>
            <p className="result-error__id">Report ID: {scanId}</p>
            <Link href="/scan" className="result-error__retry-btn" id="retry-scan-btn">
                Try Another PDF
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
        <main className="result-page" id="main-content">
            <div className="result-page__container">
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
        </main>
    );
}
