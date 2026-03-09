'use client'

import Link from 'next/link'
import { ArrowRight, Shield, Briefcase } from 'lucide-react'
import { RevealOnScroll, StaggerContainer, StaggerItem, TiltCard, GlassCard, IconContainer } from '@/components/premium'
import { insuranceCategories, businessCategories } from '@/config/home-data'

export function CategoriesSection() {
    return (
        <>
            {/* Insurance Categories */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <RevealOnScroll className="text-center mb-12">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent-10 text-accent 
                           text-sm rounded-full mb-4 font-medium">
                            <Shield className="w-4 h-4" />
                            BROWSE INSURANCE
                        </span>
                        <h2 className="font-display font-bold text-3xl md:text-4xl text-theme-primary">
                            Explore Insurance Types
                        </h2>
                        <p className="text-theme-secondary mt-4 max-w-xl mx-auto">
                            Comprehensive guides for every insurance category with hidden facts and real claim cases.
                        </p>
                    </RevealOnScroll>

                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.08}>
                        {insuranceCategories.map((cat) => (
                            <StaggerItem key={cat.href} className="h-full">
                                <Link href={cat.href} className="block h-full">
                                    <TiltCard containerClassName="h-full" className="h-full">
                                        <GlassCard
                                            hover
                                            glowOnHover
                                            className="cursor-pointer group h-full min-h-[100px]"
                                        >
                                            <div className="flex items-start gap-4">
                                                <IconContainer
                                                    icon={cat.icon}
                                                    size="lg"
                                                    variant="gradient"
                                                    gradientFrom={`from-${cat.color.split(' ')[0].replace('from-', '')}`}
                                                    gradientTo={`to-${cat.color.split(' ')[1].replace('to-', '')}`}
                                                />
                                                <div className="flex-1">
                                                    <h3 className="font-display font-semibold text-lg text-theme-primary mb-1 
                                                     group-hover:text-accent transition-colors duration-150">
                                                        {cat.title}
                                                    </h3>
                                                    <p className="text-theme-secondary text-sm">{cat.desc}</p>
                                                </div>
                                                <ArrowRight className="w-5 h-5 text-theme-muted opacity-0 group-hover:opacity-100 
                                                    group-hover:translate-x-1 transition-all duration-200" />
                                            </div>
                                        </GlassCard>
                                    </TiltCard>
                                </Link>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </div>
            </section>

            {/* Business & Emerging Insurance Categories */}
            <section className="pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <RevealOnScroll className="text-center mb-12">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent-10 text-accent 
                           text-sm rounded-full mb-4 font-medium">
                            <Briefcase className="w-4 h-4" />
                            COMMERCIAL & EMERGING
                        </span>
                        <h2 className="font-display font-bold text-3xl md:text-4xl text-theme-primary">
                            Business & Advanced Insurance
                        </h2>
                        <p className="text-theme-secondary mt-4 max-w-xl mx-auto">
                            Protect your enterprise with comprehensive coverage for modern risks, liabilities, and emerging technologies.
                        </p>
                    </RevealOnScroll>

                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center" staggerDelay={0.08}>
                        {businessCategories.map((cat) => (
                            <StaggerItem key={cat.href} className="h-full">
                                <Link href={cat.href} className="block h-full">
                                    <TiltCard containerClassName="h-full" className="h-full">
                                        <GlassCard
                                            hover
                                            glowOnHover
                                            className="cursor-pointer group h-full min-h-[100px]"
                                        >
                                            <div className="flex items-start gap-4">
                                                <IconContainer
                                                    icon={cat.icon}
                                                    size="lg"
                                                    variant="gradient"
                                                    gradientFrom={`from-${cat.color.split(' ')[0].replace('from-', '')}`}
                                                    gradientTo={`to-${cat.color.split(' ')[1].replace('to-', '')}`}
                                                />
                                                <div className="flex-1">
                                                    <h3 className="font-display font-semibold text-lg text-theme-primary mb-1 
                                                     group-hover:text-accent transition-colors duration-150">
                                                        {cat.title}
                                                    </h3>
                                                    <p className="text-theme-secondary text-sm">{cat.desc}</p>
                                                </div>
                                                <ArrowRight className="w-5 h-5 text-theme-muted opacity-0 group-hover:opacity-100 
                                                    group-hover:translate-x-1 transition-all duration-200" />
                                            </div>
                                        </GlassCard>
                                    </TiltCard>
                                </Link>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </div>
            </section>
        </>
    )
}
