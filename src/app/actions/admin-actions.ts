'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import type { AdminDashboardResult, QuoteRecord } from '@/types/app.types';

// ─── Admin Auth Guard ─────────────────────────────────────────────────────────

/**
 * Verifies the current session has ADMIN role.
 * Throws if unauthenticated or unauthorized.
 */
async function assertAdminSession(): Promise<void> {
    const session = await auth();

    if (!session) {
        throw new Error('Unauthenticated');
    }

    // NextAuth session type augmentation stores role in user object
    const role = (session.user as { role?: string })?.role;
    if (role !== 'ADMIN') {
        throw new Error('Forbidden: Admin access required');
    }
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export async function getAdminDashboardStats(): Promise<AdminDashboardResult> {
    try {
        await assertAdminSession();

        const [totalQuotes, quotes, reportAgg, activeSubscriptions] = await Promise.all([
            prisma.quote.count(),
            prisma.quote.findMany({
                orderBy: { createdAt: 'desc' },
                take: 50,
            }),
            prisma.report.aggregate({
                _sum: { tokensUsed: true },
            }),
            prisma.subscription.count({
                where: { status: 'ACTIVE' },
            }),
        ]);

        const typedQuotes = quotes as QuoteRecord[];

        const totalPremium  = typedQuotes.reduce((acc, q) => acc + (q.premiumAmount  ?? 0), 0);
        const totalCoverage = typedQuotes.reduce((acc, q) => acc + (q.coverageAmount ?? 0), 0);

        const totalTokens = reportAgg._sum.tokensUsed ?? 0;
        // Estimate cost: gemini-2.0-flash approx $0.10 per 1M tokens (blended)
        const estimatedAiCost = (totalTokens / 1_000_000) * 0.10;

        return {
            totalQuotes,
            totalPremium,
            totalCoverage,
            totalTokens,
            estimatedAiCost,
            activeSubscriptions,
            recentQuotes: typedQuotes,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        logger.error({ action: 'admin.stats.error', error: message });
        return { error: message };
    }
}

// ─── Lead Management ─────────────────────────────────────────────────────────

export async function getAdminLeads() {
    try {
        await assertAdminSession();
        return await prisma.lead.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        logger.error({ action: 'admin.leads.error', error: message });
        return { error: message };
    }
}

export async function updateLeadStatus(leadId: string, status: string) {
    try {
        await assertAdminSession();
        return await prisma.lead.update({
            where: { id: leadId },
            data: { status },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        logger.error({ action: 'admin.lead.update.error', error: message });
        return { error: message };
    }
}
