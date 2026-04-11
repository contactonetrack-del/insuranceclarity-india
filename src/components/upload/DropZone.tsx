'use client';

/**
 * DropZone — PDF Upload Component
 *
 * Drag-and-drop PDF upload with visual feedback, file validation,
 * and upload progress indicator.
 */

import { useCallback, useState, useRef } from 'react';
import { useScanStore } from '@/store/scan.store';
import { validatePdfFile, MAX_FILE_SIZE_MB } from '@/services/pdf.service';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

// ─── Icons (inline SVG — no icon library dependency) ──────────────────────────

function UploadIcon() {
    return (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
    );
}

function ShieldIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DropZone() {
    const router      = useRouter();
    const t           = useTranslations('scan.dropzone');
    const auditT      = useTranslations('auditI18n.dropZone');
    const { setScanId, setUploadProgress, setProcessingStep, setStatus } = useScanStore();

    const [isDragging, setIsDragging]     = useState(false);
    const [error, setError]               = useState<string | null>(null);
    const [isUploading, setIsUploading]   = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── File Processing ──────────────────────────────────────────────────────

    const processFile = useCallback(async (file: File) => {
        setError(null);
        setSelectedFile(null);

        // Client-side validation
        const validation = validatePdfFile(file);
        if (!validation.valid) {
            setError(validation.error ?? 'Invalid file.');
            return;
        }

        setSelectedFile(file);
        setIsUploading(true);
        setProcessingStep('uploading');
        setUploadProgress(0);

        try {
            // 1. Obtain CSRF Token
            let csrfToken = '';
            try {
                const csrfRes = await fetch('/api/csrf', { method: 'GET' });
                if (csrfRes.ok) {
                    const csrfData = await csrfRes.json();
                    csrfToken = csrfData.csrfToken;
                }
            } catch {
                // proceed without token, but backend might block if CSRF is strictly enforced
            }

            const formData = new FormData();
            formData.append('file', file);

            // Use XMLHttpRequest for upload progress tracking, pass CSRF token
            const { scanId, claimToken } = await uploadWithProgress(formData, csrfToken, (progress) => {
                setUploadProgress(progress);
            });

            if (claimToken) {
                sessionStorage.setItem(`scan_claim_${scanId}`, claimToken);
            }

            setScanId(scanId);
            setUploadProgress(100);
            setProcessingStep('extracting');

            // Trigger background processing
            // The AI scan is already kicked off by /api/upload as fire-and-forget.
            // We just navigate to the result page which will poll for completion.

            setStatus('PENDING');
            setProcessingStep('analyzing');

            // Navigate to result page (will poll for status)
            router.push(`/scan/result/${scanId}`);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Upload failed. Please try again.';
            setError(msg);
            setIsUploading(false);
            setProcessingStep('error');
        }
    }, [router, setScanId, setUploadProgress, setProcessingStep, setStatus]);

    // ── Drag Handlers ────────────────────────────────────────────────────────

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) void processFile(file);
    }, [processFile]);

    const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) void processFile(file);
    }, [processFile]);

    const onClickZone = useCallback(() => {
        if (!isUploading) fileInputRef.current?.click();
    }, [isUploading]);

    const dropZoneClassName = [
        'group relative flex min-h-[260px] w-full cursor-pointer flex-col items-center justify-center gap-3.5 rounded-2xl border-2 border-dashed border-token-border-subtle bg-[rgba(var(--color-card-bg),0.80)] px-6 py-9 text-center outline-none backdrop-blur-[16px] transition-[border-color,background,box-shadow,transform] duration-300 ease-out',
        'hover:border-[rgb(var(--token-brand)/0.5)] hover:bg-[rgb(var(--token-brand)/0.03)] hover:shadow-[0_0_0_4px_rgb(var(--token-brand)/0.08),var(--shadow-md)]',
        'focus-visible:border-[rgb(var(--token-brand)/0.5)] focus-visible:bg-[rgb(var(--token-brand)/0.03)] focus-visible:shadow-[0_0_0_4px_rgb(var(--token-brand)/0.08),var(--shadow-md)]',
        isDragging ? 'scale-[1.01] border-[rgb(var(--token-brand))] border-solid bg-[rgb(var(--token-brand)/0.06)] shadow-[0_0_0_4px_rgb(var(--token-brand)/0.15),var(--shadow-lg)]' : '',
        isUploading ? 'cursor-default border-solid border-[rgb(var(--token-brand)/0.4)]' : '',
        error ? 'border-[rgb(var(--token-semantic-danger)/0.4)]' : '',
    ].filter(Boolean).join(' ');

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <div className="flex flex-col gap-2.5">
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="sr-only"
                onChange={onInputChange}
                aria-label={auditT('uploadInputAria')}
                id="policy-file-input"
            />

            {/* Drop Zone */}
            <div
                role="button"
                tabIndex={0}
                aria-label={auditT('dropzoneAria')}
                onClick={onClickZone}
                onKeyDown={(e) => e.key === 'Enter' && onClickZone()}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={dropZoneClassName}
            >
                {isUploading ? (
                    /* Upload in progress */
                    <UploadProgress fileName={selectedFile?.name} />
                ) : (
                    /* Default idle state */
                    <>
                        <div className="text-[rgba(var(--color-accent),0.7)] transition-transform duration-300 ease-out group-hover:-translate-y-1 group-hover:scale-110">
                            <UploadIcon />
                        </div>
                        <h3 className="m-0 text-xl font-bold text-token-text-primary">
                            {isDragging ? t('dropHere') : t('uploadTitle')}
                        </h3>
                        <p className="m-0 text-[0.9375rem] leading-6 text-token-text-secondary">
                            {t('dragDropText')}{' '}
                            <span className="font-semibold text-[rgb(var(--token-brand))] underline decoration-dotted underline-offset-4">
                                {t('browseText')}
                            </span>
                        </p>
                        <div className="mt-1 flex flex-wrap justify-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-token-border-subtle bg-[rgba(var(--color-bg-tertiary),0.8)] px-2.5 py-1 text-xs font-medium text-token-text-muted">
                                <ShieldIcon /> {t('encrypted')}
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-token-border-subtle bg-[rgba(var(--color-bg-tertiary),0.8)] px-2.5 py-1 text-xs font-medium text-token-text-muted">
                                {t('pdfOnly', { max: MAX_FILE_SIZE_MB })}
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-token-border-subtle bg-[rgba(var(--color-bg-tertiary),0.8)] px-2.5 py-1 text-xs font-medium text-token-text-muted">
                                {t('freeScan')}
                            </span>
                        </div>
                    </>
                )}
            </div>

            {/* Error message */}
            {error && (
                <div role="alert" className="flex items-center gap-2 rounded-lg border border-[rgb(var(--token-semantic-danger)/0.25)] bg-[rgb(var(--token-semantic-danger)/0.08)] px-3.5 py-2.5 text-sm font-medium text-[rgb(var(--token-semantic-danger))] dark:text-[rgb(var(--token-semantic-danger-soft))]">
                    <span aria-hidden>⚠️</span> {error}
                </div>
            )}
        </div>
    );
}

