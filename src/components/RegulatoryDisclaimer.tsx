'use client'

import { AlertTriangle } from 'lucide-react'

interface RegulatoryDisclaimerProps {
    variant?: 'compact' | 'prominent'
    className?: string
}

/**
 * Regulatory disclaimer component for IRDAI compliance.
 * Use 'prominent' variant on tool pages, 'compact' in footer.
 */
export default function RegulatoryDisclaimer({
    variant = 'compact',
    className = ''
}: RegulatoryDisclaimerProps) {
    const disclaimerText = `InsuranceClarity is an educational platform providing general information about insurance products. 
We are NOT an IRDAI-licensed insurance intermediary, agent, or broker. 
We do not sell, solicit, or advise on insurance policies. 
All information is for educational purposes only. Please verify policy terms directly with insurers before making decisions.`

    if (variant === 'prominent') {
        return (
            <div className={`rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 ${className}`}>
                <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-700 dark:text-amber-300 space-y-2">
                        <p className="font-medium">Important Regulatory Notice</p>
                        <p className="opacity-90 leading-relaxed">
                            {disclaimerText}
                        </p>
                        <div className="pt-2 border-t border-amber-500/20 text-xs opacity-80">
                            <p><strong>We do NOT:</strong> Advise on which policy to buy • Rank policies • Solicit applications • Earn commissions from insurers</p>
                            <p className="mt-1">
                                <strong>IRDAI Complaints:</strong>{' '}
                                <a href="https://www.irdai.gov.in" target="_blank" className="underline">irdai.gov.in</a> |
                                complaints@irdai.gov.in | 1800-425-4477
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Compact variant for footer
    return (
        <p className={`text-xs text-theme-muted leading-relaxed ${className}`}>
            <strong>Disclaimer:</strong> InsuranceClarity is an educational platform, not an IRDAI-licensed intermediary.
            We do not sell or solicit insurance. Verify all policy details with insurers.
        </p>
    )
}
