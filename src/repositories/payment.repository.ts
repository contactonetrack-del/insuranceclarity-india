import { prisma } from '@/lib/prisma';

export class PaymentRepository {
    findScanForPayment(scanId: string) {
        return prisma.scan.findUnique({
            where: { id: scanId },
            select: { id: true, status: true, isPaid: true, userId: true, ipAddress: true },
        });
    }

    findPaymentByOrderId(orderId: string) {
        return prisma.payment.findUnique({
            where: { razorpayOrderId: orderId },
            select: {
                id: true,
                status: true,
                scanId: true,
                userId: true,
                amount: true,
                scan: { select: { userId: true, ipAddress: true } },
            },
        });
    }

    findPaymentForWebhookByOrderId(orderId: string) {
        return prisma.payment.findUnique({
            where: { razorpayOrderId: orderId },
            select: { id: true, scanId: true, status: true, userId: true, amount: true },
        });
    }

    findPaymentStatusByScanId(scanId: string) {
        return prisma.payment.findUnique({
            where: { scanId },
            select: { status: true, updatedAt: true, razorpayOrderId: true },
        });
    }

    findPaymentByScanId(scanId: string) {
        return prisma.payment.findUnique({
            where: { scanId },
            select: { id: true, status: true },
        });
    }

    updatePaymentForScanUnlock(params: {
        paymentId: string;
        userId: string | null;
        razorpayOrderId: string;
        amount: number;
    }) {
        return prisma.payment.update({
            where: { id: params.paymentId },
            data: {
                userId: params.userId,
                razorpayOrderId: params.razorpayOrderId,
                razorpayPaymentId: null,
                razorpaySignature: null,
                amount: params.amount,
                currency: 'INR',
                status: 'CREATED',
                plan: 'SCAN_UNLOCK',
            },
        });
    }

    createScanUnlockPayment(params: {
        scanId: string;
        userId: string | null;
        razorpayOrderId: string;
        amount: number;
    }) {
        return prisma.payment.create({
            data: {
                userId: params.userId,
                scanId: params.scanId,
                razorpayOrderId: params.razorpayOrderId,
                amount: params.amount,
                currency: 'INR',
                status: 'CREATED',
                plan: 'SCAN_UNLOCK',
            },
        });
    }

    markPaymentFailedById(paymentId: string) {
        return prisma.payment.update({ where: { id: paymentId }, data: { status: 'FAILED' } });
    }

    markPaymentFailedByOrder(orderId: string) {
        return prisma.payment.updateMany({ where: { razorpayOrderId: orderId }, data: { status: 'FAILED' } });
    }

    capturePaymentAndUnlockScanByPaymentId(params: {
        paymentId: string;
        scanId: string;
        razorpayPaymentId: string;
        razorpaySignature: string;
    }) {
        return prisma.$transaction([
            prisma.payment.update({
                where: { id: params.paymentId },
                data: {
                    status: 'CAPTURED',
                    razorpayPaymentId: params.razorpayPaymentId,
                    razorpaySignature: params.razorpaySignature,
                },
            }),
            prisma.scan.update({
                where: { id: params.scanId },
                data: { isPaid: true, isPaywalled: false },
            }),
        ]);
    }

    capturePaymentAndUnlockScan(params: {
        razorpayOrderId: string;
        razorpayPaymentId: string;
        razorpaySignature: string;
        scanId: string;
    }) {
        return prisma.$transaction([
            prisma.payment.update({
                where: { razorpayOrderId: params.razorpayOrderId },
                data: {
                    status: 'CAPTURED',
                    razorpayPaymentId: params.razorpayPaymentId,
                    razorpaySignature: params.razorpaySignature,
                },
            }),
            prisma.scan.update({
                where: { id: params.scanId },
                data: { isPaid: true, isPaywalled: false },
            }),
        ]);
    }
}

export const paymentRepository = new PaymentRepository();

