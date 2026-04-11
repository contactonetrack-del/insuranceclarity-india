/**
 * GET /api/result/[id]
 *
 * Returns the policy analysis report for a given scanId.
 * Applies paywall gate — free users see partial results.
 *
 * Query params:
 *   ?status=true  →  return scan status only (for polling)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

import { logger } from '@/lib/logger';
import { getReport, getScanStatus } from '@/services/report.service';
import { canAccessScan, getClientIpFromHeaders } from '@/services/payment.service';
import { findResultAccessScan } from '@/services/ops.service';
import { verifyScanClaimToken } from '@/lib/security/scan-claim';

interface RouteParams {
    params: Promise<{ id: string }>;
}

function isPlausibleScanId(scanId: string): boolean {
    return /^c[a-z0-9]{20,}$/i.test(scanId);
}

function getRequestLocale(request: NextRequest): 'en' | 'hi' {
    const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value?.toLowerCase();
    if (cookieLocale === 'hi') return 'hi';
    if (cookieLocale === 'en') return 'en';

    const acceptLanguage = request.headers.get('accept-language')?.toLowerCase() ?? '';
    return acceptLanguage.includes('hi') ? 'hi' : 'en';
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: scanId } = await params;

        if (!scanId) {
            return NextResponse.json({ error: 'scanId is required.' }, { status: 400 });
        }

        if (!isPlausibleScanId(scanId)) {
            return NextResponse.json({ error: 'Scan not found.' }, { status: 404 });
        }

        // Get session to check access/payment status
        const session = await auth();
        const userId = (session?.user as { id?: string })?.id ?? null;
        const role = (session?.user as { role?: string } | undefined)?.role;
        const isAdmin = role === 'ADMIN';
        const requestIp = getClientIpFromHeaders(request.headers);
        const locale = getRequestLocale(request);

        const scanAccess = await findResultAccessScan(scanId);

        if (!scanAccess) {
            return NextResponse.json({ error: 'Scan not found.' }, { status: 404 });
        }

        // Validate anonymous claim token (primary ownership proof, beats IP matching)
        const claimToken = request.headers.get('x-claim-token');
        const claimTokenValid = !scanAccess.userId
            ? await verifyScanClaimToken(claimToken, scanId)
            : false;

        if (
            !canAccessScan({
                isAdmin,
                sessionUserId: userId,
                requestIp,
                ownerUserId: scanAccess.userId,
                ownerIp: scanAccess.ipAddress,
                claimTokenValid,
            })
        ) {
            logger.warn({
                action: 'result.access.denied',
                scanId,
                userId: userId ?? 'anonymous',
                requestIp: requestIp ?? 'unknown',
            });
            return NextResponse.json({ error: 'Scan not found.' }, { status: 404 });
        }

        // Status-only polling mode
        const isStatusOnly = request.nextUrl.searchParams.get('status') === 'true';
        if (isStatusOnly) {
            const statusData = await getScanStatus(scanId);
            if (!statusData) {
                return NextResponse.json({ error: 'Scan not found.' }, { status: 404 });
            }
            return NextResponse.json(statusData);
        }

        // Check if this user has paid for this scan
        const statusData = await getScanStatus(scanId);
        if (!statusData) {
            return NextResponse.json({ error: 'Scan not found.' }, { status: 404 });
        }

        if (statusData.status === 'PENDING' || statusData.status === 'PROCESSING') {
            return NextResponse.json(
                {
                    scanId,
                    status: statusData.status,
                    message: 'Your policy is being analyzed. Please check back in a moment.',
                },
                { status: 202 },
            );
        }

        if (statusData.status === 'FAILED') {
            return NextResponse.json(
                {
                    scanId,
                    status: 'FAILED',
                    error: 'Policy analysis failed. The document may be scanned/image-based or password-protected. Please try a different PDF.',
                },
                { status: 422 },
            );
        }

        // Deliver report with paywall
        const report = await getReport({
            scanId,
            isPaid: statusData.isPaid,
            locale,
        });

        if (!report) {
            return NextResponse.json({ error: 'Report not found.' }, { status: 404 });
        }

        logger.info({
            action: 'result.served',
            scanId,
            isPaid: statusData.isPaid,
            userId: userId ?? 'anonymous',
        });

        return NextResponse.json(report);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to retrieve report';
        logger.error({ action: 'result.error', error: message });

        return NextResponse.json({ error: message }, { status: 500 });
    }
}
