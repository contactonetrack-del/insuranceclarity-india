'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, CheckCircle2, ShieldAlert, Loader2, ArrowRight, Download, Clock } from 'lucide-react';
import { MagicButton } from '@/components/premium/buttons/magic-button';
import { AnimatedHeading, GradientText } from '@/components/premium/text/animated-text';
import { fetchQuoteStatus } from '../actions/track-actions';

export default function TrackQuotePage() {
    const [quoteId, setQuoteId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!quoteId.trim()) return;

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await fetchQuoteStatus(quoteId.trim());
            if (res.error) {
                setError(res.error);
            } else {
                setResult(res.quote);
            }
        } catch (err) {
            setError('Something went wrong communicating with the servers. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-theme-bg pt-32 pb-24 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-accent-10 to-transparent pointer-events-none" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-20 rounded-full blur-[120px] pointer-events-none mix-blend-screen opacity-50" />

            <div className="container px-4 mx-auto max-w-4xl relative z-10">
                <div className="text-center mb-16">
                    <AnimatedHeading
                        text="Track Your Application"
                        as="h1"
                        className="text-4xl md:text-5xl lg:text-6xl font-black mb-6"
                    />
                    <p className="text-xl text-theme-secondary max-w-2xl mx-auto">
                        Enter your tracking <GradientText>Quote ID</GradientText> to retrieve your binding policy, review coverage, or download your official PDF documents.
                    </p>
                </div>

                <motion.div
                    className="glass mt-8 p-8 md:p-12 rounded-3xl shadow-glow-sm relative -mr-0 border border-white/20 dark:border-white/10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto mb-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-theme-secondary group-focus-within:text-[rgb(var(--color-accent))] transition-colors" />
                            <input
                                type="text"
                                placeholder="e.g. POL-12345 or Database UUID"
                                value={quoteId}
                                onChange={(e) => setQuoteId(e.target.value)}
                                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-theme-bg/50 border border-theme-divider focus:border-[rgb(var(--color-accent))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]/20 transition-all text-lg font-medium shadow-inner"
                                required
                            />
                        </div>
                        <MagicButton
                            type="submit"
                            size="lg"
                            className="md:w-auto w-full group !py-4"
                            glow
                            disabled={isLoading || !quoteId.trim()}
                        >
                            {isLoading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    Locate Record
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </MagicButton>
                    </form>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 max-w-2xl mx-auto"
                            >
                                <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5" />
                                <p className="font-medium">{error}</p>
                            </motion.div>
                        )}

                        {result && (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="max-w-3xl mx-auto mt-12 bg-theme-bg/80 border border-theme-divider rounded-2xl backdrop-blur-md shadow-xl overflow-hidden"
                            >
                                <div className="p-6 border-b border-theme-divider bg-gradient-to-r from-accent-5 to-transparent flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-green-500/20 text-green-600 dark:text-green-400 rounded-xl">
                                            <CheckCircle2 className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-theme-secondary uppercase tracking-wider">Quote Verified</h3>
                                            <p className="text-xl font-bold font-mono tracking-tight">{result.id || quoteId}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[rgb(var(--color-accent))]/10 text-[rgb(var(--color-accent))]">
                                            <Clock className="w-3.5 h-3.5" />
                                            {result.status === 'PROCESSING_DOCUMENT' ? 'Generating PDF...' : result.status}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-8 relative">
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-sm text-theme-secondary mb-1">Insurance Type</p>
                                            <p className="text-xl font-bold">{result.insuranceType}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-theme-secondary mb-1">Base Premium Due</p>
                                            <p className="text-3xl font-black text-green-600 dark:text-green-400">
                                                ₹{result.premiumAmount?.toLocaleString('en-IN') || '---'}
                                                <span className="text-sm font-normal text-theme-secondary"> /month</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-sm text-theme-secondary mb-1">Total Coverage Value</p>
                                            <p className="text-xl font-bold tracking-tight">
                                                ₹{result.coverageAmount?.toLocaleString('en-IN') || '---'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-theme-secondary mb-1">Application Date</p>
                                            <p className="text-lg font-medium">{new Date(result.createdAt).toLocaleDateString(undefined, {
                                                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-theme-bg/50 border-t border-theme-divider flex flex-col sm:flex-row gap-4 items-center justify-between">
                                    <p className="text-sm text-theme-secondary flex-1">
                                        Your comprehensive document bundle is being compiled. If the status is pending, check back in a few minutes.
                                    </p>

                                    <MagicButton
                                        variant="secondary"
                                        size="md"
                                        className="shrink-0 w-full sm:w-auto"
                                        disabled={result.status === 'PROCESSING_DOCUMENT'}
                                        onClick={() => window.open(`/api/quotes/${result.id || quoteId}/pdf`, '_blank')}
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Download PDF
                                    </MagicButton>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </main>
    );
}
