import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

import { logger } from '@/lib/logger';
import { validateCsrfRequest } from '@/lib/security/csrf';
import { verifyScanClaimToken } from '@/lib/security/scan-claim';
import { ErrorFactory } from '@/lib/api/error-response';
import { canAccessScan, findPaymentByOrderId, getClientIpFromHeaders, markPaymentFailedById } from '@/services/payment.service';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const markFailedSchema = z.object({
    scanId: z.string().min(1),
    razorpayOrderId: z.string().min(1),
    reason: z.string().max(120).optional(),
});

export async function POST(request: NextRequest) {
    try {
        const csrfError = validateCsrfRequest(request);
        if (csrfError) return csrfError;

        const claimToken = request.headers.get('x-claim-token');
        const parsed = markFailedSchema.safeParse(await request.json());

        if (!parsed.success) {
            return ErrorFactory.validationError(parsed.error.issues[0]?.message ?? 'Invalid payload.');
        }

        const body = parsed.data;

        const session = await auth();
        const sessionUserId = (session?.user as { id?: string } | undefined)?.id ?? null;
        const isAdmin = (session?.user as { role?: string } | undefined)?.role === 'ADMIN';
        const requestIp = getClientIpFromHeaders(request.headers);

        const payment = await findPaymentByOrderId(body.razorpayOrderId);

        if (!payment || payment.scanId !== body.scanId) {
            return ErrorFactory.notFound('Payment record not found.');
        }

        const claimTokenValid = !payment.scan.userId
            ? await verifyScanClaimToken(claimToken, body.scanId)
            : false;

        const isAllowed = canAccessScan({
            isAdmin,
            sessionUserId,
            ownerUserId: payment.scan.userId,
            claimTokenValid,
            requestIp,
            ownerIp: payment.scan.ipAddress,
        });

        if (!isAllowed) {
            return ErrorFactory.notFound('Payment record not found.');
        }

        if (payment.status === 'CAPTURED') {
            return NextResponse.json({ success: true, status: 'CAPTURED' });
        }

        await markPaymentFailedById(payment.id);

        logger.info({
            action: 'payment.mark_failed',
            scanId: body.scanId,
            razorpayOrderId: body.razorpayOrderId,
            reason: body.reason ?? 'unspecified',
        });

        return NextResponse.json({ success: true, status: 'FAILED' });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error({ action: 'payment.mark_failed.error', error: message });
        return ErrorFactory.internalServerError('Unable to mark payment attempt as failed.');
    }
}

