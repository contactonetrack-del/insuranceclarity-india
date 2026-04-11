'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ArrowRight, BarChart3 } from 'lucide-react'
import { RevealOnScroll, StaggerContainer, StaggerItem, GlassCard, IconContainer } from '@/components/premium'
import { tools } from '@/config/home-data'
import { resolveToneSurfaceClass } from '@/lib/theme/tone'

export function ToolsSection() {
    const t = useTranslations('home.toolsSection')

    return (
        <section className="py-20 px-6 glass-subtle">
            <div className="max-w-7xl mx-auto">
                <RevealOnScroll className="text-center mb-12">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 text-accent 
                       text-sm rounded-full mb-4 font-medium">
                        <BarChart3 className="w-4 h-4" />
                        {t('badge')}
                    </span>
                    <h2 className="font-display font-bold text-3xl md:text-4xl text-theme-primary">
                        {t('title')}
                    </h2>
                    <p className="text-theme-secondary mt-4 max-w-xl mx-auto">
                        {t('description')}
                    </p>
                </RevealOnScroll>

                <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6" staggerDelay={0.1}>
                    {tools.map((tool) => (
                        <StaggerItem key={tool.href}>
                            <Link href={tool.href} className="interactive-focus block h-full rounded-3xl">
                                <GlassCard
                                    hover
                                    glowOnHover
                                    padding="none"
                                    className="cursor-pointer group h-full overflow-hidden"
                                >
                                    <div className={`h-1.5 w-full ${resolveToneSurfaceClass(tool.tone, tool.surface)}`} />
                                    <div className={`pointer-events-none absolute top-0 right-0 h-full w-1/2 ${resolveToneSurfaceClass(tool.tone, 'soft')} opacity-35`} />

                                    <div className="relative p-6">
                                        <div className="flex gap-5">
                                            <div className="flex flex-col items-center gap-2">
                                                <IconContainer
                                                    icon={tool.icon}
                                                    size="xl"
                                                    variant="gradient"
                                                    tone={tool.tone}
                                                    surface={tool.surface}
                                                />
                                                <div className="text-center">
                                                    <div className="text-xl font-bold text-gradient leading-none">{tool.stat}</div>
                                                    <div className="text-[10px] text-theme-muted font-medium uppercase tracking-wide mt-0.5">{tool.statLabel}</div>
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-display font-semibold text-lg text-theme-primary 
                                                     group-hover:text-accent transition-colors duration-150">
                                                        {tool.title}
                                                    </h3>
                                                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold shadow-sm ${resolveToneSurfaceClass(tool.tone, tool.surface)}`}>
                                                        {tool.badge}
                                                    </span>
                                                </div>
                                                <p className="text-theme-secondary text-sm leading-relaxed mb-3">{tool.desc}</p>
                                                <span className="inline-flex items-center gap-1.5 text-accent text-sm font-medium 
                                                    opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                                                    {t('exploreAction')}
                                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>
                            </Link>
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </div>
        </section>
    )
}
