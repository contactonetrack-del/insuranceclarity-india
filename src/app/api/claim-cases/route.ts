import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { getDbFallbackErrorMessage, isExpectedDbFallbackError } from '@/lib/prisma-fallback';
import { claimsService } from '@/services/claims.service';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const cases = await claimsService.listAllClaims();

        return NextResponse.json(cases);
    } catch (error) {
        const message = getDbFallbackErrorMessage(error);

        if (isExpectedDbFallbackError(error)) {
            if (process.env.NODE_ENV !== 'production') {
                logger.warn({
                    action: 'claim_cases.api.db_query_skipped',
                    error: message,
                });
            }

            return NextResponse.json([], {
                headers: { 'x-data-source': 'fallback' },
            });
        }

        logger.error({
            action: 'claim_cases.api.failed',
            error: message,
        });
        return NextResponse.json({ error: 'Failed to fetch claim cases' }, { status: 500 });
    }
}
