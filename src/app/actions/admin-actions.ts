'use server'

import type { LeadStatus, QuoteRecord } from '@/types/app.types'
import type { AdminDashboardResult } from '@/types/app.types'
import type { AdminBusinessReadinessResult } from '@/types/app.types'
import type { AdminJobHealthResult } from '@/types/app.types'
import { auth } from '@/auth'
import { logger } from '@/lib/logger'
import {
    getAdminBusinessReadinessData,
    getAdminJobHealthData,
    getAdminStatsData,
    getRecentLeads,
    setLeadStatus,
} from '@/services/admin.service'

/**
 * Verifies the current session has ADMIN role.
 * Throws if unauthenticated or unauthorized.
 */
async function assertAdminSession(): Promise<void> {
    const session = await auth()

    if (!session) {
        throw new Error('Unauthenticated')
    }

    const role = (session.user as { role?: string })?.role
    if (role !== 'ADMIN') {
        throw new Error('Forbidden: Admin access required')
    }
}

export async function getAdminDashboardStats(): Promise<AdminDashboardResult> {
    try {
        await assertAdminSession()

        const { totalQuotes, quotes, reportAgg, activeSubscriptions } = await getAdminStatsData()

        const typedQuotes = quotes as QuoteRecord[]

        const totalPremium = typedQuotes.reduce((acc, q) => acc + (q.premiumAmount ?? 0), 0)
        const totalCoverage = typedQuotes.reduce((acc, q) => acc + (q.coverageAmount ?? 0), 0)

        const totalTokens = reportAgg._sum.tokensUsed ?? 0
        // Estimate cost: gemini-2.0-flash approx $0.10 per 1M tokens (blended)
        const estimatedAiCost = (totalTokens / 1_000_000) * 0.10

        return {
            totalQuotes,
            totalPremium,
            totalCoverage,
            totalTokens,
            estimatedAiCost,
            activeSubscriptions,
            recentQuotes: typedQuotes,
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        logger.error({ action: 'admin.stats.error', error: message })
        return { error: message }
    }
}

export async function getAdminLeads() {
    try {
        await assertAdminSession()
        return await getRecentLeads(100)
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        logger.error({ action: 'admin.leads.error', error: message })
        return { error: message }
    }
}

export async function updateLeadStatus(leadId: string, status: LeadStatus) {
    try {
        await assertAdminSession()
        return await setLeadStatus(leadId, status)
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        logger.error({ action: 'admin.lead.update.error', error: message })
        return { error: message }
    }
}

export async function getAdminJobHealth(): Promise<AdminJobHealthResult> {
    try {
        await assertAdminSession()
        return await getAdminJobHealthData()
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        logger.error({ action: 'admin.job-health.error', error: message })
        return { error: message }
    }
}

export async function getAdminBusinessReadiness(days = 30): Promise<AdminBusinessReadinessResult> {
    try {
        await assertAdminSession()
        return await getAdminBusinessReadinessData(days)
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        logger.error({ action: 'admin.business-readiness.error', error: message })
        return { error: message }
    }
}
