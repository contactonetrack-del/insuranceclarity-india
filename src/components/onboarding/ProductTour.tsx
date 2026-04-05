'use client';

/**
 * ProductTour.tsx
 *
 * 3-step onboarding tour shown on first visit.
 * Dismissed permanently via localStorage.
 * Keyboard navigable (ESC to dismiss).
 */

import { useState, useEffect, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import './tour.css';

const STORAGE_KEY = 'ic_onboarded_v1';

const STEPS = [
    {
        emoji: '📄',
        title: 'Upload Your Policy PDF',
        body: 'Upload any Indian insurance policy — Health, Term Life, Motor, Home, or Travel. Our AI reads 100+ pages in under 60 seconds.',
        highlight: 'Works with all IRDAI-registered insurers',
    },
    {
        emoji: '🔍',
        title: 'AI Finds Hidden Risks',
        body: 'Our GPT-powered engine analyses your policy against 500+ known claim traps, exclusions, and red flags that your insurer counts on you missing.',
        highlight: '87% of policies contain at least 3 hidden risks',
    },
    {
        emoji: '🔓',
        title: 'Unlock Your Full Report',
        body: 'See the first 3 risks free. Unlock the complete risk report for just ₹199 — a one-time payment with a 7-day refund guarantee.',
        highlight: 'One-time ₹199 · No subscription required',
    },
] as const;

export default function ProductTour() {
    const [visible, setVisible] = useState(false);
    const [step, setStep] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const done = localStorage.getItem(STORAGE_KEY);
        if (!done) {
            // Slight delay so the page content renders first
            const timer = setTimeout(() => setVisible(true), 1200);
            return () => clearTimeout(timer);
        }
    }, []);

    const dismiss = useCallback(() => {
        setVisible(false);
        localStorage.setItem(STORAGE_KEY, 'true');
    }, []);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') dismiss();
            if (e.key === 'ArrowRight' && step < STEPS.length - 1) setStep(s => s + 1);
            if (e.key === 'ArrowLeft' && step > 0) setStep(s => s - 1);
        };
        if (visible) window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [visible, step, dismiss]);

    if (!mounted || !visible) return null;

    const current = STEPS[step];
    const isLast = step === STEPS.length - 1;

    return (
        <>
            {/* Backdrop */}
            <div
                className="tour-backdrop"
                onClick={dismiss}
                aria-hidden="true"
            />

            {/* Modal */}
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Welcome to InsuranceClarity — quick product tour"
                className="tour-modal"
            >
                {/* Close */}
                <button
                    type="button"
                    onClick={dismiss}
                    className="tour-close"
                    aria-label="Skip tour"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Progress dots */}
                <div className="tour-dots" aria-label={`Step ${step + 1} of ${STEPS.length}`} role="navigation">
                    {STEPS.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            className={`tour-dot ${i === step ? 'tour-dot--active' : ''}`}
                            onClick={() => setStep(i)}
                            aria-label={`Go to step ${i + 1}`}
                            aria-current={i === step ? 'step' : undefined}
                        />
                    ))}
                </div>

                {/* Content */}
                <div className="tour-content" key={step}>
                    <div className="tour-emoji" aria-hidden="true">{current.emoji}</div>
                    <h2 className="tour-title">{current.title}</h2>
                    <p className="tour-body">{current.body}</p>
                    <div className="tour-highlight">
                        <span aria-hidden="true">✨</span> {current.highlight}
                    </div>
                </div>

                {/* Navigation */}
                <div className="tour-nav">
                    {step > 0 && (
                        <button
                            type="button"
                            onClick={() => setStep(s => s - 1)}
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
                            onClick={() => setStep(s => s + 1)}
                            className="btn-primary tour-nav__next"
                            aria-label="Next step"
                        >
                            Next
                            <ChevronRight className="w-4 h-4" aria-hidden="true" />
                        </button>
                    )}
                </div>

                {/* Skip link */}
                {!isLast && (
                    <button type="button" onClick={dismiss} className="tour-skip">
                        Skip tour
                    </button>
                )}
            </div>
        </>
    );
}