// ─── Helper: Upload with Progress ─────────────────────────────────────────────

function uploadWithProgress(
    formData: FormData,
    csrfToken: string,
    onProgress: (pct: number) => void,
): Promise<{ scanId: string; claimToken?: string }> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                onProgress(Math.round((e.loaded / e.total) * 90)); // 0–90% during upload
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const data = JSON.parse(xhr.responseText) as { scanId: string; claimToken?: string; error?: string };
                    if (data.error) { reject(new Error(data.error)); return; }
                    resolve({ scanId: data.scanId, claimToken: data.claimToken });
                } catch {
                    reject(new Error('Invalid server response.'));
                }
            } else {
                try {
                    const data = JSON.parse(xhr.responseText) as { error?: string };
                    reject(new Error(data.error ?? `Upload failed (${xhr.status})`));
                } catch {
                    reject(new Error(`Upload failed (${xhr.status})`));
                }
            }
        });

        xhr.addEventListener('error', () => reject(new Error('Network error. Please check your connection.')));
        xhr.addEventListener('abort', () => reject(new Error('Upload cancelled.')));

        xhr.open('POST', '/api/upload');
        if (csrfToken) {
            xhr.setRequestHeader('x-csrf-token', csrfToken);
        }
        xhr.send(formData);
    });
}

// ─── Sub-component: Upload Progress ──────────────────────────────────────────

function UploadProgress({ fileName }: { fileName?: string }) {
    const t = useTranslations('scan.dropzone');
    const auditT = useTranslations('auditI18n.dropZone');
    const { uploadProgress, processingStep } = useScanStore();

    const STEPS = [
        { key: 'uploading',   label: t('steps.uploading')   },
        { key: 'extracting',  label: t('steps.extracting')   },
        { key: 'analyzing',   label: t('steps.analyzing')   },
        { key: 'scoring',     label: t('steps.scoring')     },
    ] as const;

    const currentStepIndex = STEPS.findIndex(s => s.key === processingStep);

    return (
        <div className="flex w-full max-w-[420px] flex-col items-center gap-3" aria-live="polite">
            <div className="flex items-center gap-2 text-[0.9rem] font-semibold text-token-text-primary">
                <span className="text-xl" aria-hidden>📄</span>
                <span className="max-w-[220px] overflow-hidden text-ellipsis whitespace-nowrap">
                    {fileName ?? t('uploadingPlaceholder')}
                </span>
            </div>

            {/* Progress bar */}
            <div
                className="h-2 w-full overflow-hidden rounded-full border border-token-border-subtle bg-[rgba(var(--color-bg-tertiary),0.8)]"
                role="progressbar"
                aria-label={auditT('uploadProgressAria')}
                aria-valuenow={uploadProgress}
                aria-valuemin={0}
                aria-valuemax={100}
            >
                <div
                    className="h-full rounded-full bg-token-gradient-primary transition-[width] duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                />
            </div>
            <span className="text-[0.8125rem] font-bold text-[rgb(var(--token-brand))]" aria-hidden>{uploadProgress}%</span>

            {/* Steps */}
            <ol className="m-0 flex w-full list-none flex-col gap-1.5 self-start p-0">
                {STEPS.map((step, i) => (
                    <li
                        key={step.key}
                        className={[
                            'flex items-center gap-2.5 text-[0.8125rem] font-medium text-token-text-muted transition-colors duration-200 ease-out',
                            i < currentStepIndex  ? 'text-[rgb(var(--token-semantic-success))]' : '',
                            i === currentStepIndex ? 'font-semibold text-[rgb(var(--token-brand))]' : '',
                        ].filter(Boolean).join(' ')}
                    >
                        <span
                            className={[
                                'h-2 w-2 shrink-0 rounded-full bg-token-border-subtle transition-[background,transform,box-shadow] duration-200 ease-out',
                                i < currentStepIndex ? 'bg-[rgb(var(--token-semantic-success))]' : '',
                                i === currentStepIndex ? 'scale-125 bg-[rgb(var(--token-brand))] shadow-[0_0_0_3px_rgb(var(--token-brand)/0.25)]' : '',
                            ].filter(Boolean).join(' ')}
                            aria-hidden
                        />
                        {step.label}
                    </li>
                ))}
            </ol>
        </div>
    );
}
