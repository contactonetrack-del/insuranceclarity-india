'use client';

/**
 * ScoreRing — Animated circular score gauge (0–100)
 *
 * Renders a SVG ring with animated fill and color-coded score.
 */

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

interface ScoreRingProps {
    score: number;
    size?: number;
    strokeWidth?: number;
    animated?: boolean;
    className?: string;
}

function getScoreColor(score: number): string {
    if (score >= 80) return 'rgb(var(--token-semantic-success))';
    if (score >= 60) return 'rgb(var(--token-semantic-warning))';
    if (score >= 40) return 'rgb(var(--token-semantic-warning))';
    if (score >= 20) return 'rgb(var(--token-semantic-danger))';
    return 'rgb(var(--token-semantic-danger))';
}

function getScoreLabel(score: number): 'excellent' | 'good' | 'average' | 'poor' | 'veryPoor' {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    if (score >= 20) return 'poor';
    return 'veryPoor';
}

export function ScoreRing({
    score,
    size          = 180,
    strokeWidth   = 14,
    animated      = true,
    className     = '',
}: ScoreRingProps) {
    const t = useTranslations('scan.resultPage.report.scoreRing');
    const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

    const radius      = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const center      = size / 2;

    const color = getScoreColor(clampedScore);
    const label = t(`labels.${getScoreLabel(clampedScore)}`);

    // Animate from 0 to target score
    const [displayScore, setDisplayScore] = useState(animated ? 0 : clampedScore);
    const animFrameRef = useRef<number | null>(null);

    useEffect(() => {
        if (!animated) {
            setDisplayScore(clampedScore);
            return;
        }

        const duration  = 1500; // ms
        const startTime = performance.now();
        const startVal  = 0;

        function step(now: number) {
            const elapsed  = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased    = 1 - Math.pow(1 - progress, 3);
            setDisplayScore(Math.round(startVal + eased * clampedScore));

            if (progress < 1) {
                animFrameRef.current = requestAnimationFrame(step);
            }
        }

        animFrameRef.current = requestAnimationFrame(step);
        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [clampedScore, animated]);

    const dashOffset = circumference - (displayScore / 100) * circumference;

    return (
        <figure
            className={`m-0 flex shrink-0 flex-col items-center gap-1.5 ${className}`}
            aria-label={t('ariaLabel', { score: clampedScore, label })}
            role="img"
        >
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                aria-hidden="true"
            >
                {/* Background track */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="rgb(var(--token-border-subtle))"
                    strokeWidth={strokeWidth}
                />

                {/* Progress ring */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${center} ${center})`}
                    style={{ transition: 'stroke-dashoffset 0.05s linear' }}
                />

                {/* Score text */}
                <text
                    x={center}
                    y={center - 8}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={size * 0.22}
                    fontWeight="700"
                    fill={color}
                    fontFamily="inherit"
                >
                    {displayScore}
                </text>

                {/* Label text */}
                <text
                    x={center}
                    y={center + size * 0.15}
                    textAnchor="middle"
                    fontSize={size * 0.085}
                    fill="rgb(var(--color-text-secondary))"
                    fontFamily="inherit"
                >
                    {label}
                </text>
            </svg>

            <figcaption className="text-xs font-semibold uppercase tracking-[0.08em] text-token-text-muted">
                {t('caption')}
            </figcaption>
        </figure>
    );
}
