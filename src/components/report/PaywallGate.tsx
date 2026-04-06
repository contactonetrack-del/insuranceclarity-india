'use client';

/**
 * PaywallGate - Locks premium report sections behind Razorpay payment.
 * Adds retry-aware UX by checking payment attempt state and surfacing recovery actions.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CreateOrderResponse } from '@/types/report.types';

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

// Extend Window with Razorpay
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

    const ctaLabel = useMemo(() => {
        if (isLoading) return null;
        if (paymentStatus === 'FAILED' || paymentStatus === 'CREATED' || error) {
            return 'Retry Payment - ₹199';
        }
        return 'Unlock Full Report - ₹199';
    }, [error, isLoading, paymentStatus]);

    const handleUnlock = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const loaded = await loadRazorpayScript();
            if (!loaded) {
                throw new Error('Payment service unavailable. Please try again.');
            }

            const csrfToken = await getCsrfToken();
            if (!csrfToken) {
                throw new Error('Security token missing. Please refresh and try again.');
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
                const message = err ?? 'Unable to create payment order.';
                if (message.toLowerCase().includes('already unlocked')) {
                    onUnlocked();
                    await refreshPaymentStatus();
                    return;
                }
                throw new Error(message);
            }

            const order = await orderRes.json() as CreateOrderResponse;

            await new Promise<void>((resolve, reject) => {
                const rzp = new window.Razorpay({
                    key: order.keyId,
                    amount: order.amount,
                    currency: order.currency,
                    order_id: order.orderId,
                    name: 'Insurance Clarity',
                    description: 'Full Policy Scan Report Unlock',
                    image: '/icons/icon-192.png',
                    prefill: {
                        name: '',
                        email: '',
                    },
                    theme: { color: '#6366f1' },
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
                                throw new Error(payload.error ?? 'Payment verification failed. Please retry.');
                            }

                            resolve();
                        } catch (err) {
                            reject(err);
                        }
                    },
                    modal: {
                        ondismiss: () => {
                            void markAttemptFailed(order.orderId, 'checkout_dismissed');
                            reject(new Error('Payment cancelled.'));
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
            const msg = err instanceof Error ? err.message : 'Payment failed. Please try again.';
            if (!msg.toLowerCase().includes('cancelled')) {
                setError(msg);
            }
            setPaymentStatus('FAILED');
        } finally {
            setIsLoading(false);
        }
    }, [scanId, onUnlocked, refreshPaymentStatus, markAttemptFailed]);

    return (
        <section className="paywall" aria-label="Premium report locked">
            <div className="paywall__lock" aria-hidden>
                <div className="paywall__blur" />
                <div className="paywall__lock-icon">🔒</div>
            </div>

            <div className="paywall__content">
                <h3 className="paywall__title">Unlock Full Report</h3>
                <p className="paywall__message">{message}</p>

                {(paymentStatus === 'FAILED' || paymentStatus === 'CREATED') && paymentStatusMessage && (
                    <p className="paywall__status" role="status">
                        {paymentStatusMessage}
                    </p>
                )}

                <ul className="paywall__features" aria-label="What you get with full access">
                    <li>✅ All exclusion clauses</li>
                    <li>✅ All actionable suggestions</li>
                    <li>✅ Hidden fine-print clauses</li>
                    <li>✅ Share and download report</li>
                </ul>

                <button
                    className="paywall__cta"
                    onClick={() => void handleUnlock()}
                    disabled={isLoading}
                    aria-busy={isLoading ? 'true' : 'false'}
                    id="unlock-report-btn"
                >
                    {isLoading ? (
                        <>
                            <span className="paywall__spinner" aria-hidden /> Processing...
                        </>
                    ) : (
                        ctaLabel
                    )}
                </button>

                <p className="paywall__reassurance">
                    One-time payment · Secure via Razorpay · Instant access
                </p>

                {error && (
                    <p role="alert" className="paywall__error">
                        {error}
                    </p>
                )}
            </div>
        </section>
    );
}

