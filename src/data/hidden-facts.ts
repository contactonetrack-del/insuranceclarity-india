// Hidden facts data (same structure as existing data/hidden-facts.js)
// This will be seeded to PostgreSQL database

export interface HiddenFact {
    id: string
    category: string
    title: string
    severity: 'critical' | 'high' | 'medium' | 'low'
    description: string
    affectedPolicies: string[]
    whatToCheck: string
    realCase: string
    example?: string
}


export const severityLevels = {
    critical: { label: "Critical", color: "red", icon: "🚨" },
    high: { label: "High Risk", color: "amber", icon: "⚠️" },
    medium: { label: "Medium", color: "blue", icon: "ℹ️" },
    low: { label: "Low", color: "emerald", icon: "💡" }
}


export function getSeverityLabel(severity: string) {
    return severityLevels[severity as keyof typeof severityLevels] || { label: 'Unknown', color: 'gray', icon: '' }
}

export function getSeverityColor(severity: string) {
    const level = severityLevels[severity as keyof typeof severityLevels]
    switch (level?.color) {
        case 'red': return 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-500/30'
        case 'amber': return 'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-500/30'
        case 'blue': return 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-500/30'
        case 'emerald': return 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-500/30'
        default: return 'bg-gray-500/10 text-gray-600 border-gray-200'
    }
}
