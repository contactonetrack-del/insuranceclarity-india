'use client'

import Link from 'next/link'
import { ArrowRight, AlertTriangle, Network, Lock, ShieldAlert, Cpu, Database, CloudOff, FileCode2, Scale } from 'lucide-react'
import {
    RevealOnScroll,
    StaggerContainer,
    StaggerItem,
    TiltCard,
    GlassCard,
    MagicButton,
    IconContainer,
    GradientText
} from '@/components/premium'

const typeIcons = {
    breach: Database,
    ransomware: Lock,
    liability: Scale,
    reputation: ShieldAlert,
    interruption: CloudOff,
}

const cyberInsuranceTypes = [
    {
        id: 'breach',
        title: 'Data Breach Response',
        description: 'Covers forensics, IT fixes, legal advice, and notifying affected customers.',
        premium: 'Based on revenue & data volume',
        color: 'from-teal-500 to-emerald-600',
    },
    {
        id: 'ransomware',
        title: 'Cyber Extortion & Ransomware',
        description: 'Covers negotiation experts and, where legally permissible, ransom payments.',
        premium: 'Varies by security posture',
        color: 'from-rose-500 to-red-600',
    },
    {
        id: 'liability',
        title: 'Network Security Liability',
        description: 'Third-party coverage if a breach of your systems affects client data.',
        premium: 'Based on industry risk',
        color: 'from-blue-500 to-indigo-600',
    },
    {
        id: 'interruption',
        title: 'System Failure Business Interruption',
        description: 'Replaces lost income when networks are taken offline due to a cyber-attack.',
        premium: 'Percentage of digital revenue',
        color: 'from-amber-500 to-orange-600',
    },
    {
        id: 'reputation',
        title: 'Cyber Reputational Harm',
        description: 'Public relations expenses to repair brand image post-breach.',
        premium: 'Add-on cover',
        color: 'from-purple-500 to-violet-600',
    },
]

const commonExclusions = [
    { icon: AlertTriangle, title: 'Prior Knowledge', desc: 'Breaches known before the policy began.' },
    { icon: FileCode2, title: 'Unpatched Systems', desc: 'Failure to install security updates for known vulnerabilities.' },
    { icon: Cpu, title: 'Hardware Upgrades', desc: 'Cost of upgrading IT infrastructure to prevent future attacks.' },
    { icon: AlertTriangle, title: 'State-Sponsored Actor', desc: 'Acts of cyber-warfare (though standard cyber-terrorism is usually covered).' },
    { icon: Database, title: 'Data Value', desc: 'Loss of intellectual property value (covers the response, not the IP value lost).' },
    { icon: Lock, title: 'Employee Negligence', desc: 'If explicit security protocols were blatantly bypassed by management.' },
]

