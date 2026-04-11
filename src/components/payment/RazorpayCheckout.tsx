'use client';

/**
 * RazorpayCheckout.tsx
 *
 * Handles two payment flows:
 * 1. Per-scan report unlock  — POST /api/payment/create-order → verify
 * 2. Subscription (Pro/Enterprise) — POST /api/subscription/create → redirect to Razorpay hosted page
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { BRAND_PRIMARY_HEX } from '@/lib/theme/brand';



async function loadRazorpayScript(): Promise<boolean> {
    if (typeof window !== 'undefined' && window.Razorpay) return true;
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.head.appendChild(script);
    });
}

async function getCsrfToken(): Promise<string | null> {
    const match = document.cookie.match(/(?:^|;\s*)__csrf=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
    try {
        const res = await fetch('/api/csrf');
        if (!res.ok) return null;
        const data = await res.json() as { csrfToken: string };
        return data.csrfToken;
    } catch {
        return null;
    }
}

function getClaimToken(scanId?: string): string | null {
    if (!scanId) return null;
    try {
        return sessionStorage.getItem(`scan_claim_${scanId}`);
    } catch {
        return null;
    }
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface RazorpayCheckoutProps {
    /** For per-scan unlock — pass scanId */
    scanId?: string;
    /** For subscription plans — pass planId ('PRO' | 'ENTERPRISE') */
    planId?: 'PRO' | 'ENTERPRISE';
    /** Amount in paise (e.g., ₹199 = 19900). Required for per-scan unlock. */
    amount?: number;
    label?: string;
    onSuccess?: () => void;
    onError?: (msg: string) => void;
    className?: string;
    variant?: 'primary' | 'hero';
    /** If true, uses subscription API instead of per-scan payment */
    isSubscription?: boolean;
}

export default function RazorpayCheckout({
    scanId,
    planId = 'PRO',
    amount,
    label,
    onSuccess,
    onError,
    className = '',
    variant = 'primary',
    isSubscription = false,
}: RazorpayCheckoutProps) {
    const t = useTranslations('auditI18n.razorpay');
    const copyT = useTranslations('auditI18n.remaining');
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const resolvedLabel = label ?? copyT('unlockFullReport');

    // ── Per-scan unlock flow ────────────────────────────────────────────────────
    const handleScanUnlock = async () => {
        if (!scanId || !amount) {
            setErrorMsg('Invalid payment configuration. Please refresh the page.');
            return;
        }

        const loaded = await loadRazorpayScript();
        if (!loaded) throw new Error('Failed to load payment gateway. Check your connection.');

        const csrfToken = await getCsrfToken();
        if (!csrfToken) throw new Error('Security token missing. Please refresh and try again.');
        const claimToken = getClaimToken(scanId);

        // Create Razorpay order
        const orderRes = await fetch('/api/payment/create-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-csrf-token': csrfToken,
                ...(claimToken ? { 'X-Claim-Token': claimToken } : {}),
            },
            body: JSON.stringify({ scanId, amount }),
        });

        if (!orderRes.ok) {
            const err = await orderRes.json() as { error?: string };
            throw new Error(err.error ?? 'Failed to create payment order');
        }

        const orderData = await orderRes.json() as {
            orderId: string;
            amount: number;
            currency: string;
            keyId: string;
        };

        // Open Razorpay SDK modal — cast to avoid global Window type conflicts
        // The script was loaded above so this is guaranteed non-null
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const RazorpayCtor = (window as any).Razorpay as (new (opts: Record<string, unknown>) => { open(): void });
        const rzp = new RazorpayCtor({
            key: orderData.keyId,
            amount: orderData.amount,
            currency: orderData.currency,
            name: 'InsuranceClarity',
            description: copyT('unlockFullPolicyReport'),
            order_id: orderData.orderId,
            theme: { color: BRAND_PRIMARY_HEX },
            modal: {
                ondismiss: () => setLoading(false),
            },
            handler: async (response: {
                razorpay_payment_id: string;
                razorpay_order_id: string;
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
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            scanId,
                        }),
                    });

                    if (!verifyRes.ok) throw new Error('Payment verification failed. Contact support.');

                    setSuccess(true);
                    onSuccess?.();

                    // Reload page to show full report
                    setTimeout(() => router.refresh(), 1500);

                } catch (err) {
                    const msg = err instanceof Error ? err.message : 'Verification failed';
                    setErrorMsg(msg);
                    onError?.(msg);
                } finally {
                    setLoading(false);
                }
            },
        });

        rzp.open();
    };

    // ── Subscription flow ───────────────────────────────────────────────────────
    const handleSubscription = async () => {
        const csrfToken = await getCsrfToken();
        if (!csrfToken) throw new Error('Security token missing. Please refresh and try again.');

        const res = await fetch('/api/subscription/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
            body: JSON.stringify({ plan: planId }),
        });

        if (!res.ok) {
            const err = await res.json() as { error?: string };
            throw new Error(err.error ?? 'Failed to create subscription');
        }

        const data = await res.json() as {
            subscriptionId: string;
            shortUrl: string;
            status: string;
        };

        // Redirect to Razorpay hosted payment page (handles recurring billing UI)
        if (data.shortUrl) {
            window.location.href = data.shortUrl;
        } else {
            throw new Error('No payment URL received. Please try again.');
        }
    };

    // ── Main handler ────────────────────────────────────────────────────────────
    const handlePayment = async () => {
        setLoading(true);
        setErrorMsg(null);

        try {
            if (isSubscription) {
                await handleSubscription();
            } else {
                await handleScanUnlock();
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Payment failed';
            setErrorMsg(msg);
            onError?.(msg);
            setLoading(false);
        }
    };

    // ── States ──────────────────────────────────────────────────────────────────
    if (success) {
        return (
            <div className="razorpay-success" role="status" aria-live="polite">
                <span aria-hidden="true">✅</span>
                <span>{t('successUnlocking')}</span>
            </div>
        );
    }

    const baseClass = variant === 'hero' ? 'btn-hero-checkout' : 'btn-primary';

    return (
        <div>
            <button
                type="button"
                id={`razorpay-btn-${scanId ?? planId}`}
                onClick={handlePayment}
                disabled={loading}

                className={`${baseClass} ${className}`}
            >
                {loading ? (
                    <>
                        <span className="spinner" aria-hidden="true" />
                        {t('processing')}
                    </>
                ) : (
                    <>
                        <span aria-hidden="true">{isSubscription ? '🚀' : '🔓'}</span>
                        {resolvedLabel}
                    </>
                )}
            </button>
            {errorMsg && (
                <p className="text-red-500 text-sm mt-2" role="alert" aria-live="assertive">
                    {errorMsg}
                </p>
            )}
        </div>
    );
}
