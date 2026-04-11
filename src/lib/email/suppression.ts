import { logger } from '@/lib/logger';
import { deriveLeadSource } from '@/lib/domain/enums';
import { reportRepository } from '@/repositories/report.repository';

function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

export async function isEmailSuppressed(email: string): Promise<boolean> {
    const normalized = normalizeEmail(email);
    if (!normalized) return false;

    try {
        const record = await reportRepository.findSuppressionLeadByEmail(normalized);

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

    const rawSource = params.source?.trim();
    const source = deriveLeadSource({ source: rawSource ?? 'EMAIL' });
    const reason = params.reason?.trim();
    const notesParts = [reason ? `unsubscribe:${reason}` : 'unsubscribe:requested'];

    if (rawSource) {
        notesParts.push(`source-context:${rawSource}`);
    }

    const notes = notesParts.join(' | ');

    const existing = await reportRepository.findSuppressionLeadByEmail(normalized);

    if (existing?.id) {
        await reportRepository.updateSuppressionLead({
            leadId: existing.id,
            source,
            notes,
        });
        return;
    }

    await reportRepository.createSuppressionLead({
        email: normalized,
        source,
        notes,
    });
}

export async function removeNewsletterSubscription(email: string): Promise<void> {
    const normalized = normalizeEmail(email);
    if (!normalized) return;

    await Promise.all([reportRepository.deleteNewsletterByEmail(normalized), reportRepository.deleteNewsletterLeadByEmail(normalized)]);
}

export async function removeScanNotifyRequests(email: string): Promise<void> {
    const normalized = normalizeEmail(email);
    if (!normalized) return;

    await reportRepository.deleteScanNotifyLeadByEmail(normalized);
}
