'use client';

/**
 * PaywallGate - Locks premium report sections behind Razorpay payment.
 * Adds retry-aware UX by checking payment attempt state and surfacing recovery actions.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { CreateOrderResponse } from '@/types/report.types';
import { BRAND_PRIMARY_HEX } from '@/lib/theme/brand';

interface PaywallGateProps {
    scanId: string;
    message: string;
    exclusionsCount?: number;
    suggestionsCount?: number;
    hiddenClausesCount?: number;
    onUnlocked: () => void;
}

type PaymentRecoveryStatus = 'loading' | 'NOT_CREATED' | 'CREATED' | 'FAILED' | 'CAPTURED';

interface PaymentStatusResponse {
    status?: 'NOT_CREATED' | 'CREATED' | 'FAILED' | 'CAPTURED';
    message?: string;
}

interface RazorpayInstance {
    open: () => void;
    on?: (event: string, handler: (payload: unknown) => void) => void;
}

declare global {
    interface Window {
        Razorpay: new (opts: unknown) => RazorpayInstance;
    }
}

function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
        if (typeof window.Razorpay !== 'undefined') {
            resolve(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

async function getCsrfToken(): Promise<string | null> {
    const match = document.cookie.match(/(?:^|;\s*)__csrf=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
    try {
        const res = await fetch('/api/csrf');
        if (!res.ok) return null;
        const data = await res.json() as { csrfToken?: string };
        return data.csrfToken ?? null;
    } catch {
        return null;
    }
}

function getClaimToken(scanId: string): string | null {
    try {
        return sessionStorage.getItem(`scan_claim_${scanId}`);
    } catch {
        return null;
    }
}

export function PaywallGate({
    scanId,
    message,
    onUnlocked,
}: PaywallGateProps) {
    const t = useTranslations('scan.paywallGate');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<PaymentRecoveryStatus>('loading');
    const [paymentStatusMessage, setPaymentStatusMessage] = useState<string | null>(null);

    const refreshPaymentStatus = useCallback(async () => {
        try {
            const claimToken = getClaimToken(scanId);
            const res = await fetch(`/api/payment/status?scanId=${encodeURIComponent(scanId)}`, {
                cache: 'no-store',
                headers: claimToken ? { 'X-Claim-Token': claimToken } : undefined,
            });

            if (!res.ok) {
                setPaymentStatus('NOT_CREATED');
                setPaymentStatusMessage(null);
                return;
            }

            const data = await res.json() as PaymentStatusResponse;
            const status = data.status ?? 'NOT_CREATED';
            setPaymentStatus(status);
            setPaymentStatusMessage(data.message ?? null);
        } catch {
            setPaymentStatus('NOT_CREATED');
            setPaymentStatusMessage(null);
        }
    }, [scanId]);

    const markAttemptFailed = useCallback(async (orderId: string, reason: string) => {
        try {
            const csrfToken = await getCsrfToken();
            if (!csrfToken) return;
            const claimToken = getClaimToken(scanId);
            await fetch('/api/payment/mark-failed', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-csrf-token': csrfToken,
                    ...(claimToken ? { 'X-Claim-Token': claimToken } : {}),
                },
                body: JSON.stringify({
                    scanId,
                    razorpayOrderId: orderId,
                    reason,
                }),
            });
        } catch {
            // non-fatal, retry UX still works via local state
        }
    }, [scanId]);

    useEffect(() => {
        void refreshPaymentStatus();
    }, [refreshPaymentStatus]);

    const cancelledError = t('errors.cancelled');

    const ctaLabel = useMemo(() => {
        if (isLoading) return null;
        if (paymentStatus === 'FAILED' || paymentStatus === 'CREATED' || error) {
            return t('ctaRetry');
        }
        return t('ctaUnlock');
    }, [error, isLoading, paymentStatus, t]);

    const handleUnlock = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const loaded = await loadRazorpayScript();
            if (!loaded) {
                throw new Error(t('errors.serviceUnavailable'));
            }

            const csrfToken = await getCsrfToken();
            if (!csrfToken) {
                throw new Error(t('errors.securityTokenMissing'));
            }

            const claimToken = getClaimToken(scanId);

            const orderRes = await fetch('/api/payment/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-csrf-token': csrfToken,
                    ...(claimToken ? { 'X-Claim-Token': claimToken } : {}),
                },
                body: JSON.stringify({ scanId }),
            });

            if (!orderRes.ok) {
                const { error: err } = await orderRes.json() as { error?: string };
                const messageFromApi = err ?? t('errors.orderCreateFailed');
                if (messageFromApi.toLowerCase().includes('already unlocked')) {
                    onUnlocked();
                    await refreshPaymentStatus();
                    return;
                }
                throw new Error(messageFromApi);
            }

            const order = await orderRes.json() as CreateOrderResponse;

            await new Promise<void>((resolve, reject) => {
                const rzp = new window.Razorpay({
                    key: order.keyId,
                    amount: order.amount,
                    currency: order.currency,
                    order_id: order.orderId,
                    name: 'Insurance Clarity',
                    description: t('paymentDescription'),
                    image: '/icons/icon-192.png',
                    prefill: {
                        name: '',
                        email: '',
                    },
                    theme: { color: BRAND_PRIMARY_HEX },
                    handler: async (response: {
                        razorpay_order_id: string;
                        razorpay_payment_id: string;
                        razorpay_signature: string;
                    }) => {
                        try {
                            const verifyRes = await fetch('/api/payment/verify', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'x-csrf-token': csrfToken,
                                    ...(claimToken ? { 'X-Claim-Token': claimToken } : {}),
                                },
                                body: JSON.stringify({
                                    scanId,
                                    razorpayOrderId: response.razorpay_order_id,
                                    razorpayPaymentId: response.razorpay_payment_id,
                                    razorpaySignature: response.razorpay_signature,
                                }),
                            });

                            if (!verifyRes.ok) {
                                const payload = await verifyRes.json().catch(() => ({} as { error?: string }));
                                await markAttemptFailed(order.orderId, 'verification_failed');
                                throw new Error(payload.error ?? t('errors.verificationFailed'));
                            }

                            resolve();
                        } catch (err) {
                            reject(err);
                        }
                    },
                    modal: {
                        ondismiss: () => {
                            void markAttemptFailed(order.orderId, 'checkout_dismissed');
                            reject(new Error(cancelledError));
                        },
                    },
                });

                if (typeof rzp.on === 'function') {
                    rzp.on('payment.failed', () => {
                        void markAttemptFailed(order.orderId, 'payment_failed_event');
                    });
                }

                rzp.open();
            });

            onUnlocked();
            await refreshPaymentStatus();
        } catch (err) {
            const messageFromError = err instanceof Error ? err.message : t('errors.paymentFailed');
            if (messageFromError !== cancelledError) {
                setError(messageFromError);
            }
            setPaymentStatus('FAILED');
        } finally {
            setIsLoading(false);
        }
    }, [cancelledError, markAttemptFailed, onUnlocked, refreshPaymentStatus, scanId, t]);

    return (
        <section
            className="relative overflow-hidden rounded-xl border border-[rgb(var(--token-brand)_/_0.25)] bg-[rgba(var(--color-card-bg),0.9)] px-7 py-10 text-center shadow-[var(--shadow-lg),0_0_40px_rgb(var(--token-brand)_/_0.08)] backdrop-blur-[16px]"
            aria-label={t('lockedRegionLabel')}
        >
            <div className="relative mb-1 flex items-center justify-center" aria-hidden>
                <div className="pointer-events-none absolute left-1/2 top-[-40px] h-[200px] w-[200px] -translate-x-1/2 bg-[radial-gradient(circle,_rgb(var(--token-brand)_/_0.15)_0%,_transparent_70%)]" />
                <div className="relative z-[1] text-[2.5rem] animate-[float_4s_var(--ease-in-out)_infinite]">🔒</div>
            </div>

            <div className="flex flex-col items-center gap-3.5">
                <h3 className="m-0 text-2xl font-extrabold tracking-[-0.02em] text-[rgb(var(--color-text-primary))]">{t('title')}</h3>
                <p className="m-0 max-w-[360px] text-[0.9375rem] leading-[1.6] text-[rgb(var(--color-text-secondary))]">{message}</p>

                {(paymentStatus === 'FAILED' || paymentStatus === 'CREATED') && paymentStatusMessage && (
                    <p
                        className="m-0 rounded-md border border-[rgb(var(--token-semantic-warning)_/_0.28)] bg-[rgb(var(--token-semantic-warning)_/_0.14)] px-3 py-2 text-[0.8125rem] text-[rgb(var(--token-semantic-warning))]"
                        role="status"
                    >
                        {paymentStatusMessage}
                    </p>
                )}

                <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-left" aria-label={t('featuresLabel')}>
                    <li className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">✅ {t('features.allExclusions')}</li>
                    <li className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">✅ {t('features.allSuggestions')}</li>
                    <li className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">✅ {t('features.hiddenClauses')}</li>
                    <li className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">✅ {t('features.shareAndDownload')}</li>
                </ul>

                <button
                    className="inline-flex min-w-[260px] items-center justify-center gap-2 rounded-xl border-none bg-[var(--token-gradient-accent)] px-9 py-3.5 text-base font-bold text-white shadow-[var(--shadow-md),0_0_20px_rgb(var(--token-brand)_/_0.3)] transition-[transform,box-shadow,opacity] duration-[var(--motion-fast)] ease-[var(--ease-spring)] hover:translate-y-[-3px] hover:shadow-[var(--shadow-lg),0_0_32px_rgb(var(--token-brand)_/_0.4)] active:translate-y-0 active:scale-[0.98] disabled:cursor-wait disabled:opacity-75"
                    onClick={() => void handleUnlock()}
                    disabled={isLoading}
                    aria-busy={isLoading ? 'true' : 'false'}
                    id="unlock-report-btn"
                >
                    {isLoading ? (
                        <>
                            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden />
                            {t('processing')}
                        </>
                    ) : (
                        ctaLabel
                    )}
                </button>

                <p className="m-0 text-xs text-[rgb(var(--color-text-muted))]">{t('reassurance')}</p>

                {error && (
                    <p
                        role="alert"
                        className="m-0 rounded-md border border-[rgb(var(--token-semantic-danger)_/_0.2)] bg-[rgb(var(--token-semantic-danger)_/_0.08)] px-3.5 py-2 text-[0.8125rem] text-[rgb(var(--token-semantic-danger))]"
                    >
                        {error}
                    </p>
                )}
            </div>
        </section>
    );
}
