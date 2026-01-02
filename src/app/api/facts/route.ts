import { NextResponse } from 'next/server'
import { getAllFacts, type HiddenFact } from '@/data/hidden-facts'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category')
        const severity = searchParams.get('severity')
        const search = searchParams.get('search')

        let facts = getAllFacts()

        // Filter by category
        if (category && category !== 'all') {
            facts = facts.filter(f => f.category === category)
        }

        // Filter by severity
        if (severity) {
            facts = facts.filter(f => f.severity === severity)
        }

        // Filter by search term
        if (search) {
            const searchLower = search.toLowerCase()
            facts = facts.filter(f =>
                f.title.toLowerCase().includes(searchLower) ||
                f.description.toLowerCase().includes(searchLower) ||
                f.whatToCheck.toLowerCase().includes(searchLower) ||
                f.realCase.toLowerCase().includes(searchLower)
            )
        }

        // Get stats
        const allFacts = getAllFacts()
        const criticalCount = allFacts.filter(f => f.severity === 'critical').length
        const categories = Array.from(new Set(allFacts.map(f => f.category)))

        return NextResponse.json({
            facts,
            stats: {
                total: allFacts.length,
                critical: criticalCount,
                categories: categories.length,
                filtered: facts.length
            }
        })
    } catch (error) {
        console.error('Error fetching facts:', error)
        return NextResponse.json(
            { error: 'Failed to fetch facts' },
            { status: 500 }
        )
    }
}
