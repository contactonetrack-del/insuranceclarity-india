import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

import { getFunnelSummary } from '@/lib/analytics/funnel';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const session = await auth();
    const role = (session?.user as { role?: string } | undefined)?.role;

    if (role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const daysRaw = request.nextUrl.searchParams.get('days');
    const days = Math.max(1, Math.min(90, Number(daysRaw ?? '30') || 30));

    const rows = await getFunnelSummary(days);
    const totals = rows.reduce(
        (acc, row) => {
            acc.signup += row.signup;
            acc.scan += row.scan;
            acc.pay += row.pay;
            acc.retain += row.retain;
            return acc;
        },
        { signup: 0, scan: 0, pay: 0, retain: 0 },
    );

    return NextResponse.json({
        days,
        totals,
        conversion: {
            signupToScan: totals.signup > 0 ? Number((totals.scan / totals.signup).toFixed(4)) : 0,
            scanToPay: totals.scan > 0 ? Number((totals.pay / totals.scan).toFixed(4)) : 0,
            payToRetain: totals.pay > 0 ? Number((totals.retain / totals.pay).toFixed(4)) : 0,
        },
        timeline: rows,
    });
}
