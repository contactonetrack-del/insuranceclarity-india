'use client';

/**
 * PaywallOverlay.tsx
 *
 * Paywall component that blurs premium report content.
 * Shows first 3 risks free, blurs the rest with a CTA to unlock.
 * Uses next-intl for full i18n support (EN + HI).
 */

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';

const RazorpayCheckout = dynamic(() => import('@/components/payment/RazorpayCheckout'), { ssr: false });

interface PaywallOverlayProps {
    scanId: string;
    /** Total number of risk items in the report */
    totalRisks: number;
    /** Free preview: how many risks to show unblurred */
    freePreview?: number;
    onUnlocked?: () => void;
}

const UNLOCK_PRICE_PAISE = 19900; // ₹199

export default function PaywallOverlay({
    scanId,
    totalRisks,
    freePreview = 3,
    onUnlocked,
}: PaywallOverlayProps) {
    const t = useTranslations('scan.paywall');
    const [unlocked, setUnlocked] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const hiddenCount = Math.max(0, totalRisks - freePreview);

    if (unlocked) return null;
    if (hiddenCount === 0) return null;

    return (
        <div className="paywall-overlay" id="paywall-section" role="region" aria-label={t('lockedRegionLabel')}>
            {/* Blurred preview */}
            <div className="paywall-blur-zone" aria-hidden>
                {Array.from({ length: Math.min(hiddenCount, 3) }).map((_, i) => (
                    <div key={i} className="paywall-risk-skeleton">
                        <div className="paywall-risk-skeleton__badge" />
                        <div className="paywall-risk-skeleton__title" />
                        <div className="paywall-risk-skeleton__body" />
                    </div>
                ))}
            </div>

            {/* CTA card */}
            <div className="paywall-card">
                <div className="paywall-card__icon" aria-hidden>🔒</div>

                <h2 className="paywall-card__title">
                    {t('title', { count: hiddenCount })}
                </h2>

                <p className="paywall-card__desc">
                    {t('subtitle')}
                </p>

                <ul className="paywall-features" role="list">
                    <li><span aria-hidden>✅</span> {t('features.allRisks', { count: totalRisks })}</li>
                    <li><span aria-hidden>✅</span> {t('features.details')}</li>
                    <li><span aria-hidden>✅</span> {t('features.suggestions')}</li>
                    <li><span aria-hidden>✅</span> {t('features.pdf')}</li>
                    <li><span aria-hidden>✅</span> {t('features.lifetime')}</li>
                </ul>

                <div className="paywall-price">
                    <span className="paywall-price__amount">{t('price')}</span>
                    <span className="paywall-price__label">{t('priceNote')}</span>
                </div>

                {error && (
                    <p className="paywall-error" role="alert">{error}</p>
                )}

                <RazorpayCheckout
                    scanId={scanId}
                    planId="PRO"
                    amount={UNLOCK_PRICE_PAISE}
                    label={t('cta')}
                    variant="hero"
                    onSuccess={() => {
                        setUnlocked(true);
                        onUnlocked?.();
                    }}
                    onError={(msg) => setError(msg)}
                />

                <p className="paywall-guarantee">
                    <span aria-hidden>🛡️</span> {t('guarantee')}
                </p>
            </div>
        </div>
    );
}
