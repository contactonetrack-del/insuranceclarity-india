'use client'

import Link from 'next/link'
import { Sparkles, Search, BarChart3, FileText, ArrowRight } from 'lucide-react'
import { RevealOnScroll, Magnetic } from '@/components/premium'
import { Button } from '@/components/ui/Button'

export function CTASection() {
    return (
        <section className="py-20 px-6">
            <div className="max-w-4xl mx-auto">
                <RevealOnScroll direction="scale">
                    <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12),0_2px_8px_-2px_rgba(0,0,0,0.06)] dark:bg-slate-900 dark:border-slate-800">
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
                                Free - No Sign-up Required
                            </span>

                            <div className="flex justify-center gap-3 mb-8">
                                {[
                                    { icon: Search, color: 'from-slate-700 to-slate-900' },
                                    { icon: BarChart3, color: 'from-slate-500 to-slate-700' },
                                    { icon: FileText, color: 'from-slate-500 to-slate-700' },
                                ].map(({ icon: Icon, color }, index) => (
                                    <div
                                        key={index}
                                        className={`flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br ${color} shadow-md ${index === 0 ? 'scale-110 shadow-lg' : 'opacity-60'}`}
                                    >
                                        <Icon className="w-5 h-5 text-white" />
                                    </div>
                                ))}
                            </div>

                            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-slate-900 dark:text-white mb-4 leading-tight">
                                Ready to Understand<br className="hidden sm:block" /> Your Insurance?
                            </h2>

                            <p className="text-slate-500 dark:text-slate-400 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
                                Start with the Hidden Facts tool and discover what your policy really covers - the exclusions, sub-limits, and fine print.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link href="/tools/hidden-facts">
                                    <Magnetic strength={0.2} className="inline-block">
                                        <Button icon={Search} size="lg" glow>
                                            Explore Hidden Facts
                                        </Button>
                                    </Magnetic>
                                </Link>
                                <Link href="/tools/calculator">
                                    <Magnetic strength={0.2} className="inline-block">
                                        <Button variant="secondary" icon={ArrowRight} iconPosition="right" size="lg">
                                            Estimate Premium
                                        </Button>
                                    </Magnetic>
                                </Link>
                            </div>

                            <p className="mt-8 text-xs text-slate-400 font-medium">
                                Educational platform - No insurance sold - IRDAI compliant content
                            </p>
                        </div>
                    </div>
                </RevealOnScroll>
            </div>
        </section>
    )
}
