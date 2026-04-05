import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const cases = await prisma.claimCase.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
        
        return NextResponse.json(cases);
    } catch (error) {
        console.error('Error fetching claim cases:', error);
        return NextResponse.json({ error: 'Failed to fetch claim cases' }, { status: 500 });
    }
}
