import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category')
        const severity = searchParams.get('severity')
        const search = searchParams.get('search')

        const where: any = {}

        if (category && category !== 'all') {
            where.category = category
        }

        if (severity) {
            where.severity = severity
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { whatToCheck: { contains: search, mode: 'insensitive' } },
                { realCase: { contains: search, mode: 'insensitive' } },
            ]
        }

        const facts = await prisma.hiddenFact.findMany({
            where,
            orderBy: [
                { severity: 'asc' },
                { createdAt: 'desc' }
            ]
        })

        // Get counts for stats
        const totalCount = await prisma.hiddenFact.count()
        const criticalCount = await prisma.hiddenFact.count({ where: { severity: 'critical' } })
        const categoryCount = await prisma.hiddenFact.groupBy({
            by: ['category'],
            _count: true
        })

        return NextResponse.json({
            facts,
            stats: {
                total: totalCount,
                critical: criticalCount,
                categories: categoryCount.length,
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
