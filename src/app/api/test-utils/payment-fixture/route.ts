import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { generateScanClaimToken } from '@/lib/security/scan-claim';
import { createPaymentFixture, deletePaymentFixture } from '@/services/e2e-test.service';

export const dynamic = 'force-dynamic';

type FixtureScenario = 'created' | 'captured' | 'failed';

interface CreateFixtureBody {
    scenario?: FixtureScenario;
}

interface DeleteFixtureBody {
    scanId?: string;
}

function generateSuffix(length = 24): string {
    return randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

function createScanId(): string {
    return `c${generateSuffix(24)}`;
}

function createOrderId(): string {
    return `order_${generateSuffix(16)}`;
}

function createPaymentId(): string {
    return `pay_${generateSuffix(16)}`;
}

function ensureTestAccess(request: NextRequest): NextResponse | null {
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const secret = process.env.E2E_TEST_SECRET?.trim();
    if (!secret) {
        return NextResponse.json({ error: 'E2E test fixture endpoint is disabled.' }, { status: 403 });
    }

    const incomingSecret = request.headers.get('x-e2e-test-secret');
    if (incomingSecret !== secret) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return null;
}

function sanitizeScenario(value: string | undefined): FixtureScenario {
    if (value === 'captured' || value === 'failed') {
        return value;
    }

    return 'created';
}

function buildFixtureReport(scanId: string) {
    return {
        scanId,
        summary: 'Fixture report summary for deterministic payment E2E.',
        score: 63,
        risks: [
            {
                title: 'High waiting period',
                severity: 'high',
                impact: 'Medium',
            },
            {
                title: 'Room rent capping',
                severity: 'high',
                impact: 'High',
            },
            {
                title: 'Exclusion ambiguity',
                severity: 'medium',
                impact: 'Medium',
            },
        ],
        exclusions: [
            'Pre-existing disease waiting period applies for 36 months.',
            'Outpatient treatments excluded under base plan.',
        ],
        suggestions: [
            'Consider a no-room-rent-cap upgrade.',
            'Add an outpatient add-on for recurring care.',
        ],
        hiddenClauses: [
            'Ambiguous room rent proportional deduction clause.',
            'Network hospital pre-authorization carve-out.',
        ],
        rawGptOutput: 'fixture-output',
        processingMs: 1200,
    };
}

export async function POST(request: NextRequest) {
    const accessError = ensureTestAccess(request);
    if (accessError) {
        return accessError;
    }

    const body = (await request.json().catch(() => ({}))) as CreateFixtureBody;
    const scenario = sanitizeScenario(body.scenario);
    const scanId = createScanId();
    const orderId = createOrderId();
    const paymentId = createPaymentId();
    const claimToken = generateScanClaimToken(scanId);

    const isPaid = scenario === 'captured';
    const paymentStatus = scenario === 'captured' ? 'CAPTURED' : scenario === 'failed' ? 'FAILED' : 'CREATED';

    await createPaymentFixture({
        scanId,
        orderId,
        paymentId,
        fileHash: generateSuffix(40),
        report: buildFixtureReport(scanId),
        isPaid,
        paymentStatus,
    });

    return NextResponse.json({
        scanId,
        claimToken,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        scenario,
    });
}

export async function DELETE(request: NextRequest) {
    const accessError = ensureTestAccess(request);
    if (accessError) {
        return accessError;
    }

    const body = (await request.json().catch(() => ({}))) as DeleteFixtureBody;
    const scanId = body.scanId;

    if (!scanId || typeof scanId !== 'string') {
        return NextResponse.json({ error: 'scanId is required.' }, { status: 400 });
    }

    await deletePaymentFixture(scanId);

    return NextResponse.json({ deleted: true, scanId });
}
