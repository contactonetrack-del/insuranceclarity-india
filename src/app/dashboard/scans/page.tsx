import Link from 'next/link';
import { ArrowLeft, BadgeCheck, Clock3, FileWarning, Lock, ShieldAlert } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { requireDashboardUser } from '../_lib/require-dashboard-user';

export const dynamic = 'force-dynamic';

function scoreBadge(score: number | null): { label: string; className: string } {
    if (score === null) {
        return { label: 'Pending Score', className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200' };
    }

    if (score >= 70) {
        return { label: 'Low Risk', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' };
    }

    if (score >= 40) {
        return { label: 'Moderate Risk', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' };
    }

    return { label: 'High Risk', className: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' };
}

function statusIcon(status: string) {
    if (status === 'COMPLETED') return <BadgeCheck className="w-4 h-4 text-emerald-500" />;
    if (status === 'FAILED') return <FileWarning className="w-4 h-4 text-rose-500" />;
    return <Clock3 className="w-4 h-4 text-amber-500" />;
}

export default async function DashboardScansPage() {
    const { user } = await requireDashboardUser();

    const scans = await prisma.scan.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        include: {
            report: {
                select: {
                    risks: true,
                },
            },
        },
    });

    return (
        <main className="min-h-screen pt-28 pb-16 px-6">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-theme-muted">Dashboard</p>
                        <h1 className="text-3xl font-display font-bold text-theme-primary mt-1">Your Policy Scans</h1>
                    </div>
                    <Link href="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-default hover:bg-accent/5 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Link>
                </div>

                {scans.length === 0 ? (
                    <div className="glass-strong rounded-3xl border border-dashed border-default p-10 text-center">
                        <p className="text-theme-primary font-semibold">No scans yet</p>
                        <p className="text-sm text-theme-muted mt-1">Upload your first policy PDF to start getting risk analysis.</p>
                        <Link href="/scan" className="inline-flex mt-5 px-5 py-2.5 rounded-xl bg-accent text-white font-semibold">
                            Scan a Policy
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {scans.map((scan) => {
                            const risks = scan.report?.risks as unknown[] | null | undefined;
                            const riskCount = Array.isArray(risks) ? risks.length : 0;
                            const badge = scoreBadge(scan.score ?? null);

                            return (
                                <article key={scan.id} className="glass rounded-2xl border border-default p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            {statusIcon(scan.status)}
                                            <p className="font-semibold text-theme-primary">{scan.fileName}</p>
                                        </div>
                                        <p className="text-xs text-theme-muted">
                                            {new Date(scan.createdAt).toLocaleString('en-IN')} · Status: {scan.status}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className={`px-2 py-1 rounded-md font-semibold ${badge.className}`}>{badge.label}</span>
                                            <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                                {riskCount} risks
                                            </span>
                                            <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 inline-flex items-center gap-1">
                                                {scan.isPaid ? <ShieldAlert className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                                {scan.isPaid ? 'Unlocked' : 'Paywalled'}
                                            </span>
                                        </div>
                                    </div>

                                    <Link
                                        href={`/scan/result/${scan.id}`}
                                        className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-accent text-white font-semibold whitespace-nowrap"
                                    >
                                        View Report
                                    </Link>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}

