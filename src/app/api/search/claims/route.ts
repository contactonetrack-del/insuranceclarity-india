import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { getDbFallbackErrorMessage, isExpectedDbFallbackError } from '@/lib/prisma-fallback';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category') || 'All';

    try {
        const { prisma } = await import('@/lib/prisma');

        const where: Prisma.ClaimCaseWhereInput = {};

        if (category !== 'All') {
            where.category = category;
        }

        if (q) {
            where.OR = [
                { title: { contains: q, mode: 'insensitive' } },
                { issue: { contains: q, mode: 'insensitive' } },
                { details: { contains: q, mode: 'insensitive' } },
                { lesson: { contains: q, mode: 'insensitive' } },
            ];
        }

        const cases = await prisma.claimCase.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 20,
        });

        return NextResponse.json(cases);
    } catch (error) {
        const message = getDbFallbackErrorMessage(error);

        if (isExpectedDbFallbackError(error)) {
            if (process.env.NODE_ENV !== 'production') {
                logger.warn({
                    action: 'claim_search.api.db_query_skipped',
                    error: message,
                });
            }

            return NextResponse.json([], {
                headers: { 'x-data-source': 'fallback' },
            });
        }

        logger.error({
            action: 'claim_search.api.failed',
            error: message,
        });
        return NextResponse.json({ error: message || 'Internal Server Error' }, { status: 500 });
    }
}
