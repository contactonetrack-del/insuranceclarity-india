import { auth } from '@/auth';
import { redirect } from "next/navigation";

import {
    ShieldCheck,
    Bookmark,
    User as UserIcon,
    ArrowRight,
    FileSearch,
    Calculator,
    ChevronRight,
    Zap,
    Target
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

import ScanActivityChart from '@/components/dashboard/ScanActivityChart';

interface PersonalizedHint {
    title: string;
    description: string;
    ctaLabel: string;
    ctaHref: string;
}

export const dynamic = "force-dynamic";

function formatCalculationPreview(result: unknown): string {
    if (!result || typeof result !== "object") {
        return "Calculation saved successfully.";
    }

    const record = result as Record<string, unknown>;
    const preferredKeys = ['recommendedCoverage', 'recommendedSumInsured', 'taxSavings', 'annualPremium', 'hlvResult'];

    for (const key of preferredKeys) {
        const value = record[key];
        if (typeof value === 'number') {
            return `${key}: ${value.toLocaleString('en-IN')}`;
        }
    }

    const compact = JSON.stringify(result);
    return compact.length > 110 ? `${compact.slice(0, 110)}...` : compact;
}

export default async function DashboardPage() {
    const [session, [{ prisma }]] = await Promise.all([
        auth(),
        Promise.all([import("@/lib/prisma")])
    ]);

    if (!session) {
        redirect("/");
    }

    // Fetching user data including scans and calculations
    const email = session.user?.email;
    if (!email) {
        redirect("/");
    }

    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            savedQuotes: { orderBy: { createdAt: "desc" }, take: 3 },
            scans: {
                orderBy: { createdAt: "desc" },
                take: 10,
                include: { report: true },
            },
            calculations: {
                orderBy: { createdAt: "desc" },
                take: 4,
            },
            _count: { select: { savedQuotes: true, calculations: true } },
        },
    });

    if (user) {
        const isRetained =
            user.scans.length > 0 &&
            Date.now() - new Date(user.createdAt).getTime() >= 7 * 24 * 60 * 60 * 1000;

        if (isRetained) {
            const { trackFunnelStep } = await import('@/lib/analytics/funnel');
            await trackFunnelStep('retain', { userId: user.id }).catch(() => { /* non-fatal */ });
        }
    }

    // Compute real risk score from the latest completed scan report
    const completedScans = user?.scans.filter(s => s.report?.score != null) ?? [];
    const latestRiskScore = completedScans[0]?.report?.score ?? null;
    const riskScoreDisplay = latestRiskScore !== null ? latestRiskScore.toFixed(1) : '—';

    const calcCount = user?._count?.calculations ?? 0;

    const personalizedHints: PersonalizedHint[] = (() => {
        if (!user) {
            return [
                {
                    title: 'Start with your first scan',
                    description: 'Upload one policy to unlock personalized risk insights and recommendations.',
                    ctaLabel: 'Scan Policy',
                    ctaHref: '/scan',
                },
            ];
        }

        const hints: PersonalizedHint[] = [];
        const scansCount = user.scans.length;
        const quotesCount = user.savedQuotes.length;

        if (scansCount === 0) {
            hints.push({
                title: 'Start with your first policy scan',
                description: 'Scanning a policy helps us tailor exclusions, risk hotspots, and advisor guidance to your profile.',
                ctaLabel: 'Scan First Policy',
                ctaHref: '/scan',
            });
        } else if (scansCount < 3) {
            hints.push({
                title: 'Compare multiple policies for better clarity',
                description: 'You have started strong. Add 1-2 more policies to unlock meaningful side-by-side comparison insights.',
                ctaLabel: 'Compare Policies',
                ctaHref: '/tools/compare',
            });
        }

        if (quotesCount === 0) {
            hints.push({
                title: 'Generate your first smart quote',
                description: 'Quote history improves your personalized recommendations over time.',
                ctaLabel: 'Create Quote',
                ctaHref: '/tools/interactive-quote',
            });
        }

        if ((user.plan ?? 'FREE') === 'FREE') {
            hints.push({
                title: 'Unlock deeper personalization with Pro',
                description: 'Pro gives higher scan limits, richer advisor context, and report exports for long-term tracking.',
                ctaLabel: 'View Pro Plan',
                ctaHref: '/pricing',
            });
        }

        if (hints.length === 0) {
            hints.push({
                title: 'You are on track',
                description: 'Keep scanning and reviewing insights to strengthen your insurance portfolio quality.',
                ctaLabel: 'Go to AI Advisor',
                ctaHref: '/tools/ai-advisor',
            });
        }

        return hints.slice(0, 2);
    })();

    // Build 30-day chart data from scan history
    const chartData = (() => {
        const days: { day: string; scans: number; risks: number }[] = [];
        const now = new Date();
        for (let i = 29; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const label = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
            const dayStart = new Date(d); dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(d); dayEnd.setHours(23, 59, 59, 999);
            const scansOnDay = user?.scans.filter(s => {
                const t = new Date(s.createdAt);
                return t >= dayStart && t <= dayEnd;
            }) ?? [];
            const risksOnDay = scansOnDay.reduce((sum, s) =>
                sum + ((s.report?.risks as unknown[] | null)?.length ?? 0), 0
            );
            days.push({ day: label, scans: scansOnDay.length, risks: risksOnDay });
        }
        return days;
    })();

    return (
        <div className="min-h-screen pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto space-y-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-theme-primary">
                            Welcome Back, <span className="text-gradient">{session.user?.name || "User"}</span>
                        </h1>
                        <p className="text-theme-muted mt-3 text-lg">
                            Your insurance intelligence hub.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="glass px-6 py-3 rounded-2xl border border-default flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-theme-muted font-bold">Profile Status</p>
                                <p className="text-xs font-semibold text-emerald-500">Fully Protected</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard
                        icon={<Bookmark className="w-5 h-5" />}
                        label="Saved Quotes"
                        value={user?.savedQuotes.length || 0}
                        color="from-blue-500 to-indigo-600"
                    />
                    <StatCard
                        icon={<Zap className="w-5 h-5" />}
                        label="AI Scans"
                        value={user?.scans.length || 0}
                        color="from-rose-500 to-red-600"
                    />
                    <StatCard
                        icon={<Calculator className="w-5 h-5" />}
                        label="Calculations"
                        value={calcCount}
                        color="from-accent to-accent-hover"
                    />
                    <StatCard
                        icon={<Target className="w-5 h-5" />}
                        label="Risk Score"
                        value={riskScoreDisplay}
                        color="from-emerald-500 to-teal-600"
                    />
                </div>

                {/* Scan Activity Chart */}
                <ScanActivityChart data={chartData} />

                <section className="grid grid-cols-1 md:grid-cols-2 gap-4" aria-label="Personalized recommendations">
                    {personalizedHints.map((hint) => (
                        <article key={hint.title} className="glass rounded-2xl border border-default p-5">
                            <p className="text-[10px] uppercase tracking-[0.16em] text-accent font-semibold">Personalized Recommendation</p>
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Main Feed */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* Saved Quotes Section */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-theme-primary flex items-center gap-3">
                                    <Bookmark className="w-6 h-6 text-blue-500" />
                                    Saved Insurance Quotes
                                </h2>
                                <Link href="/dashboard/quotes" className="text-sm text-accent hover:underline font-medium">
                                    View All
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {user?.savedQuotes.length === 0 ? (
                                    <div className="md:col-span-2">
                                        <EmptyState
                                            icon={<Bookmark className="w-8 h-8 text-slate-400" />}
                                            title="No quotes saved yet"
                                            desc="Generate an interactive quote to see customized pricing and policy details."
                                            btnText="Get a Quote"
                                            btnHref="/tools/interactive-quote"
                                        />
                                    </div>
                                ) : (
                                    user?.savedQuotes.map((quote) => (
                                        <div key={quote.id} className="glass p-5 rounded-2xl border border-default hover:border-blue-500/20 transition-all group">
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-[10px] font-black uppercase text-blue-500 bg-blue-500/5 px-2 py-0.5 rounded-lg border border-blue-500/10">
                                                    {quote.type}
                                                </span>
                                                <span className="text-[10px] text-theme-muted">{new Date(quote.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <p className="text-xs text-theme-muted mb-1 uppercase tracking-tighter">Yearly Premium</p>
                                                    <h4 className="text-2xl font-black text-theme-primary tracking-tight">
                                                        {formatCurrency(quote.premium)}
                                                    </h4>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] text-theme-muted uppercase mb-1">Coverage</p>
                                                    <p className="text-sm font-bold text-theme-secondary">{formatCurrency(quote.coverAmount)}</p>
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-default flex justify-between items-center">
                                                <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                    {quote.provider}
                                                </span>
                                                <button className="text-xs font-bold text-accent flex items-center gap-1 group-hover:underline">
                                                    Policy Doc <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>

                        {/* AI Scans Section */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-theme-primary flex items-center gap-3">
                                    <FileSearch className="w-6 h-6 text-rose-500" />
                                    Recent Policy Scans
                                </h2>
                                <Link href="/dashboard/scans" className="text-sm text-accent hover:underline font-medium">
                                    View All
                                </Link>
                            </div>

                            <div className="space-y-4">
                                {user?.scans.length === 0 ? (
                                    <EmptyState
                                        icon={<Zap className="w-8 h-8 text-slate-400" />}
                                        title="No policies scanned yet"
                                        desc="Upload your insurance brochure to unveil hidden exclusions using AI."
                                        btnText="Scan Policy"
                                        btnHref="/tools/ai-scanner"
                                    />
                                ) : (
                                    user?.scans.map((scan) => (
                                        <div key={scan.id} className="glass hover:border-rose-500/30 transition-all p-5 rounded-2xl border border-default flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center font-bold text-rose-500 border border-rose-500/20">
                                                    {scan.report?.score ?? '?'}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-theme-primary">{scan.fileName}</h4>
                                                    <p className="text-xs text-theme-muted uppercase tracking-tight">
                                                        Transparency Score • {scan.report ? (scan.report.risks as unknown[]).length : 0} Risks Found
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {(() => {
                                                    const badge = getScanBadge(scan.report?.score ?? scan.score);
                                                    return (
                                                        <span className={`text-xs font-bold px-2 py-1 rounded-lg border uppercase ${badge.className}`}>
                                                            {badge.label}
                                                        </span>
                                                    );
                                                })()}
                                                <Link
                                                    href={`/scan/result/${scan.id}`}
                                                    aria-label="View scan details"
                                                    className="p-2 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors"
                                                >
                                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>

                        {/* Calculations Section */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-theme-primary flex items-center gap-3">
                                    <Calculator className="w-6 h-6 text-accent" />
                                    Saved Calculations
                                </h2>
                                <Link href="/dashboard/calculations" className="text-sm text-accent hover:underline font-medium">
                                    View All
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {user?.calculations.length === 0 ? (
                                    <div className="md:col-span-2">
                                        <EmptyState
                                            icon={<Calculator className="w-8 h-8 text-slate-400" />}
                                            title="No calculations yet"
                                            desc="Use our calculators to find your HLV or Tax savings."
                                            btnText="Explore Tools"
                                            btnHref="/#tools"
                                        />
                                    </div>
                                ) : (
                                    user?.calculations.map((calculation) => (
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
                                                        {formatCalculationPreview(calculation.result)}
                                                    </p>
                                                </div>
                                                <Calculator className="w-4 h-4 text-accent shrink-0" />
                                            </div>
                                            <p className="text-xs text-theme-muted mt-3">
                                                Saved on {new Date(calculation.createdAt).toLocaleDateString('en-IN')}
                                            </p>
                                        </article>
                                    ))
                                )}

                            </div>
                        </section>

                    </div>

                    {/* Sidebar */}
                    <div className="space-y-10">
                        <div className="glass-strong rounded-3xl border border-default overflow-hidden shadow-xl">
                            <div className="bg-accent p-6 text-white">
                                <h3 className="text-xl font-bold">Quick Actions</h3>
                                <p className="text-white/80 text-xs mt-1">Shortcuts to essential tools.</p>
                            </div>
                            <div className="p-4 space-y-2">
                                <ShortcutItem icon={<FileSearch className="w-4 h-4" />} label="Scan Policy PDF" href="/tools/ai-scanner" />
                                <ShortcutItem icon={<Zap className="w-4 h-4" />} label="Bulk Scan (Enterprise)" href="/scan/bulk" />
                                <ShortcutItem icon={<Calculator className="w-4 h-4" />} label="HLV Calculator" href="/tools/hlv-calculator" />
                                <ShortcutItem icon={<UserIcon className="w-4 h-4" />} label="Profile Settings" href="/dashboard/profile" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-8 border border-white/10 text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <ShieldCheck className="w-24 h-24" />
                            </div>
                            <h3 className="text-xl font-bold relative z-10">Premium Support</h3>
                            <p className="text-slate-400 text-sm mt-3 leading-relaxed relative z-10">
                                Talk to our neutral insurance advisors today.
                            </p>
                            <Link href="/contact" className="inline-flex items-center gap-2 mt-6 text-emerald-400 font-bold hover:text-emerald-300 transition-colors relative z-10">
                                Talk to an Advisor <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: number | string, color: string }) {
    return (
        <div className="glass-strong rounded-3xl p-6 border border-default hover:shadow-2xl transition-all duration-500 overflow-hidden relative group">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-[0.03] group-hover:opacity-10 transition-opacity -mr-8 -mt-8 rounded-full`} />
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
                <div>
                    <p className="text-[10px] font-bold text-theme-muted uppercase tracking-widest">{label}</p>
                    <p className="text-2xl font-display font-bold text-theme-primary">{value}</p>
                </div>
            </div>
        </div>
    );
}

function ShortcutItem({ icon, label, href }: { icon: React.ReactNode, label: string, href: string }) {
    return (
        <Link href={href} className="flex items-center justify-between p-3.5 rounded-xl hover:bg-accent/5 transition-all group">
            <div className="flex items-center gap-3">
                <div className="text-theme-muted group-hover:text-accent transition-colors">{icon}</div>
                <span className="text-sm font-medium text-theme-secondary group-hover:text-theme-primary transition-colors">{label}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-theme-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </Link>
    );
}

function EmptyState({ icon, title, desc, btnText, btnHref }: { icon: React.ReactNode, title: string, desc: string, btnText: string, btnHref: string }) {
    return (
        <div className="glass-strong rounded-3xl p-10 text-center border border-dashed border-default">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                {icon}
            </div>
            <h3 className="text-lg font-bold text-theme-primary">{title}</h3>
            <p className="text-theme-muted text-sm mt-1 max-w-xs mx-auto">{desc}</p>
            <Link href={btnHref} className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-accent text-white font-bold rounded-xl shadow-lg active:scale-95 transition-all">
                {btnText} <ArrowRight className="w-4 h-4" />
            </Link>
        </div>
    );
}

function getScanBadge(score?: number | null): { label: string; className: string } {
    if (score == null) {
        return {
            label: 'Analyzing',
            className: 'text-slate-500 bg-slate-500/5 border-slate-500/10',
        };
    }

    if (score >= 70) {
        return {
            label: 'Low Risk',
            className: 'text-emerald-500 bg-emerald-500/5 border-emerald-500/20',
        };
    }

    if (score >= 40) {
        return {
            label: 'Moderate Risk',
            className: 'text-amber-500 bg-amber-500/5 border-amber-500/20',
        };
    }

    return {
        label: 'High Risk',
        className: 'text-rose-500 bg-rose-500/5 border-rose-500/20',
    };
}
