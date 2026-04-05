import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

import {
    getReferralCodeForUser,
    getReferralStats,
    recordReferralConversion,
    sanitizeReferralCode,
    trackReferralVisit,
} from '@/lib/referrals';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const conversionSchema = z.object({
    code: z.string().min(4).max(32),
    name: z.string().min(1).max(120),
    email: z.string().email().max(255),
    phone: z.string().max(32).optional(),
});

const visitSchema = z.object({
    code: z.string().min(4).max(32),
    event: z.literal('visit'),
});

export async function GET() {
    const session = await auth();
    const userId = (session?.user as { id?: string } | undefined)?.id;

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const code = getReferralCodeForUser(userId);
    const stats = await getReferralStats(code);

    return NextResponse.json({
        code,
        stats,
        referralUrl: `/refer?code=${encodeURIComponent(code)}`,
    });
}

export async function POST(request: NextRequest) {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
        return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
    }

    const maybeVisit = visitSchema.safeParse(body);
    if (maybeVisit.success) {
        const code = sanitizeReferralCode(maybeVisit.data.code);
        await trackReferralVisit(code);
        return NextResponse.json({ ok: true });
    }

    const parsed = conversionSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid referral payload.', details: parsed.error.format() }, { status: 400 });
    }

    await recordReferralConversion(parsed.data);
    return NextResponse.json({ ok: true });
}
