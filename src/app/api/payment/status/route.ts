import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

import { logger } from '@/lib/logger';
import { ErrorFactory } from '@/lib/api/error-response';
import { verifyScanClaimToken } from '@/lib/security/scan-claim';
import { canAccessScan, findPaymentStatusByScanId, findScanForPayment, getClientIpFromHeaders } from '@/services/payment.service';

export const dynamic = 'force-dynamic';

function statusMessage(status: 'NOT_CREATED' | 'CREATED' | 'FAILED' | 'CAPTURED') {
    switch (status) {
        case 'CAPTURED':
            return 'Payment captured. Your report is unlocked.';
        case 'FAILED':
            return 'Last payment attempt failed. You can retry now.';
        case 'CREATED':
            return 'A previous payment order exists but is not completed yet. You can retry safely.';
        default:
            return 'No payment attempt found yet.';
    }
}

export async function GET(request: NextRequest) {
    try {
        const scanId = request.nextUrl.searchParams.get('scanId');
        if (!scanId) {
            return ErrorFactory.validationError('scanId is required.');
        }

        const session = await auth();
        const sessionUserId = (session?.user as { id?: string } | undefined)?.id ?? null;
        const isAdmin = (session?.user as { role?: string } | undefined)?.role === 'ADMIN';
        const requestIp = getClientIpFromHeaders(request.headers);
        const claimToken = request.headers.get('x-claim-token');

        const scan = await findScanForPayment(scanId);

        if (!scan) {
            return ErrorFactory.notFound('Scan not found.');
        }

        const claimTokenValid = !scan.userId
            ? await verifyScanClaimToken(claimToken, scanId)
            : false;

        const isAllowed = canAccessScan({
            isAdmin,
            sessionUserId,
            ownerUserId: scan.userId,
            claimTokenValid,
            requestIp,
            ownerIp: scan.ipAddress,
        });

        if (!isAllowed) {
            logger.warn({
                action: 'payment.status.access.denied',
                scanId,
                sessionUserId: sessionUserId ?? 'anonymous',
            });
            return ErrorFactory.notFound('Scan not found.');
        }

        const payment = await findPaymentStatusByScanId(scanId);

        if (scan.isPaid || payment?.status === 'CAPTURED') {
            return NextResponse.json({
                scanId,
                status: 'CAPTURED',
                canRetry: false,
                message: statusMessage('CAPTURED'),
                updatedAt: payment?.updatedAt?.toISOString() ?? null,
            });
        }

        if (!payment) {
            return NextResponse.json({
                scanId,
                status: 'NOT_CREATED',
                canRetry: true,
                message: statusMessage('NOT_CREATED'),
                updatedAt: null,
            });
        }

        const status = payment.status === 'FAILED' || payment.status === 'REFUNDED'
            ? 'FAILED'
            : 'CREATED';

        return NextResponse.json({
            scanId,
            status,
            canRetry: true,
            message: statusMessage(status),
            updatedAt: payment.updatedAt.toISOString(),
            lastOrderId: payment.razorpayOrderId,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error({ action: 'payment.status.error', error: message });
        return ErrorFactory.internalServerError('Unable to fetch payment status.');
    }
}
