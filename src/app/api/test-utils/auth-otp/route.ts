import { NextRequest, NextResponse } from 'next/server';
import { clearE2eOtp, getE2eOtp, isE2eOtpHarnessEnabled } from '@/lib/auth/e2e-otp-store';
import { deleteE2eUserByEmail } from '@/services/e2e-test.service';

export const dynamic = 'force-dynamic';

function ensureTestAccess(request: NextRequest): NextResponse | null {
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (!isE2eOtpHarnessEnabled()) {
        return NextResponse.json({ error: 'E2E OTP harness is disabled.' }, { status: 403 });
    }

    const expectedSecret = process.env.E2E_TEST_SECRET?.trim();
    const incomingSecret = request.headers.get('x-e2e-test-secret');
    if (!expectedSecret || incomingSecret !== expectedSecret) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return null;
}

function normalizeEmail(input: string): string {
    return input.trim().toLowerCase();
}

export async function GET(request: NextRequest) {
    const accessError = ensureTestAccess(request);
    if (accessError) {
        return accessError;
    }

    const email = request.nextUrl.searchParams.get('email');
    if (!email) {
        return NextResponse.json({ error: 'email is required.' }, { status: 400 });
    }

    const consume = request.nextUrl.searchParams.get('consume') !== 'false';
    const otp = getE2eOtp(email, consume);
    if (!otp) {
        return NextResponse.json({ error: 'OTP not found for email.' }, { status: 404 });
    }

    return NextResponse.json({
        email: normalizeEmail(email),
        otp,
    });
}

interface DeleteBody {
    email?: string;
}

export async function DELETE(request: NextRequest) {
    const accessError = ensureTestAccess(request);
    if (accessError) {
        return accessError;
    }

    const body = (await request.json().catch(() => ({}))) as DeleteBody;
    const email = body.email;
    if (!email || typeof email !== 'string') {
        return NextResponse.json({ error: 'email is required.' }, { status: 400 });
    }

    const normalizedEmail = normalizeEmail(email);
    clearE2eOtp(normalizedEmail);

    await deleteE2eUserByEmail(normalizedEmail);

    return NextResponse.json({
        deleted: true,
        email: normalizedEmail,
    });
}