export default function CyberInsurancePage() {
    return (
        <div className="min-h-screen pt-20">
            {/* Hero */}
            <section className="py-16 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <RevealOnScroll direction="down" delay={0.1}>
                        <div className="flex items-center gap-2 text-sm text-theme-secondary mb-8">
                            <Link href="/" className="hover:text-accent transition-colors">Home</Link>
                            <span>/</span>
                            <span className="text-theme-primary font-medium">Cyber Security Cover</span>
                        </div>
                    </RevealOnScroll>

                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="relative z-10">
                            <RevealOnScroll direction="up" delay={0.2}>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 
                                   text-sm rounded-full mb-6 font-medium">
                                    <Network className="w-4 h-4" />
                                    DIGITAL RISK COVER
                                </div>
                                <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-theme-primary leading-tight mb-6">
                                    Secure Your <GradientText className="from-teal-500 to-emerald-600">Digital Assets</GradientText>
                                </h1>
                                <p className="text-lg text-theme-secondary mb-8 max-w-xl">
                                    In an era of ransomware and data breaches, comprehensive cyber liability insurance is the final defense for your digital infrastructure and customer data.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <MagicButton variant="primary" className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700" icon={ArrowRight} iconPosition="right">
                                        Estimate Cyber Risk
                                    </MagicButton>
                                    <MagicButton variant="secondary" icon={ShieldAlert}>
                                        Read Breach Claim Cases
                                    </MagicButton>
                                </div>
                            </RevealOnScroll>
                        </div>

                        {/* Interactive Widget/Graphic area */}
                        <RevealOnScroll direction="left" delay={0.3} className="relative h-full min-h-[400px]">
                            <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/20 via-primary/5 to-transparent rounded-3xl -z-10" />
                            <GlassCard className="h-full flex flex-col justify-center relative overflow-hidden border-teal-500/20">
                                <IconContainer icon={Network} size="xl" className="absolute -right-12 -top-12 opacity-5 scale-[2] text-teal-500" />
                                <h3 className="text-xl font-bold text-theme-primary mb-6">The Anatomy of a Cyber Claim</h3>
                                <ul className="space-y-4">
                                    {[
                                        { step: '1', title: 'Incident Response', desc: 'IT Forensics instantly deploy to stop the bleeding.' },
                                        { step: '2', title: 'Legal & Notification', desc: 'Lawyers draft mandatory disclosure notices.' },
                                        { step: '3', title: 'Extortion Management', desc: 'Negotiators handle the ransomware demands.' },
                                        { step: '4', title: 'Recovery', desc: 'Payout for lost business income during downtime.' },
                                    ].map((item, i) => (
                                        <li key={i} className="flex gap-4">
                                            <div className="mt-1">
                                                <div className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center text-xs font-bold">
                                                    {item.step}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-semibold text-theme-primary">{item.title}</div>
                                                <div className="text-sm text-theme-secondary">{item.desc}</div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </GlassCard>
                        </RevealOnScroll>
                    </div>
                </div>
            </section>

            {/* Types of Coverage */}
            <section className="py-20 px-6 glass-subtle">
                <div className="max-w-7xl mx-auto">
                    <RevealOnScroll className="mb-12">
                        <h2 className="font-display font-bold text-3xl text-theme-primary mb-4">
                            Sectors of Cyber Coverage
                        </h2>
                        <p className="text-theme-secondary max-w-2xl">
                            A robust cyber policy bridges first-party losses and third-party liabilities.
                        </p>
                    </RevealOnScroll>

                    <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
                        {cyberInsuranceTypes.map((type) => {
                            const Icon = typeIcons[type.id as keyof typeof typeIcons] || Network
                            return (
                                <StaggerItem key={type.id}>
                                    <TiltCard>
                                        <GlassCard hover glowOnHover className="h-full group">
                                            <div className="flex flex-col h-full">
                                                <IconContainer
                                                    icon={Icon}
                                                    variant="gradient"
                                                    gradientFrom={`from-${type.color.split(' ')[0].replace('from-', '')}`}
                                                    gradientTo={`to-${type.color.split(' ')[1].replace('to-', '')}`}
                                                    className="mb-6 group-hover:scale-110 transition-transform duration-300"
                                                />
                                                <h3 className="text-xl font-bold text-theme-primary mb-3">
                                                    {type.title}
                                                </h3>
                                                <p className="text-theme-secondary text-sm flex-1 mb-6">
                                                    {type.description}
                                                </p>
                                                <div className="p-3 rounded-lg bg-hover/5 border border-default text-sm text-theme-primary font-medium">
                                                    Cost Factor: <span className="text-theme-secondary font-normal">{type.premium}</span>
                                                </div>
                                            </div>
                                        </GlassCard>
                                    </TiltCard>
                                </StaggerItem>
                            )
                        })}
                    </StaggerContainer>
                </div>
            </section>

            {/* General Exclusions */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <RevealOnScroll className="mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 text-rose-600 
                           text-sm rounded-full mb-4 font-medium">
                            <AlertTriangle className="w-4 h-4" />
                            CRITICAL EXCLUSIONS
                        </div>
                        <h2 className="font-display font-bold text-3xl text-theme-primary mb-4">
                            What Cyber Insurance Usually Doesn't Cover
                        </h2>
                        <p className="text-theme-secondary max-w-2xl">
                            Cyber policies require active security posture maintenance. Failure to patch known vulnerabilities is the #1 reason claims are denied.
                        </p>
                    </RevealOnScroll>

                    <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.05}>
                        {commonExclusions.map((exclusion, index) => (
                            <StaggerItem key={index}>
                                <GlassCard className="h-full border-rose-500/20 hover:border-rose-500/40 transition-colors">
                                    <div className="flex gap-4">
                                        <div className="p-2 rounded-lg bg-rose-500/10 h-fit">
                                            <exclusion.icon className="w-5 h-5 text-rose-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-theme-primary mb-1">{exclusion.title}</h3>
                                            <p className="text-sm text-theme-secondary">{exclusion.desc}</p>
                                        </div>
                                    </div>
                                </GlassCard>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </div>
            </section>
        </div>
    )
}
