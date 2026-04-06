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
import { prisma } from '@/lib/prisma';
import { redisClient } from '@/lib/cache/redis';
import { getReport, getScanStatus } from '@/services/report.service';

interface RouteParams {
    params: Promise<{ id: string }>;
}

function getClientIp(request: NextRequest): string | null {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        const first = forwarded.split(',')[0]?.trim();
        if (first) return first;
    }

    const realIp = request.headers.get('x-real-ip')?.trim();
    return realIp || null;
}

function getRequestLocale(request: NextRequest): 'en' | 'hi' {
    const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value?.toLowerCase();
    if (cookieLocale === 'hi') return 'hi';
    if (cookieLocale === 'en') return 'en';

    const acceptLanguage = request.headers.get('accept-language')?.toLowerCase() ?? '';
    return acceptLanguage.includes('hi') ? 'hi' : 'en';
}

function canAccessScan(params: {
    isAdmin: boolean;
    sessionUserId: string | null;
    requestIp: string | null;
    ownerUserId: string | null;
    ownerIp: string | null;
    claimTokenValid: boolean;
}): boolean {
    if (params.isAdmin) return true;

    if (params.ownerUserId) {
        return params.sessionUserId === params.ownerUserId;
    }

    // Primary: signed claim token (not susceptible to CGNAT/proxy IP spoofing)
    if (params.claimTokenValid) return true;

    // Legacy fallback is explicitly development-only for pre-token scans.
    if (process.env.NODE_ENV !== 'production') {
        return Boolean(params.requestIp && params.ownerIp && params.requestIp === params.ownerIp);
    }

    return false;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: scanId } = await params;

        if (!scanId) {
            return NextResponse.json({ error: 'scanId is required.' }, { status: 400 });
        }

        // Get session to check access/payment status
        const session = await auth();
        const userId = (session?.user as { id?: string })?.id ?? null;
        const role = (session?.user as { role?: string } | undefined)?.role;
        const isAdmin = role === 'ADMIN';
        const requestIp = getClientIp(request);
        const locale = getRequestLocale(request);

        const scanAccess = await prisma.scan.findUnique({
            where: { id: scanId },
            select: { userId: true, ipAddress: true },
        });

        if (!scanAccess) {
            return NextResponse.json({ error: 'Scan not found.' }, { status: 404 });
        }

        // Validate anonymous claim token (primary ownership proof, beats IP matching)
        const claimToken = request.headers.get('x-claim-token');
        let claimTokenValid = false;
        if (claimToken && !scanAccess.userId && redisClient.isConfigured()) {
            const claimedScanId = await redisClient.get<string>(`scan:claim:${claimToken}`);
            claimTokenValid = claimedScanId === scanId;
        }

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
