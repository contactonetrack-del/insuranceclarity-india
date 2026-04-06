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

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <div className="dropzone-wrapper">
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="sr-only"
                onChange={onInputChange}
                aria-label="Upload insurance policy PDF"
                id="policy-file-input"
            />

            {/* Drop Zone */}
            <div
                role="button"
                tabIndex={0}
                aria-label="Drop your insurance policy PDF here or click to select"
                onClick={onClickZone}
                onKeyDown={(e) => e.key === 'Enter' && onClickZone()}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={[
                    'dropzone',
                    isDragging  ? 'dropzone--dragging'  : '',
                    isUploading ? 'dropzone--uploading' : '',
                    error       ? 'dropzone--error'     : '',
                ].filter(Boolean).join(' ')}
            >
                {isUploading ? (
                    /* Upload in progress */
                    <UploadProgress fileName={selectedFile?.name} />
                ) : (
                    /* Default idle state */
                    <>
                        <div className="dropzone__icon">
                            <UploadIcon />
                        </div>
                        <h3 className="dropzone__headline">
                            {isDragging ? t('dropHere') : t('uploadTitle')}
                        </h3>
                        <p className="dropzone__subtext">
                            {t('dragDropText')}{' '}
                            <span className="dropzone__browse">{t('browseText')}</span>
                        </p>
                        <div className="dropzone__meta">
                            <span className="dropzone__badge">
                                <ShieldIcon /> {t('encrypted')}
                            </span>
                            <span className="dropzone__badge">
                                {t('pdfOnly').replace('{max}', String(MAX_FILE_SIZE_MB))}
                            </span>
                            <span className="dropzone__badge">
                                {t('freeScan')}
                            </span>
                        </div>
                    </>
                )}
            </div>

            {/* Error message */}
            {error && (
                <div role="alert" className="dropzone__error-msg">
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
    const { uploadProgress, processingStep } = useScanStore();

    const STEPS = [
        { key: 'uploading',   label: t('steps.uploading')   },
        { key: 'extracting',  label: t('steps.extracting')   },
        { key: 'analyzing',   label: t('steps.analyzing')   },
        { key: 'scoring',     label: t('steps.scoring')     },
    ] as const;

    const currentStepIndex = STEPS.findIndex(s => s.key === processingStep);

    return (
        <div className="upload-progress" aria-live="polite">
            <div className="upload-progress__file">
                <span className="upload-progress__file-icon" aria-hidden>📄</span>
                <span className="upload-progress__file-name">
                    {fileName ?? t('uploadingPlaceholder')}
                </span>
            </div>

            {/* Progress bar */}
            <div
                className="upload-progress__bar-track"
                role="progressbar"
                aria-label="Upload progress"
                aria-valuenow={uploadProgress}
                aria-valuemin={0}
                aria-valuemax={100}
            >
                <div
                    className="upload-progress__bar-fill"
                    style={{ width: `${uploadProgress}%` }}
                />
            </div>
            <span className="upload-progress__pct" aria-hidden>{uploadProgress}%</span>

            {/* Steps */}
            <ol className="upload-progress__steps">
                {STEPS.map((step, i) => (
                    <li
                        key={step.key}
                        className={[
                            'upload-progress__step',
                            i < currentStepIndex  ? 'upload-progress__step--done'   : '',
                            i === currentStepIndex ? 'upload-progress__step--active' : '',
                        ].filter(Boolean).join(' ')}
                    >
                        <span className="upload-progress__step-dot" aria-hidden />
                        {step.label}
                    </li>
                ))}
            </ol>
        </div>
    );
}
