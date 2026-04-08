'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import './tour.css';

const STORAGE_KEY = 'ic_onboarded_v1';
const AUTO_OPEN_DELAY_MS = 600;
const INTERACTION_EVENTS: Array<keyof WindowEventMap> = ['pointerdown', 'keydown', 'touchstart', 'wheel'];

const STEPS = [
    {
        badge: 'PDF',
        title: 'Upload Your Policy PDF',
        body: 'Upload any Indian insurance policy - Health, Term Life, Motor, Home, or Travel. Our AI reads 100+ pages in under 60 seconds.',
        highlight: 'Works with all IRDAI-registered insurers',
    },
    {
        badge: 'AI',
        title: 'AI Finds Hidden Risks',
        body: 'Our GPT-powered engine analyses your policy against 500+ known claim traps, exclusions, and red flags that your insurer counts on you missing.',
        highlight: '87% of policies contain at least 3 hidden risks',
    },
    {
        badge: 'REP',
        title: 'Unlock Your Full Report',
        body: 'See the first 3 risks free. Unlock the complete risk report for just Rs 199 - a one-time payment with a 7-day refund guarantee.',
        highlight: 'One-time Rs 199 - No subscription required',
    },
] as const;

export default function ProductTour() {
    const pathname = usePathname();
    const [visible, setVisible] = useState(false);
    const [step, setStep] = useState(0);
    const [mounted, setMounted] = useState(false);

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
            if (e.key === 'ArrowRight' && step < STEPS.length - 1) setStep((currentStep) => currentStep + 1);
            if (e.key === 'ArrowLeft' && step > 0) setStep((currentStep) => currentStep - 1);
        };

        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [visible, step, dismiss]);

    if (!mounted || !visible || pathname !== '/') return null;

    const current = STEPS[step];
    const isLast = step === STEPS.length - 1;

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
                aria-label="Welcome to InsuranceClarity quick product tour"
                className="tour-modal"
            >
                <button
                    type="button"
                    onClick={dismiss}
                    className="tour-close"
                    aria-label="Skip tour"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="tour-dots" aria-label={`Step ${step + 1} of ${STEPS.length}`} role="navigation">
                    {STEPS.map((_, index) => (
                        <button
                            key={index}
                            type="button"
                            className={`tour-dot ${index === step ? 'tour-dot--active' : ''}`}
                            onClick={() => setStep(index)}
                            aria-label={`Go to step ${index + 1}`}
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
                            aria-label="Previous step"
                        >
                            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                            Back
                        </button>
                    )}

                    {isLast ? (
                        <Link
                            href="/scan"
                            onClick={dismiss}
                            className="btn-primary tour-nav__cta"
                        >
                            Start Scanning Free
                            <ChevronRight className="w-4 h-4" aria-hidden="true" />
                        </Link>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setStep((currentStep) => currentStep + 1)}
                            className="btn-primary tour-nav__next"
                            aria-label="Next step"
                        >
                            Next
                            <ChevronRight className="w-4 h-4" aria-hidden="true" />
                        </button>
                    )}
                </div>

                {!isLast && (
                    <button type="button" onClick={dismiss} className="tour-skip">
                        Skip tour
                    </button>
                )}
            </div>
        </>
    );
}
