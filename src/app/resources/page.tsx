'use client'

import Link from 'next/link'
import { Download, FileText, BookOpen, Video, ExternalLink, HelpCircle, Phone, Scale, Search } from 'lucide-react'
import {
    RevealOnScroll,
    StaggerContainer,
    StaggerItem,
    TiltCard,
    GlassCard,
    MagicButton,
    AnimatedHeading
} from '@/components/premium'

const resources = [
    {
        category: 'Guides',
        items: [
            { title: 'How to Choose Term Insurance', icon: '📋', type: 'PDF Guide' },
            { title: 'Health Insurance Buying Checklist', icon: '✅', type: 'PDF Guide' },
            { title: 'Motor Insurance Claims Process', icon: '🚗', type: 'PDF Guide' },
        ],
    },
    {
        category: 'Calculators',
        items: [
            { title: 'Life Insurance Need Calculator', icon: '🧮', type: 'Tool' },
            { title: 'Health Insurance Premium Estimator', icon: '🏥', type: 'Tool' },
            { title: 'Car IDV Calculator', icon: '🚙', type: 'Tool' },
        ],
    },
    {
        category: 'IRDAI Resources',
        items: [
            { title: 'IRDAI Claim Settlement Ratio Report', icon: '📊', type: 'External' },
            { title: 'Insurance Ombudsman Contacts', icon: '📞', type: 'External' },
            { title: 'Grievance Redressal Portal', icon: '🏛️', type: 'External' },
        ],
    },
]

const faqs = [
    { q: 'What is Claim Settlement Ratio?', a: 'CSR is the percentage of claims paid vs claims received. Higher is better.' },
    { q: 'What is IDV in motor insurance?', a: 'Insured Declared Value is the maximum amount you get in case of total loss or theft.' },
    { q: 'Can I have multiple health insurance policies?', a: 'Yes, you can claim from multiple policies for a single hospitalization.' },
    { q: 'What is the free look period?', a: '15-30 days during which you can return a policy for full refund if not satisfied.' },
]

export default function ResourcesPage() {
    return (
        <div className="min-h-screen pt-20">
            <section className="py-16 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 to-transparent -z-10"></div>
                <div className="max-w-4xl mx-auto text-center">
                    <RevealOnScroll direction="down">
                        <span className="inline-block px-4 py-1.5 bg-primary-500/10 text-primary-500 text-sm font-semibold rounded-full mb-6">
                            📚 KNOWLEDGE HUB
                        </span>
                    </RevealOnScroll>

                    <RevealOnScroll direction="up" delay={0.1}>
                        <h1 className="font-display font-bold text-4xl md:text-5xl text-theme-primary mb-6">
                            <AnimatedHeading text="Insurance Resources" />
                        </h1>
                    </RevealOnScroll>

                    <RevealOnScroll direction="up" delay={0.2}>
                        <p className="text-theme-secondary text-lg max-w-2xl mx-auto leading-relaxed">
                            Guides, calculators, and official resources to help you make informed decisions.
                        </p>
                    </RevealOnScroll>
                </div>
            </section>

            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    {resources.map((section, idx) => (
                        <div key={section.category} className="mb-12">
                            <RevealOnScroll>
                                <h2 className="font-display font-bold text-2xl text-theme-primary mb-6 flex items-center gap-2">
                                    <span className="w-8 h-1 bg-gradient-accent rounded-full"></span>
                                    {section.category}
                                </h2>
                            </RevealOnScroll>

                            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6" staggerDelay={0.1}>
                                {section.items.map((item, i) => (
                                    <StaggerItem key={i}>
                                        <TiltCard>
                                            <GlassCard hover className="group cursor-pointer h-full relative overflow-hidden" padding="md">
                                                <div className="absolute top-0 right-0 p-4 opacity-50">
                                                    <Download className="w-5 h-5 text-theme-muted group-hover:text-accent transition-colors" />
                                                </div>
                                                <span className="text-4xl block mb-4 filter drop-shadow-sm">{item.icon}</span>
                                                <h3 className="font-display font-semibold text-lg text-theme-primary group-hover:text-accent transition-colors mb-2">
                                                    {item.title}
                                                </h3>
                                                <span className="inline-flex items-center gap-1.5 text-theme-secondary text-sm font-medium bg-accent/5 px-2 py-1 rounded-md">
                                                    <FileText className="w-3 h-3" /> {item.type}
                                                </span>
                                            </GlassCard>
                                        </TiltCard>
                                    </StaggerItem>
                                ))}
                            </StaggerContainer>
                        </div>
                    ))}
                </div>
            </section>

            <section className="py-16 px-6 glass-subtle">
                <div className="max-w-4xl mx-auto">
                    <RevealOnScroll>
                        <h2 className="font-display font-bold text-2xl text-theme-primary mb-8 flex items-center gap-3">
                            <HelpCircle className="w-7 h-7 text-accent" /> Frequently Asked Questions
                        </h2>
                    </RevealOnScroll>

                    <StaggerContainer className="space-y-4" staggerDelay={0.1}>
                        {faqs.map((faq, i) => (
                            <StaggerItem key={i}>
                                <GlassCard className="hover:border-accent/30 transition-colors" padding="md">
                                    <h3 className="font-bold text-theme-primary mb-2 flex items-start gap-3">
                                        <span className="text-accent text-lg">Q.</span> {faq.q}
                                    </h3>
                                    <p className="text-theme-secondary text-sm leading-relaxed pl-7">
                                        {faq.a}
                                    </p>
                                </GlassCard>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </div>
            </section>

            <section className="py-16 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <RevealOnScroll>
                        <div className="glass p-8 rounded-3xl border border-accent/20">
                            <h2 className="font-display font-bold text-2xl text-theme-primary mb-4">Have More Questions?</h2>
                            <p className="text-theme-secondary mb-8 max-w-2xl mx-auto">
                                Contact IRDAI for grievances or the Insurance Ombudsman for dispute resolution.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <a href="https://igms.irda.gov.in" target="_blank">
                                    <MagicButton variant="secondary" icon={ExternalLink}>
                                        IRDAI Grievance Portal
                                    </MagicButton>
                                </a>
                                <Link href="/tools/hidden-facts">
                                    <MagicButton icon={Search} glow>
                                        View Hidden Facts
                                    </MagicButton>
                                </Link>
                            </div>
                        </div>
                    </RevealOnScroll>
                </div>
            </section>
        </div>
    )
}
