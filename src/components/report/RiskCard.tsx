'use client';

/**
 * RiskCard — Displays a single risk, exclusion, suggestion, or hidden clause
 */

import type { RiskItem, ExclusionItem, SuggestionItem, HiddenClauseItem } from '@/types/report.types';

// ─── Severity Badge ───────────────────────────────────────────────────────────

function SeverityBadge({ severity }: { severity: string }) {
    const map: Record<string, { label: string; className: string }> = {
        HIGH:   { label: 'High Risk',   className: 'badge--high'   },
        MEDIUM: { label: 'Medium Risk', className: 'badge--medium' },
        LOW:    { label: 'Low Risk',    className: 'badge--low'    },
    };
    const cfg = map[severity] ?? map.MEDIUM;
    return <span className={`risk-badge ${cfg.className}`}>{cfg.label}</span>;
}

// ─── Risk Card ────────────────────────────────────────────────────────────────

export function RiskCard({ risk, index }: { risk: RiskItem; index: number }) {
    return (
        <article className="risk-card" aria-label={`Risk ${index + 1}: ${risk.title}`}>
            <div className="risk-card__header">
                <h3 className="risk-card__title">{risk.title}</h3>
                <SeverityBadge severity={risk.severity} />
            </div>
            <p className="risk-card__desc">{risk.description}</p>
        </article>
    );
}

// ─── Exclusion Card ───────────────────────────────────────────────────────────

export function ExclusionCard({ exclusion, index }: { exclusion: ExclusionItem; index: number }) {
    return (
        <article className="exclusion-card" aria-label={`Exclusion ${index + 1}`}>
            <div className="exclusion-card__icon" aria-hidden>🚫</div>
            <div className="exclusion-card__content">
                <p className="exclusion-card__clause">{exclusion.clause}</p>
                <p className="exclusion-card__impact">
                    <strong>Impact:</strong> {exclusion.impact}
                </p>
            </div>
        </article>
    );
}

// ─── Suggestion Card ──────────────────────────────────────────────────────────

export function SuggestionCard({ suggestion, index }: { suggestion: SuggestionItem; index: number }) {
    const priorityMap: Record<string, string> = {
        HIGH:   '🔥 High Priority',
        MEDIUM: '⚡ Medium Priority',
        LOW:    '💡 Low Priority',
    };

    return (
        <article className="suggestion-card" aria-label={`Suggestion ${index + 1}`}>
            <div className="suggestion-card__header">
                <span className="suggestion-card__priority">
                    {priorityMap[suggestion.priority] ?? '💡 Suggestion'}
                </span>
            </div>
            <p className="suggestion-card__action">{suggestion.action}</p>
        </article>
    );
}

// ─── Hidden Clause Card ───────────────────────────────────────────────────────

export function HiddenClauseCard({ hiddenClause, index }: { hiddenClause: HiddenClauseItem; index: number }) {
    return (
        <article className="hidden-clause-card" aria-label={`Hidden clause ${index + 1}`}>
            <div className="hidden-clause-card__icon" aria-hidden>🔍</div>
            <div className="hidden-clause-card__content">
                <p className="hidden-clause-card__clause">{hiddenClause.clause}</p>
                <p className="hidden-clause-card__risk">
                    <strong>Risk:</strong> {hiddenClause.risk}
                </p>
            </div>
        </article>
    );
}
