import { ShieldCheck, Zap, Users, HeadphonesIcon } from 'lucide-react'

export default function TrustSignals() {
    const features = [
        {
            icon: ShieldCheck,
            title: "IRDAI Certified",
            description: "100% compliant with Indian regulatory standards for your safety."
        },
        {
            icon: Zap,
            title: "Instant Quotes",
            description: "Compare 50+ Top Insurers instantly with no hidden fees."
        },
        {
            icon: Users,
            title: "Unbiased Advice",
            description: "Our advisors work for you, not the insurance companies."
        },
        {
            icon: HeadphonesIcon,
            title: "Lifetime Claim Support",
            description: "Free assistance when you need it most—at the time of claim."
        }
    ]

    return (
        <div className="my-16">
            <h3 className="text-2xl font-display font-bold text-theme-primary mb-8 text-center">
                Why Thousands Trust InsuranceClarity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {features.map((feature, idx) => {
                    const Icon = feature.icon
                    return (
                        <div key={idx} className="flex gap-4 p-6 glass rounded-2xl border border-default hover:border-accent/30 transition-colors">
                            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 text-accent">
                                <Icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-theme-primary mb-1">{feature.title}</h4>
                                <p className="text-sm text-theme-secondary leading-relaxed">{feature.description}</p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
