import Link from 'next/link'
import {
    ShieldCheck,
    Bookmark,
    User as UserIcon,
    ArrowRight,
    FileSearch,
    Calculator,
    ChevronRight,
    Zap,
    Target,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import {
    EmptyState,
    ShortcutItem,
    StatCard,
    formatCalculationPreviewWithOptions,
    getScanBadge,
} from '@/components/dashboard/DashboardPrimitives'

export interface PersonalizedHint {
    title: string
    description: string
    ctaLabel: string
    ctaHref: string
}

export interface DashboardQuote {
    id: string
    type: string
    provider: string
    premium: number
    coverAmount: number
    createdAt: Date
}

export interface DashboardScan {
    id: string
    fileName: string
    createdAt: Date
    score?: number | null
    report?: {
        score?: number | null
        risks?: unknown
    } | null
}

export interface DashboardCalculation {
    id: string
    type: string
    result: unknown
    createdAt: Date
}

export interface DashboardCopy {
    header: {
        welcomeBackPrefix: string
        anonymousUser: string
        subtitle: string
        profileStatusLabel: string
        profileStatusValue: string
    }
    stats: {
        savedQuotes: string
        aiScans: string
        calculations: string
        riskScore: string
    }
    recommendations: {
        sectionAriaLabel: string
        badge: string
    }
    mainFeed: {
        savedQuotes: {
            title: string
            viewAll: string
            emptyTitle: string
            emptyDescription: string
            emptyAction: string
            yearlyPremium: string
            coverage: string
            policyDoc: string
        }
        scans: {
            title: string
            viewAll: string
            emptyTitle: string
            emptyDescription: string
            emptyAction: string
            transparencyScore: string
            risksFound: string
            viewScanDetailsAria: string
            badge: {
                analyzing: string
                lowRisk: string
                moderateRisk: string
                highRisk: string
            }
        }
        calculations: {
            title: string
            viewAll: string
            emptyTitle: string
            emptyDescription: string
            emptyAction: string
            savedOn: string
            previewFallback: string
            previewKeys: {
                recommendedCoverage: string
                recommendedSumInsured: string
                taxSavings: string
                annualPremium: string
                hlvResult: string
            }
        }
    }
    sidebar: {
        quickActions: {
            title: string
            subtitle: string
            scanPolicyPdf: string
            bulkScan: string
            hlvCalculator: string
            profileSettings: string
        }
        premiumSupport: {
            title: string
            description: string
            cta: string
        }
    }
}

interface DashboardHeaderSectionProps {
    userName?: string | null
    copy: DashboardCopy['header']
}

export function DashboardHeaderSection({
    userName,
    copy,
}: DashboardHeaderSectionProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
                <h1 className="text-4xl md:text-5xl font-display font-bold text-theme-primary">
                    {copy.welcomeBackPrefix} <span className="text-gradient">{userName || copy.anonymousUser}</span>
                </h1>
                <p className="text-theme-muted mt-3 text-lg">
                    {copy.subtitle}
                </p>
            </div>
            <div className="flex items-center gap-4">
                <div className="glass px-6 py-3 rounded-2xl border border-default flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-theme-muted font-bold">{copy.profileStatusLabel}</p>
                        <p className="text-xs font-semibold text-success-500">{copy.profileStatusValue}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

interface DashboardStatsGridProps {
    savedQuotesCount: number
    scansCount: number
    calcCount: number
    riskScoreDisplay: string
    copy: DashboardCopy['stats']
}

export function DashboardStatsGrid({
    savedQuotesCount,
    scansCount,
    calcCount,
    riskScoreDisplay,
    copy,
}: DashboardStatsGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
                icon={<Bookmark className="w-5 h-5" />}
                label={copy.savedQuotes}
                value={savedQuotesCount}
                color="from-accent to-accent-hover"
            />
            <StatCard
                icon={<Zap className="w-5 h-5" />}
                label={copy.aiScans}
                value={scansCount}
                color="from-rose-500 to-red-600"
            />
            <StatCard
                icon={<Calculator className="w-5 h-5" />}
                label={copy.calculations}
                value={calcCount}
                color="from-accent to-accent-hover"
            />
            <StatCard
                icon={<Target className="w-5 h-5" />}
                label={copy.riskScore}
                value={riskScoreDisplay}
                color="from-success-500 to-success-500/80"
            />
        </div>
    )
}

interface PersonalizedRecommendationsProps {
    hints: PersonalizedHint[]
    copy: DashboardCopy['recommendations']
}

export function PersonalizedRecommendations({
    hints,
    copy,
}: PersonalizedRecommendationsProps) {
    return (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4" aria-label={copy.sectionAriaLabel}>
            {hints.map((hint) => (
                <article key={hint.title} className="glass rounded-2xl border border-default p-5">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-accent font-semibold">{copy.badge}</p>
                    <h3 className="text-lg font-semibold text-theme-primary mt-2">{hint.title}</h3>
                    <p className="text-sm text-theme-secondary mt-2">{hint.description}</p>
                    <Link
                        href={hint.ctaHref}
                        className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-accent hover:underline"
                    >
                        {hint.ctaLabel}
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </article>
            ))}
        </section>
    )
}

interface DashboardMainFeedProps {
    savedQuotes: DashboardQuote[]
    scans: DashboardScan[]
    calculations: DashboardCalculation[]
    copy: DashboardCopy['mainFeed']
    localeTag?: string
}

export function DashboardMainFeed({
    savedQuotes,
    scans,
    calculations,
    copy,
    localeTag = 'en-IN',
}: DashboardMainFeedProps) {
    return (
        <div className="lg:col-span-2 space-y-12">
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-theme-primary flex items-center gap-3">
                        <Bookmark className="w-6 h-6 text-accent" />
                        {copy.savedQuotes.title}
                    </h2>
                    <Link href="/dashboard/quotes" className="text-sm text-accent hover:underline font-medium">
                        {copy.savedQuotes.viewAll}
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedQuotes.length === 0 ? (
                        <div className="md:col-span-2">
                            <EmptyState
                                icon={<Bookmark className="w-8 h-8 text-slate-400" />}
                                title={copy.savedQuotes.emptyTitle}
                                desc={copy.savedQuotes.emptyDescription}
                                btnText={copy.savedQuotes.emptyAction}
                                btnHref="/tools/interactive-quote"
                            />
                        </div>
                    ) : (
                        savedQuotes.map((quote) => (
                            <div key={quote.id} className="glass p-5 rounded-2xl border border-default hover:border-accent/20 transition-all group">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[10px] font-black uppercase text-accent bg-accent/5 px-2 py-0.5 rounded-lg border border-accent/10">
                                        {quote.type}
                                    </span>
                                    <span className="text-[10px] text-theme-muted">{new Date(quote.createdAt).toLocaleDateString(localeTag)}</span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-xs text-theme-muted mb-1 uppercase tracking-tighter">{copy.savedQuotes.yearlyPremium}</p>
                                        <h4 className="text-2xl font-black text-theme-primary tracking-tight">
                                            {formatCurrency(quote.premium)}
                                        </h4>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-theme-muted uppercase mb-1">{copy.savedQuotes.coverage}</p>
                                        <p className="text-sm font-bold text-theme-secondary">{formatCurrency(quote.coverAmount)}</p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-default flex justify-between items-center">
                                    <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-success-50 text-success-500 border border-success-500/25">
                                        {quote.provider}
                                    </span>
                                    <button className="text-xs font-bold text-accent flex items-center gap-1 group-hover:underline">
                                        {copy.savedQuotes.policyDoc} <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-theme-primary flex items-center gap-3">
                        <FileSearch className="w-6 h-6 text-rose-500" />
                        {copy.scans.title}
                    </h2>
                    <Link href="/dashboard/scans" className="text-sm text-accent hover:underline font-medium">
                        {copy.scans.viewAll}
                    </Link>
                </div>

                <div className="space-y-4">
                    {scans.length === 0 ? (
                        <EmptyState
                            icon={<Zap className="w-8 h-8 text-slate-400" />}
                            title={copy.scans.emptyTitle}
                            desc={copy.scans.emptyDescription}
                            btnText={copy.scans.emptyAction}
                            btnHref="/tools/ai-scanner"
                        />
                    ) : (
                        scans.map((scan) => {
                            const riskCount = Array.isArray(scan.report?.risks)
                                ? scan.report.risks.length
                                : 0
                            const badge = getScanBadge(scan.report?.score ?? scan.score, copy.scans.badge)

                            return (
                                <div key={scan.id} className="glass hover:border-rose-500/30 transition-all p-5 rounded-2xl border border-default flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center font-bold text-rose-500 border border-rose-500/20">
                                            {scan.report?.score ?? '?'}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-theme-primary">{scan.fileName}</h4>
                                            <p className="text-xs text-theme-muted uppercase tracking-tight">
                                                {copy.scans.transparencyScore} | {riskCount} {copy.scans.risksFound}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-lg border uppercase ${badge.className}`}>
                                            {badge.label}
                                        </span>
                                        <Link
                                            href={`/scan/result/${scan.id}`}
                                            aria-label={copy.scans.viewScanDetailsAria}
                                            className="p-2 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors"
                                        >
                                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </section>

            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-theme-primary flex items-center gap-3">
                        <Calculator className="w-6 h-6 text-accent" />
                        {copy.calculations.title}
                    </h2>
                    <Link href="/dashboard/calculations" className="text-sm text-accent hover:underline font-medium">
                        {copy.calculations.viewAll}
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {calculations.length === 0 ? (
                        <div className="md:col-span-2">
                            <EmptyState
                                icon={<Calculator className="w-8 h-8 text-slate-400" />}
                                title={copy.calculations.emptyTitle}
                                desc={copy.calculations.emptyDescription}
                                btnText={copy.calculations.emptyAction}
                                btnHref="/#tools"
                            />
                        </div>
                    ) : (
                        calculations.map((calculation) => (
                            <article
                                key={calculation.id}
                                className="glass p-5 rounded-2xl border border-default hover:border-accent/25 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.14em] text-theme-muted">
                                            {calculation.type.replaceAll('_', ' ')}
                                        </p>
                                        <p className="text-sm font-semibold text-theme-primary mt-1">
                                            {formatCalculationPreviewWithOptions(calculation.result, {
                                                fallbackText: copy.calculations.previewFallback,
                                                localeTag,
                                                keyLabels: copy.calculations.previewKeys,
                                            })}
                                        </p>
                                    </div>
                                    <Calculator className="w-4 h-4 text-accent shrink-0" />
                                </div>
                                <p className="text-xs text-theme-muted mt-3">
                                    {copy.calculations.savedOn} {new Date(calculation.createdAt).toLocaleDateString(localeTag)}
                                </p>
                            </article>
                        ))
                    )}
                </div>
            </section>
        </div>
    )
}

interface DashboardSidebarProps {
    copy: DashboardCopy['sidebar']
}

export function DashboardSidebar({
    copy,
}: DashboardSidebarProps) {
    return (
        <div className="space-y-10">
            <div className="glass-strong rounded-3xl border border-default overflow-hidden shadow-xl">
                <div className="bg-accent p-6 text-white">
                    <h3 className="text-xl font-bold">{copy.quickActions.title}</h3>
                    <p className="text-white/80 text-xs mt-1">{copy.quickActions.subtitle}</p>
                </div>
                <div className="p-4 space-y-2">
                    <ShortcutItem icon={<FileSearch className="w-4 h-4" />} label={copy.quickActions.scanPolicyPdf} href="/tools/ai-scanner" />
                    <ShortcutItem icon={<Zap className="w-4 h-4" />} label={copy.quickActions.bulkScan} href="/scan/bulk" />
                    <ShortcutItem icon={<Calculator className="w-4 h-4" />} label={copy.quickActions.hlvCalculator} href="/tools/hlv-calculator" />
                    <ShortcutItem icon={<UserIcon className="w-4 h-4" />} label={copy.quickActions.profileSettings} href="/dashboard/profile" />
                </div>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-8 border border-white/10 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <ShieldCheck className="w-24 h-24" />
                </div>
                <h3 className="text-xl font-bold relative z-10">{copy.premiumSupport.title}</h3>
                <p className="text-slate-400 text-sm mt-3 leading-relaxed relative z-10">
                    {copy.premiumSupport.description}
                </p>
                <Link href="/contact" className="inline-flex items-center gap-2 mt-6 text-accent font-bold hover:text-accent-hover transition-colors relative z-10">
                    {copy.premiumSupport.cta} <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    )
}
