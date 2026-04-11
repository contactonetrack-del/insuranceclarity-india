import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { getDbFallbackErrorMessage, isExpectedDbFallbackError } from '@/lib/prisma-fallback';
import { claimsService } from '@/services/claims.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category') || 'All';

    try {
        const cases = await claimsService.searchClaims({ query: q, category, limit: 20 });

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
