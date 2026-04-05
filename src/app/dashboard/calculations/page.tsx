import Link from 'next/link';
import { ArrowLeft, Calculator } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { requireDashboardUser } from '../_lib/require-dashboard-user';

export const dynamic = 'force-dynamic';

function formatCalculationPreview(result: unknown): string {
    if (!result || typeof result !== 'object') {
        return 'Calculation saved successfully.';
    }

    const record = result as Record<string, unknown>;
    const preferredKeys = ['recommendedCoverage', 'recommendedSumInsured', 'taxSavings', 'annualPremium'];

    for (const key of preferredKeys) {
        const value = record[key];
        if (typeof value === 'number') {
            return `${key}: ${value.toLocaleString('en-IN')}`;
        }
    }

    const compact = JSON.stringify(result);
    return compact.length > 140 ? `${compact.slice(0, 140)}...` : compact;
}

export default async function DashboardCalculationsPage() {
    const { user } = await requireDashboardUser();

    const calculations = await prisma.userCalculation.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 100,
    });

    return (
        <main className="min-h-screen pt-28 pb-16 px-6">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-theme-muted">Dashboard</p>
                        <h1 className="text-3xl font-display font-bold text-theme-primary mt-1">Saved Calculations</h1>
                    </div>
                    <Link href="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-default hover:bg-accent/5 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Link>
                </div>

                {calculations.length === 0 ? (
                    <div className="glass-strong rounded-3xl border border-dashed border-default p-10 text-center">
                        <p className="text-theme-primary font-semibold">No saved calculations yet</p>
                        <p className="text-sm text-theme-muted mt-1">Use the calculators and we will auto-save your latest results here.</p>
                        <Link href="/tools/calculator" className="inline-flex mt-5 px-5 py-2.5 rounded-xl bg-accent text-white font-semibold">
                            Open Calculators
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {calculations.map((calculation) => (
                            <article key={calculation.id} className="glass rounded-2xl border border-default p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-[11px] uppercase tracking-[0.14em] text-theme-muted">
                                            {calculation.type.replaceAll('_', ' ')}
                                        </p>
                                        <p className="text-sm text-theme-secondary mt-1">
                                            {formatCalculationPreview(calculation.result)}
                                        </p>
                                    </div>
                                    <Calculator className="w-5 h-5 text-accent shrink-0" />
                                </div>
                                <p className="text-xs text-theme-muted mt-3">
                                    Saved on {new Date(calculation.createdAt).toLocaleString('en-IN')}
                                </p>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

