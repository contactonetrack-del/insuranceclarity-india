import Link from 'next/link';
import { ArrowLeft, BookMarked } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import { requireDashboardUser } from '../_lib/require-dashboard-user';

export const dynamic = 'force-dynamic';

export default async function DashboardQuotesPage() {
    const { user } = await requireDashboardUser();

    const quotes = await prisma.savedQuote.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
    });

    return (
        <main className="min-h-screen pt-28 pb-16 px-6">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-theme-muted">Dashboard</p>
                        <h1 className="text-3xl font-display font-bold text-theme-primary mt-1">Saved Quotes</h1>
                    </div>
                    <Link href="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-default hover:bg-accent/5 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Link>
                </div>

                {quotes.length === 0 ? (
                    <div className="glass-strong rounded-3xl border border-dashed border-default p-10 text-center">
                        <p className="text-theme-primary font-semibold">No saved quotes yet</p>
                        <p className="text-sm text-theme-muted mt-1">Generate a quote from our interactive tools and it will appear here.</p>
                        <Link href="/tools/interactive-quote" className="inline-flex mt-5 px-5 py-2.5 rounded-xl bg-accent text-white font-semibold">
                            Get Quote
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {quotes.map((quote) => (
                            <article key={quote.id} className="glass rounded-2xl border border-default p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-[11px] uppercase tracking-[0.14em] text-theme-muted">{quote.type}</p>
                                        <h2 className="text-lg font-semibold text-theme-primary mt-1">{quote.provider}</h2>
                                    </div>
                                    <BookMarked className="w-5 h-5 text-accent shrink-0" />
                                </div>

                                <div className="mt-4 space-y-2 text-sm">
                                    <p className="text-theme-secondary">
                                        Premium: <span className="font-semibold text-theme-primary">{formatCurrency(quote.premium)}</span>
                                    </p>
                                    <p className="text-theme-secondary">
                                        Coverage: <span className="font-semibold text-theme-primary">{formatCurrency(quote.coverAmount)}</span>
                                    </p>
                                    {quote.notes ? <p className="text-theme-muted">{quote.notes}</p> : null}
                                </div>

                                <p className="text-xs text-theme-muted mt-4">
                                    Saved on {new Date(quote.createdAt).toLocaleString('en-IN')}
                                </p>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
