'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Sparkles, Search, BarChart3, FileText, ArrowRight } from 'lucide-react'
import { RevealOnScroll, Magnetic } from '@/components/premium'
import { resolveToneSurfaceClass } from '@/lib/theme/tone'

export function CTASection() {
    const t = useTranslations('home.ctaSection')

    return (
        <section className="py-20 px-6">
            <div className="max-w-4xl mx-auto">
                <RevealOnScroll direction="scale">
                    <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-lg dark:bg-slate-900 dark:border-slate-800">
                        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full border border-slate-100 dark:border-slate-800 pointer-events-none" />
                        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full border border-slate-100 dark:border-slate-800 pointer-events-none" />

                        <div className="absolute bottom-6 left-8 grid grid-cols-4 gap-2 pointer-events-none opacity-30">
                            {Array.from({ length: 16 }).map((_, index) => (
                                <div key={index} className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                            ))}
                        </div>

                        <div className="relative z-10 px-8 py-14 text-center">
                            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-500 text-xs font-semibold tracking-widest uppercase mb-8">
                                <Sparkles className="w-3.5 h-3.5 text-accent" />
                                {t('badge')}
                            </span>

                            <div className="flex justify-center gap-3 mb-8">
                                {[
                                    { icon: Search, toneClass: resolveToneSurfaceClass('brand', 'gradient') },
                                    { icon: BarChart3, toneClass: resolveToneSurfaceClass('neutral', 'gradient') },
                                    { icon: FileText, toneClass: resolveToneSurfaceClass('neutral', 'gradient') },
                                ].map(({ icon: Icon, toneClass }, index) => (
                                    <div
                                        key={index}
                                        className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${toneClass} shadow-md ${index === 0 ? 'scale-110 shadow-lg' : 'opacity-60'}`}
                                    >
                                        <Icon className="w-5 h-5 text-white" />
                                    </div>
                                ))}
                            </div>

                            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-slate-900 dark:text-white mb-4 leading-tight">
                                {t('titleLine1')}
                                <br className="hidden sm:block" /> {t('titleLine2')}
                            </h2>

                            <p className="text-slate-500 dark:text-slate-400 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
                                {t('description')}
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Magnetic strength={0.2} className="inline-block">
                                    <Link
                                        href="/tools/hidden-facts"
                                        className="interactive-focus tone-brand-gradient inline-flex items-center justify-center gap-3 rounded-2xl border px-7 py-3.5 text-base font-semibold text-white shadow-[0_18px_40px_rgba(var(--token-accent-rgb),0.22)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(var(--token-accent-rgb),0.28)]"
                                    >
                                        <Search className="h-5 w-5" strokeWidth={2} />
                                        <span>{t('actions.exploreHiddenFacts')}</span>
                                    </Link>
                                </Magnetic>
                                <Magnetic strength={0.2} className="inline-block">
                                    <Link
                                        href="/tools/calculator"
                                        className="interactive-focus tone-neutral-soft inline-flex items-center justify-center gap-3 rounded-2xl border px-7 py-3.5 text-base font-semibold text-theme-primary shadow-md transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-lg"
                                    >
                                        <span>{t('actions.estimatePremium')}</span>
                                        <ArrowRight className="h-5 w-5" strokeWidth={2} />
                                    </Link>
                                </Magnetic>
                            </div>

                            <p className="mt-8 text-xs text-slate-400 font-medium">
                                {t('footnote')}
                            </p>
                        </div>
                    </div>
                </RevealOnScroll>
            </div>
        </section>
    )
}
