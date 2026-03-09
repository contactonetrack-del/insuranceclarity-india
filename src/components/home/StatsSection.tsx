'use client'

import { StaggerContainer, StaggerItem, IconContainer, AnimatedCounter } from '@/components/premium'
import { stats } from '@/config/home-data'

export function StatsSection() {
    return (
        <section className="py-16 glass-subtle">
            <div className="max-w-7xl mx-auto px-6">
                <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-6" staggerDelay={0.1}>
                    {stats.map((stat, i) => (
                        <StaggerItem key={i} className="text-center">
                            <div className="flex justify-center mb-3">
                                <IconContainer
                                    icon={stat.icon}
                                    size="md"
                                    variant="glass"
                                />
                            </div>
                            <div className="font-display font-extrabold text-4xl md:text-5xl text-gradient mb-1">
                                <AnimatedCounter
                                    value={stat.value}
                                    suffix={stat.suffix}
                                    duration={1.5}
                                />
                            </div>
                            <div className="text-theme-secondary">{stat.label}</div>
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </div>
        </section>
    )
}
