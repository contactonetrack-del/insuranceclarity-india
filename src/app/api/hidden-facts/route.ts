import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const facts = await prisma.hiddenFact.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
        
        return NextResponse.json(facts);
    } catch (error) {
        console.error('Error fetching hidden facts:', error);
        return NextResponse.json({ error: 'Failed to fetch hidden facts' }, { status: 500 });
    }
}
