'use client'

import { AlertCircle, ShieldAlert, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

export type DisclaimerType = 'general' | 'health' | 'life' | 'financial' | 'tool'

interface DisclaimerProps {
    type?: DisclaimerType
    className?: string
    compact?: boolean
}

const disclaimerContent: Record<DisclaimerType, { title: string, text: string }> = {
    general: {
        title: "General Disclaimer",
        text: "InsuranceClarity is an independent education platform and is not an insurance company, agent, or broker. We do not sell insurance products. All content is for informational purposes only and should not be considered legal or financial advice. Always verify details with the official policy wording from the insurer."
    },
    health: {
        title: "Medical & Health Insurance Disclaimer",
        text: "Health insurance premiums, benefits, and exclusions (like waiting periods) are subject to change by insurers and IRDAI regulations. Pre-existing diseases must be disclosed accurately to avoid claim rejection. We are not responsible for claim decisions made by insurance companies."
    },
    life: {
        title: "Life Insurance Disclaimer",
        text: "Life insurance returns for ULIPs and Endowment plans are subject to market risks. Past performance is not indicative of future returns. Mortality charges and other fees apply. Please read the sales brochure carefully before concluding a sale."
    },
    financial: {
        title: "Financial Accuracy Disclaimer",
        text: "Premium calculations are estimates based on public data and standard parameters. Actual premiums may vary based on age, location, medical history, and insurer-specific underwriting rules. Taxes (GST) are applicable as per government norms."
    },
    tool: {
        title: "Tool Usage Disclaimer",
        text: "This tool provides simplified estimates for educational purposes. It does not constitute a formal quote or offer. For precise premium amounts and coverage details, please visit the respective insurer's official website."
    }
}

export default function Disclaimer({ type = 'general', className, compact = false }: DisclaimerProps) {
    const content = disclaimerContent[type]

    return (
        <div className={cn(
            "rounded-xl border transition-all duration-300",
            compact
                ? "bg-theme-base/50 border-theme-border p-4"
                : "bg-theme-base border-theme-border/60 p-6 shadow-sm",
            className
        )}>
            <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                    {type === 'financial' || type === 'tool' ? (
                        <Info className="w-5 h-5 text-blue-500" />
                    ) : (
                        <ShieldAlert className="w-5 h-5 text-theme-muted" />
                    )}
                </div>
                <div>
                    {!compact && (
                        <h4 className="text-sm font-semibold text-theme-primary mb-1">
                            {content.title}
                        </h4>
                    )}
                    <p className={cn(
                        "text-theme-secondary/80 leading-relaxed",
                        compact ? "text-xs" : "text-sm"
                    )}>
                        {content.text}
                    </p>
                </div>
            </div>
        </div>
    )
}
