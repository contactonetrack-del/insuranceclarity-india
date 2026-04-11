import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

interface CreatePaymentFixtureInput {
    scanId: string;
    orderId: string;
    paymentId: string;
    fileHash: string;
    report: Prisma.ReportUncheckedCreateInput;
    isPaid: boolean;
    paymentStatus: 'CREATED' | 'FAILED' | 'CAPTURED';
}

export async function deleteE2eUserByEmail(email: string) {
    await prisma.user.deleteMany({
        where: { email },
    });
}

export async function createPaymentFixture(input: CreatePaymentFixtureInput) {
    const {
        scanId,
        orderId,
        paymentId,
        fileHash,
        report,
        isPaid,
        paymentStatus,
    } = input;

    await prisma.$transaction(async (tx) => {
        await tx.scan.create({
            data: {
                id: scanId,
                userId: null,
                fileUrl: 'https://example.com/fixture-policy.pdf',
                fileName: 'fixture-policy.pdf',
                fileHash,
                fileSizeKb: 128,
                status: 'COMPLETED',
                score: 63,
                isPaywalled: !isPaid,
                isPaid,
                ipAddress: null,
            },
        });

        await tx.report.create({
            data: report,
        });

        await tx.payment.create({
            data: {
                scanId,
                userId: null,
                razorpayOrderId: orderId,
                razorpayPaymentId: isPaid ? paymentId : null,
                razorpaySignature: isPaid ? 'fixture_signature' : null,
                amount: 19900,
                currency: 'INR',
                status: paymentStatus,
                plan: 'SCAN_UNLOCK',
            },
        });
    });
}

export async function deletePaymentFixture(scanId: string) {
    await prisma.scan.delete({
        where: { id: scanId },
    }).catch(() => null);
}
