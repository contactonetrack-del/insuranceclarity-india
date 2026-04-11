'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle2, ShieldAlert, Loader2, ArrowRight, Download, Clock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { FormField, inputClasses } from '@/components/ui/FormField';
import { AnimatedHeading, GradientText } from '@/components/premium/text/animated-text';
import { fetchQuoteStatus } from '../actions/track-actions';
import { cn } from '@/lib/utils';

type TrackFormValues = {
    quoteId: string;
};

export default function TrackQuotePage() {
    const t = useTranslations('trackPage');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{
        id?: string;
        insuranceType: string;
        premiumAmount: number;
        coverageAmount: number;
        createdAt: Date;
        status: string;
    } | null>(null);
    const [serverError, setServerError] = useState<string | null>(null);

    const trackSchema = useMemo(() => z.object({
        quoteId: z.string()
            .min(3, t('validation.tooShort'))
            .max(100, t('validation.tooLong'))
            .refine((val) => val.trim().length > 0, t('validation.required'))
    }), [t]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch
    } = useForm<TrackFormValues>({
        resolver: zodResolver(trackSchema),
        defaultValues: {
            quoteId: ''
        }
    });

    const quoteIdValue = watch('quoteId');

    const onSubmit = async (data: TrackFormValues) => {
        setIsLoading(true);
        setServerError(null);
        setResult(null);

        try {
            const res = await fetchQuoteStatus(data.quoteId.trim());
            if (res.error) {
                setServerError(res.error);
            } else if (res.quote) {
                setResult(res.quote as typeof result); // structurally identical shape
            } else {
                setServerError(t('errors.noRecordFound'));
            }
        } catch (err) {
            console.error(t('errors.requestFailedLog'), err);
            setServerError(t('errors.requestFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-theme-bg pt-32 pb-24 relative overflow-hidden">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-accent/10 to-transparent" />
            <div className="pointer-events-none absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-accent/20 opacity-50 mix-blend-screen blur-[120px]" />

            <div className="container px-4 mx-auto max-w-4xl relative z-10">
                <div className="text-center mb-16">
                    <AnimatedHeading
                        text={t('hero.title')}
                        as="h1"
                        className="text-4xl md:text-5xl lg:text-6xl font-black mb-6"
                    />
                    <p className="text-xl text-theme-secondary max-w-2xl mx-auto">
                        {t('hero.descriptionPrefix')} <GradientText>{t('hero.quoteIdHighlight')}</GradientText> {t('hero.descriptionSuffix')}
                    </p>
                </div>

                <motion.div
                    className="glass mt-8 p-8 md:p-12 rounded-3xl shadow-glow-sm relative border border-white/20 dark:border-white/10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto mb-4 items-start">
                        <FormField
                            error={errors.quoteId?.message}
                            className="flex-1"
                        >
                            <div className="relative group w-full">
                                <Search className={cn(
                                    'absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors',
                                    errors.quoteId ? 'text-red-400' : 'text-theme-secondary group-focus-within:text-accent'
                                )} />
                                <input
                                    {...register('quoteId')}
                                    type="text"
                                    placeholder={t('form.placeholder')}
                                    className={cn(inputClasses, 'pl-12 py-3.5 text-base font-medium')}
                                    aria-invalid={errors.quoteId ? 'true' : 'false'}
                                />
                            </div>
                        </FormField>

                        <Button
                            type="submit"
                            size="lg"
                            className="md:w-32 w-full shrink-0 !py-3.5"
                            glow
                            disabled={isLoading || !quoteIdValue.trim()}
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <span className="flex items-center justify-center gap-2 w-full">
                                    {t('form.locate')}
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </Button>
                    </form>

                    <AnimatePresence mode="wait">
                        {serverError && (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 max-w-2xl mx-auto"
                            >
                                <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5" />
                                <p className="font-medium">{serverError}</p>
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
                                <div className="flex items-center justify-between border-b border-theme-divider bg-gradient-to-r from-accent/5 to-transparent p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-success-500/20 text-success-500 rounded-xl">
                                            <CheckCircle2 className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-theme-secondary uppercase tracking-wider">{t('result.quoteVerified')}</h3>
                                            <p className="text-xl font-bold font-mono tracking-tight">{result.id || quoteIdValue}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-accent/10 text-accent">
                                            <Clock className="w-3.5 h-3.5" />
                                            {result.status === 'PROCESSING_DOCUMENT' ? t('result.generatingPdf') : result.status}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-8 relative">
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-sm text-theme-secondary mb-1">{t('result.insuranceType')}</p>
                                            <p className="text-xl font-bold">{result.insuranceType}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-theme-secondary mb-1">{t('result.basePremiumDue')}</p>
                                            <p className="text-3xl font-black text-success-500">
                                                ₹{result.premiumAmount?.toLocaleString('en-IN') || t('result.notAvailable')}
                                                <span className="text-sm font-normal text-theme-secondary"> {t('result.perMonth')}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-sm text-theme-secondary mb-1">{t('result.totalCoverageValue')}</p>
                                            <p className="text-xl font-bold tracking-tight">
                                                ₹{result.coverageAmount?.toLocaleString('en-IN') || t('result.notAvailable')}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-theme-secondary mb-1">{t('result.applicationDate')}</p>
                                            <p className="text-lg font-medium">{new Date(result.createdAt).toLocaleDateString(undefined, {
                                                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-theme-bg/50 border-t border-theme-divider flex flex-col sm:flex-row gap-4 items-center justify-between">
                                    <p className="text-sm text-theme-secondary flex-1">
                                        {t('result.bundleDescription')}
                                    </p>

                                    <Button
                                        variant="secondary"
                                        size="md"
                                        className="shrink-0 w-full sm:w-auto"
                                        disabled={result.status === 'PROCESSING_DOCUMENT'}
                                        onClick={() => window.open(`/api/quotes/${result.id || quoteIdValue}/pdf`, '_blank')}
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        {t('result.downloadPdf')}
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </main>
    );
}
