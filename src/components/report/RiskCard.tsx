'use client';

/**
 * RiskCard — Displays a single risk, exclusion, suggestion, or hidden clause
 */

import type { RiskItem, ExclusionItem, SuggestionItem, HiddenClauseItem } from '@/types/report.types';
import { useTranslations } from 'next-intl';

// ─── Severity Badge ───────────────────────────────────────────────────────────

function SeverityBadge({ severity, label }: { severity: string; label: string }) {
    const map: Record<string, { className: string }> = {
        HIGH: {
            className:
                'border-[rgb(var(--token-semantic-danger)/0.2)] bg-[rgb(var(--token-semantic-danger)/0.1)] text-[rgb(var(--token-semantic-danger))] dark:bg-[rgb(var(--token-semantic-danger)/0.12)] dark:text-[rgb(var(--token-semantic-danger-soft))]',
        },
        MEDIUM: {
            className:
                'border-[rgb(var(--token-semantic-warning)/0.2)] bg-[rgb(var(--token-semantic-warning)/0.1)] text-[rgb(var(--token-semantic-warning))] dark:bg-[rgb(var(--token-semantic-warning)/0.12)] dark:text-[rgb(var(--token-semantic-warning-soft))]',
        },
        LOW: {
            className:
                'border-[rgb(var(--token-semantic-success)/0.2)] bg-[rgb(var(--token-semantic-success)/0.1)] text-[rgb(var(--token-semantic-success))] dark:bg-[rgb(var(--token-semantic-success)/0.12)] dark:text-[rgb(var(--token-semantic-success-soft))]',
        },
    };
    const cfg = map[severity] ?? map.MEDIUM;
    return (
        <span
            className={`inline-flex shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.06em] ${cfg.className}`}
        >
            {label}
        </span>
    );
}

// ─── Risk Card ────────────────────────────────────────────────────────────────

export function RiskCard({ risk, index }: { risk: RiskItem; index: number }) {
    const t = useTranslations('scan.resultPage.report.cards');
    const severityLabelByKey: Record<string, string> = {
        HIGH: t('severity.high'),
        MEDIUM: t('severity.medium'),
        LOW: t('severity.low'),
    };

    return (
        <article
            className="flex flex-col gap-2 rounded-xl border border-token-border-subtle bg-[rgba(var(--color-card-bg),0.85)] px-[18px] py-4 transition-[border-color,transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-token-border-strong hover:shadow-sm"
            aria-label={`Risk ${index + 1}: ${risk.title}`}
        >
            <div className="flex items-start justify-between gap-2.5">
                <h3 className="m-0 flex-1 text-[0.9375rem] font-bold leading-[1.4] text-token-text-primary">
                    {risk.title}
                </h3>
                <SeverityBadge
                    severity={risk.severity}
                    label={severityLabelByKey[risk.severity] ?? severityLabelByKey.MEDIUM}
                />
            </div>
            <p className="m-0 text-sm leading-6 text-token-text-secondary">{risk.description}</p>
        </article>
    );
}

// ─── Exclusion Card ───────────────────────────────────────────────────────────

export function ExclusionCard({ exclusion, index }: { exclusion: ExclusionItem; index: number }) {
    const t = useTranslations('scan.resultPage.report.cards');

    return (
        <article
            className="flex gap-3.5 rounded-lg border border-[rgb(var(--token-semantic-danger)/0.15)] bg-[rgb(var(--token-semantic-danger)/0.04)] px-4 py-3.5 transition-[border-color,transform] duration-200 ease-out hover:translate-x-[3px] hover:border-[rgb(var(--token-semantic-danger)/0.3)]"
            aria-label={`Exclusion ${index + 1}`}
        >
            <div className="mt-px shrink-0 text-lg" aria-hidden>
                🚫
            </div>
            <div>
                <p className="m-0 mb-1 text-sm font-medium leading-[1.55] text-token-text-primary">{exclusion.clause}</p>
                <p className="m-0 text-[0.8125rem] leading-[1.5] text-token-text-secondary">
                    <strong>{t('impactLabel')}</strong> {exclusion.impact}
                </p>
            </div>
        </article>
    );
}

// ─── Suggestion Card ──────────────────────────────────────────────────────────

export function SuggestionCard({ suggestion, index }: { suggestion: SuggestionItem; index: number }) {
    const t = useTranslations('scan.resultPage.report.cards');
    const priorityMap: Record<string, string> = {
        HIGH:   '🔥 High Priority',
        MEDIUM: '⚡ Medium Priority',
        LOW:    '💡 Low Priority',
    };

    return (
        <article
            className="flex flex-col gap-1.5 rounded-lg border border-[rgb(var(--token-semantic-success)/0.15)] bg-[rgb(var(--token-semantic-success)/0.04)] px-4 py-3.5 transition-[border-color,transform] duration-200 ease-out hover:translate-x-[3px] hover:border-[rgb(var(--token-semantic-success)/0.35)]"
            aria-label={`Suggestion ${index + 1}`}
        >
            <div className="flex items-center">
                <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-[rgb(var(--token-semantic-success))] dark:text-[rgb(var(--token-semantic-success-soft))]">
                    {priorityMap[suggestion.priority] ?? `💡 ${t('suggestionDefault')}`}
                </span>
            </div>
            <p className="m-0 text-sm font-medium leading-[1.6] text-token-text-primary">{suggestion.action}</p>
        </article>
    );
}

// ─── Hidden Clause Card ───────────────────────────────────────────────────────

export function HiddenClauseCard({ hiddenClause, index }: { hiddenClause: HiddenClauseItem; index: number }) {
    const t = useTranslations('scan.resultPage.report.cards');

    return (
        <article
            className="flex gap-3.5 rounded-lg border border-[rgb(var(--token-semantic-warning)/0.15)] bg-[rgb(var(--token-semantic-warning)/0.04)] px-4 py-3.5 transition-[border-color,transform] duration-200 ease-out hover:translate-x-[3px] hover:border-[rgb(var(--token-semantic-warning)/0.35)]"
            aria-label={`Hidden clause ${index + 1}`}
        >
            <div className="shrink-0 text-lg" aria-hidden>
                🔍
            </div>
            <div>
                <p className="m-0 mb-1 text-sm font-medium leading-[1.55] text-token-text-primary">{hiddenClause.clause}</p>
                <p className="m-0 text-[0.8125rem] leading-[1.5] text-token-text-secondary">
                    <strong>{t('riskLabel')}</strong> {hiddenClause.risk}
                </p>
            </div>
        </article>
    );
}
