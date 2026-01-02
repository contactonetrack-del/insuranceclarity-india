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

export const hiddenFactsData: Record<string, { category: string; facts: Omit<HiddenFact, 'category'>[] }> = {
    life: {
        category: "Life Insurance",
        facts: [
            {
                id: "life-1",
                title: "Suicide Clause",
                severity: "critical",
                description: "Most policies don't pay if death occurs by suicide within the first 1-2 years.",
                affectedPolicies: ["Term Life", "Whole Life", "ULIPs", "Endowment"],
                whatToCheck: "Look for 'Suicide Exclusion' in the policy document",
                realCase: "A 2019 case where claim was rejected for suicide in month 14, but paid after appeal."
            },
            {
                id: "life-2",
                title: "Material Non-Disclosure",
                severity: "critical",
                description: "Not revealing pre-existing conditions, smoking or drinking habits can void the entire policy.",
                affectedPolicies: ["All Life Insurance"],
                whatToCheck: "Answer ALL health questions truthfully in the proposal form",
                realCase: "Claim rejected: Policyholder hid diabetes history. Family received ZERO."
            },
            // Add more facts as needed...
        ]
    },
    health: {
        category: "Health Insurance",
        facts: [
            {
                id: "health-1",
                title: "Pre-existing Disease Waiting Period",
                severity: "critical",
                description: "Diseases you have BEFORE buying policy are not covered for 2-4 years.",
                affectedPolicies: ["All Health Insurance"],
                whatToCheck: "Check 'Pre-existing Disease Clause' and waiting period duration",
                realCase: "Diabetic patient's dialysis claim rejected - diabetes was pre-existing, 4-year wait applied."
            },
            {
                id: "health-2",
                title: "Room Rent Capping",
                severity: "high",
                description: "If you take a room more expensive than your limit, ALL expenses are reduced proportionally.",
                affectedPolicies: ["Individual Health", "Family Floater"],
                whatToCheck: "Check 'Room Rent Sub-limit' - aim for 'No Sub-limit' policies",
                realCase: "₹5L policy, took ₹8K room (limit ₹4K). ₹3L bill paid only ₹1.5L."
            },
        ]
    },
    motor: {
        category: "Motor Insurance",
        facts: [
            {
                id: "motor-1",
                title: "Valid Driving License",
                severity: "critical",
                description: "If driver doesn't have valid license for vehicle type, claim is rejected entirely.",
                affectedPolicies: ["All Motor Insurance"],
                whatToCheck: "Ensure all family members driving have valid license for vehicle category",
                realCase: "Son driving with learner's license. Accident claim rejected entirely."
            },
        ]
    },
    travel: {
        category: "Travel Insurance",
        facts: [
            {
                id: "travel-1",
                title: "Adventure Sports Exclusion",
                severity: "high",
                description: "Injuries during adventure activities are NOT covered unless you buy add-on.",
                affectedPolicies: ["All Travel Insurance"],
                whatToCheck: "If planning adventure activities, buy 'Adventure Sports Cover' add-on",
                realCase: "Skiing injury in Switzerland cost €15,000. Claim rejected."
            },
        ]
    },
    home: {
        category: "Home Insurance",
        facts: [
            {
                id: "home-1",
                title: "Underinsurance Penalty",
                severity: "critical",
                description: "If you insure house for less than actual value, payout is proportionally reduced.",
                affectedPolicies: ["Building Insurance"],
                whatToCheck: "Ensure sum insured reflects replacement cost, not market value",
                realCase: "₹50L house insured for ₹30L. ₹10L damage claim paid only ₹6L."
            },
        ]
    },
    business: {
        category: "Business Insurance",
        facts: [
            {
                id: "business-1",
                title: "Professional Indemnity Waiting Period",
                severity: "high",
                description: "PI insurance often has 'claims made' basis - only claims made during policy period are covered.",
                affectedPolicies: ["Professional Indemnity", "E&O Insurance"],
                whatToCheck: "Understand 'Claims Made vs Occurrence' basis. Maintain continuous coverage.",
                realCase: "Consultant's error in 2024, client sued in 2026. Policy lapsed. No coverage."
            },
        ]
    },
    specialized: {
        category: "Specialized Insurance",
        facts: [
            {
                id: "spec-1",
                title: "Pet Insurance Age Limits",
                severity: "high",
                description: "Most pet insurance policies won't cover dogs/cats above 8 years.",
                affectedPolicies: ["Pet Insurance"],
                whatToCheck: "Check entry age limit and renewal age limit separately",
                realCase: "10-year-old Labrador needed surgery. Policy had expired at age 8."
            },
        ]
    },
    personalAccident: {
        category: "Personal Accident",
        facts: [
            {
                id: "pa-1",
                title: "Self-Inflicted Injury Exclusion",
                severity: "critical",
                description: "All PA policies exclude self-inflicted injuries. Suicide is never covered.",
                affectedPolicies: ["Personal Accident Insurance"],
                whatToCheck: "Self-harm exclusion applies regardless of mental state",
                realCase: "Death ruled self-inflicted. PA claim rejected entirely."
            },
        ]
    }
}

export const severityLevels = {
    critical: { label: "Critical", color: "red", icon: "🚨" },
    high: { label: "High Risk", color: "amber", icon: "⚠️" },
    medium: { label: "Medium", color: "blue", icon: "ℹ️" },
    low: { label: "Low", color: "emerald", icon: "💡" }
}

export function getAllFacts(): HiddenFact[] {
    const allFacts: HiddenFact[] = []

    for (const [key, categoryData] of Object.entries(hiddenFactsData)) {
        for (const fact of categoryData.facts) {
            allFacts.push({
                ...fact,
                category: key
            })
        }
    }

    return allFacts
}

export function getFactsByCategory(category: string): HiddenFact[] {
    const categoryData = hiddenFactsData[category]
    if (!categoryData) return []

    return categoryData.facts.map(fact => ({
        ...fact,
        category
    }))
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
