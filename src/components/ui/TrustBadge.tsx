'use client'

import { ShieldCheck, Info } from 'lucide-react'
import { GlassCard } from '@/components/premium'
import { cn } from '@/lib/utils'

interface TrustBadgeProps {
    source: string
    verifiedDate?: string
    isOfficial?: boolean
    className?: string
}

export default function TrustBadge({ source, verifiedDate, isOfficial = true, className }: TrustBadgeProps) {
    return (
        <div className={cn("inline-flex items-center gap-2 group cursor-help", className)}>
            <div className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border transition-all duration-300",
                isOfficial
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40"
                    : "bg-blue-500/10 text-blue-600 border-blue-500/20"
            )}>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="uppercase">{isOfficial ? 'Verified Source' : 'Citation'}</span>
            </div>

            <div className="text-xs text-muted-foreground flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                <span>{source}</span>
                {verifiedDate && (
                    <span className="text-muted-foreground/60">• {verifiedDate}</span>
                )}
            </div>
        </div>
    )
}
