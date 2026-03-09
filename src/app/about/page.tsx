import type { Metadata } from 'next'
import Link from 'next/link'
import { Shield, Eye, Heart, TrendingUp } from 'lucide-react'

export const metadata: Metadata = {
    title: 'About InsuranceClarity India — Our Mission & Story',
    description: 'InsuranceClarity India is an independent, non-commission insurance education platform. We reveal hidden policy terms and help Indian buyers make informed decisions.',
    alternates: { canonical: '/about' },
    openGraph: {
        title: 'About InsuranceClarity India',
        description: 'Our mission: Make insurance transparent for every Indian. Non-commercial, IRDAI-aware education platform.',
        url: 'https://insuranceclarity.in/about',
    },
}

const values = [
    {
        icon: Eye,
        title: 'Radical Transparency',
        description: 'We expose what insurance companies hide — exclusions, sub-limits, waiting periods, and conditions that affect claims.',
        color: 'from-blue-500 to-indigo-600',
    },
    {
        icon: Shield,
        title: 'Zero Commission Bias',
        description: 'We do not receive commissions from insurers. Our analysis is purely data-driven and consumer-focused.',
        color: 'from-emerald-500 to-teal-600',
    },
    {
        icon: Heart,
        title: 'Consumer First',
        description: 'Our loyalty is to policyholders, not insurers. We advocate for fair treatment and informed choices.',
        color: 'from-rose-500 to-pink-600',
    },
    {
        icon: TrendingUp,
        title: 'Data-Driven',
        description: 'All claims data and CSR figures are sourced from official IRDAI annual reports. We cite our sources.',
        color: 'from-amber-500 to-orange-600',
    },
]

const stats = [
    { value: '500+', label: 'Insurance policies analyzed' },
    { value: '19', label: 'Insurance types covered' },
    { value: '100%', label: 'Independent — zero advertiser pressure' },
    { value: '∞', label: 'Free to use, always' },
]

export default function AboutPage() {
    return (
        <div className="min-h-screen pt-20">
            {/* Hero */}
            <section className="py-16 px-6 text-center">
                <div className="max-w-3xl mx-auto">
                    <span className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full 
                                     text-accent text-sm font-medium mb-6">
                        <Shield className="w-4 h-4" aria-hidden="true" />
                        India&apos;s Most Transparent Insurance Platform
                    </span>
                    <h1 className="font-display font-bold text-4xl md:text-5xl text-theme-primary mb-6">
                        About{' '}
                        <span className="text-gradient">InsuranceClarity</span>
                    </h1>
                    <p className="text-theme-secondary text-lg leading-relaxed max-w-2xl mx-auto">
                        We&apos;re an independent educational platform with a simple mission:
                        <strong className="text-theme-primary"> make insurance understandable for every Indian</strong>.
                        No sales, no commissions, no jargon — just the truth about your policies.
                    </p>
                </div>
            </section>

            {/* Mission statement */}
            <section className="py-12 px-6" aria-label="Our mission">
                <div className="max-w-4xl mx-auto">
                    <div className="glass rounded-3xl p-8 md:p-12 border border-accent/20">
                        <h2 className="font-display font-bold text-2xl md:text-3xl text-theme-primary mb-6 text-center">
                            Why We Built This
                        </h2>
                        <div className="space-y-4 text-theme-secondary leading-relaxed">
                            <p>
                                Insurance in India is complex by design. Policies run dozens of pages.
                                Exclusions are buried in footnotes. Premiums are pushed by commission-driven agents.
                                And millions of Indians discover the gaps in their coverage only at claim time —
                                when it&apos;s too late.
                            </p>
                            <p>
                                InsuranceClarity was born from frustration with this opacity. We believed there
                                should be a platform that tells you <em>what insurance companies don&apos;t want you to know</em> —
                                before you sign anything. So we built one.
                            </p>
                            <p>
                                We decode policy documents, surface hidden exclusions, track real claim outcomes,
                                and provide tools that help you compare policies on dimensions that actually matter for claims.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-16 px-6 bg-theme-secondary" aria-labelledby="values-heading">
                <div className="max-w-5xl mx-auto">
                    <h2 id="values-heading"
                        className="font-display font-bold text-3xl text-theme-primary text-center mb-12">
                        Our <span className="text-gradient">Core Values</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {values.map((value) => (
                            <div key={value.title}
                                className="glass rounded-2xl p-6 border border-default 
                                           hover:border-hover transition-all duration-300 hover:shadow-lg">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${value.color}
                                                 flex items-center justify-center mb-4`}>
                                    <value.icon className="w-6 h-6 text-white" aria-hidden="true" />
                                </div>
                                <h3 className="font-display font-bold text-lg text-theme-primary mb-2">
                                    {value.title}
                                </h3>
                                <p className="text-theme-secondary text-sm leading-relaxed">
                                    {value.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 px-6" aria-label="Platform statistics">
                <div className="max-w-5xl mx-auto">
                    <h2 className="font-display font-bold text-3xl text-theme-primary text-center mb-12">
                        The <span className="text-gradient">Numbers</span>
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {stats.map((stat) => (
                            <div key={stat.label}
                                className="glass rounded-2xl p-6 border border-default text-center
                                           hover:border-hover transition-all duration-300">
                                <p className="font-display font-bold text-3xl text-accent mb-2">
                                    {stat.value}
                                </p>
                                <p className="text-theme-muted text-sm leading-relaxed">
                                    {stat.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Important disclaimer */}
            <section className="py-8 px-6 bg-theme-secondary" aria-labelledby="disclaimer-heading">
                <div className="max-w-3xl mx-auto">
                    <div className="glass rounded-2xl p-6 border border-amber-500/20 bg-amber-500/5">
                        <h2 id="disclaimer-heading" className="font-bold text-theme-primary mb-3 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-amber-500" aria-hidden="true" />
                            Legal Disclaimer
                        </h2>
                        <p className="text-theme-secondary text-sm leading-relaxed">
                            InsuranceClarity India is an <strong>educational content platform</strong> and is
                            <strong> not an IRDAI-licensed insurance intermediary, broker, or agent</strong>.
                            We do not sell, solicit, or negotiate insurance products. All content is for
                            informational purposes only. Insurance is subject to IRDAI regulations.
                            Please read all policy documents carefully and consult a licensed advisor before purchasing.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-6 text-center">
                <div className="max-w-xl mx-auto">
                    <h2 className="font-display font-bold text-2xl text-theme-primary mb-4">
                        Ready to take control of your insurance?
                    </h2>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/tools/hidden-facts"
                            className="px-6 py-3 rounded-xl font-semibold bg-accent text-white
                                       hover:bg-accent/90 transition-all duration-200 hover:scale-[1.02]">
                            Reveal Hidden Facts
                        </Link>
                        <Link href="/contact"
                            className="px-6 py-3 rounded-xl font-semibold glass border border-default
                                       text-theme-primary hover:border-hover transition-all duration-200 hover:scale-[1.02]">
                            Get in Touch
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}
