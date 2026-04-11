import { ShieldCheck, Zap, Users, HeadphonesIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function TrustSignals() {
    const t = useTranslations('auditI18n.trustSignals')

    const features = [
        {
            icon: ShieldCheck,
            title: t('items.irdai.title'),
            description: t('items.irdai.description'),
        },
        {
            icon: Zap,
            title: t('items.instantQuotes.title'),
            description: t('items.instantQuotes.description'),
        },
        {
            icon: Users,
            title: t('items.unbiasedAdvice.title'),
            description: t('items.unbiasedAdvice.description'),
        },
        {
            icon: HeadphonesIcon,
            title: t('items.claimSupport.title'),
            description: t('items.claimSupport.description'),
        },
    ]

    return (
        <div className="my-16">
            <h3 className="text-2xl font-display font-bold text-theme-primary mb-8 text-center">
                {t('heading')}
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
