import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

export async function isEmailSuppressed(email: string): Promise<boolean> {
    const normalized = normalizeEmail(email);
    if (!normalized) return false;

    try {
        const record = await prisma.lead.findFirst({
            where: {
                email: normalized,
                insuranceType: 'UNSUBSCRIBE',
            },
            select: { id: true },
        });

        return Boolean(record);
    } catch (error) {
        logger.warn({
            action: 'email.suppression.lookup_failed',
            email: normalized,
            error: error instanceof Error ? error.message : String(error),
        });
        return false;
    }
}

export async function suppressEmail(params: {
    email: string;
    reason?: string;
    source?: string;
}): Promise<void> {
    const normalized = normalizeEmail(params.email);
    if (!normalized) return;

    const source = params.source?.trim() || 'EMAIL';
    const reason = params.reason?.trim();
    const notes = reason ? `unsubscribe:${reason}` : 'unsubscribe:requested';

    const existing = await prisma.lead.findFirst({
        where: {
            email: normalized,
            insuranceType: 'UNSUBSCRIBE',
        },
        select: { id: true },
    });

    if (existing?.id) {
        await prisma.lead.update({
            where: { id: existing.id },
            data: {
                status: 'CLOSED',
                source,
                notes,
            },
        });
        return;
    }

    await prisma.lead.create({
        data: {
            name: normalized.split('@')[0] || 'subscriber',
            email: normalized,
            phone: 'N/A',
            insuranceType: 'UNSUBSCRIBE',
            status: 'CLOSED',
            source,
            notes,
        },
    });
}

export async function removeNewsletterSubscription(email: string): Promise<void> {
    const normalized = normalizeEmail(email);
    if (!normalized) return;

    await Promise.all([
        prisma.newsletter.deleteMany({ where: { email: normalized } }),
        prisma.lead.deleteMany({
            where: {
                email: normalized,
                insuranceType: 'NEWSLETTER',
            },
        }),
    ]);
}

export async function removeScanNotifyRequests(email: string): Promise<void> {
    const normalized = normalizeEmail(email);
    if (!normalized) return;

    await prisma.lead.deleteMany({
        where: {
            email: normalized,
            insuranceType: 'SCAN_NOTIFY',
        },
    });
}
