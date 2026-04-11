'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import './tour.css';

const STORAGE_KEY = 'ic_onboarded_v1';
const AUTO_OPEN_DELAY_MS = 600;
const INTERACTION_EVENTS: Array<keyof WindowEventMap> = ['pointerdown', 'keydown', 'touchstart', 'wheel'];

export default function ProductTour() {
    const t = useTranslations('auditI18n.productTour');
    const pathname = usePathname();
    const [visible, setVisible] = useState(false);
    const [step, setStep] = useState(0);
    const [mounted, setMounted] = useState(false);
    const steps = [
        {
            badge: 'PDF',
            title: t('steps.upload.title'),
            body: t('steps.upload.body'),
            highlight: t('steps.upload.highlight'),
        },
        {
            badge: 'AI',
            title: t('steps.risks.title'),
            body: t('steps.risks.body'),
            highlight: t('steps.risks.highlight'),
        },
        {
            badge: 'REP',
            title: t('steps.unlock.title'),
            body: t('steps.unlock.body'),
            highlight: t('steps.unlock.highlight'),
        },
    ] as const;

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        if (pathname !== '/') {
            setVisible(false);
            return;
        }

        const done = window.localStorage.getItem(STORAGE_KEY);
        if (done) {
            setVisible(false);
            return;
        }

        let cancelled = false;
        const cancelAutoOpen = () => {
            cancelled = true;
            window.clearTimeout(timer);
        };

        // Do not interrupt visitors who already started using the page.
        const timer = window.setTimeout(() => {
            if (cancelled) return;
            setStep(0);
            setVisible(true);
        }, AUTO_OPEN_DELAY_MS);

        INTERACTION_EVENTS.forEach((eventName) => {
            window.addEventListener(eventName, cancelAutoOpen);
        });

        return () => {
            cancelled = true;
            window.clearTimeout(timer);
            INTERACTION_EVENTS.forEach((eventName) => {
                window.removeEventListener(eventName, cancelAutoOpen);
            });
        };
    }, [mounted, pathname]);

    const dismiss = useCallback(() => {
        setVisible(false);
        window.localStorage.setItem(STORAGE_KEY, 'true');
    }, []);

    useEffect(() => {
        if (!visible) return;

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') dismiss();
            if (e.key === 'ArrowRight' && step < steps.length - 1) setStep((currentStep) => currentStep + 1);
            if (e.key === 'ArrowLeft' && step > 0) setStep((currentStep) => currentStep - 1);
        };

        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [visible, step, dismiss, steps.length]);

    if (!mounted || !visible || pathname !== '/') return null;

    const current = steps[step];
    const isLast = step === steps.length - 1;

    return (
        <>
            <div
                className="tour-backdrop"
                onClick={dismiss}
                aria-hidden="true"
            />

            <div
                role="dialog"
                aria-modal="true"
                aria-label={t('dialogAria')}
                className="tour-modal"
            >
                <button
                    type="button"
                    onClick={dismiss}
                    className="tour-close"
                    aria-label={t('skipTour')}
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="tour-dots" aria-label={t('stepProgress', { current: step + 1, total: steps.length })} role="navigation">
                    {steps.map((_, index) => (
                        <button
                            key={index}
                            type="button"
                            className={`tour-dot ${index === step ? 'tour-dot--active' : ''}`}
                            onClick={() => setStep(index)}
                            aria-label={t('goToStep', { step: index + 1 })}
                            aria-current={index === step ? 'step' : undefined}
                        />
                    ))}
                </div>

                <div className="tour-content" key={step}>
                    <div className="tour-emoji" aria-hidden="true">{current.badge}</div>
                    <h2 className="tour-title">{current.title}</h2>
                    <p className="tour-body">{current.body}</p>
                    <div className="tour-highlight">
                        <span aria-hidden="true">AI</span> {current.highlight}
                    </div>
                </div>

                <div className="tour-nav">
                    {step > 0 && (
                        <button
                            type="button"
                            onClick={() => setStep((currentStep) => currentStep - 1)}
                            className="btn-secondary tour-nav__back"
                            aria-label={t('previousStep')}
                        >
                            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                            {t('back')}
                        </button>
                    )}

                    {isLast ? (
                        <Link
                            href="/scan"
                            onClick={dismiss}
                            className="btn-primary tour-nav__cta"
                        >
                            {t('startScanningFree')}
                            <ChevronRight className="w-4 h-4" aria-hidden="true" />
                        </Link>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setStep((currentStep) => currentStep + 1)}
                            className="btn-primary tour-nav__next"
                            aria-label={t('nextStep')}
                        >
                            {t('next')}
                            <ChevronRight className="w-4 h-4" aria-hidden="true" />
                        </button>
                    )}
                </div>

                {!isLast && (
                    <button type="button" onClick={dismiss} className="tour-skip">
                        {t('skipTour')}
                    </button>
                )}
            </div>
        </>
    );
}
