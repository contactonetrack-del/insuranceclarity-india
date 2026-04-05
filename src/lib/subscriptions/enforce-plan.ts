/**
 * src/lib/subscriptions/enforce-plan.ts
 *
 * Server-side utility — use in API routes to enforce subscription limits
 * before executing gated operations.
 *
 * Usage:
 *   const guard = await enforcePlanLimit(userId, 'scan');
 *   if (!guard.allowed) return NextResponse.json({ error: guard.reason }, { status: 402 });
 */

import { prisma } from '@/lib/prisma';
import { isAtScanLimit, getLimitsForPlan } from './plan-limits';

export type GatedFeature = 'scan' | 'savedQuotes' | 'chat' | 'advisor' | 'exportReport' | 'bulkScan';

export interface PlanGuardResult {
  allowed: boolean;
  reason?: string;
  /** Upgrade prompt URL for the client */
  upgradeUrl?: string;
}

const UPGRADE_URL = '/pricing';

/**
 * Enforces plan limits for a given feature.
 * Always fetches a fresh user record from the database.
 */
export async function enforcePlanLimit(
  userId: string,
  feature: GatedFeature,
): Promise<PlanGuardResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, scansUsed: true, savedFacts: true },
  });

  if (!user) {
    return { allowed: false, reason: 'User account not found.' };
  }

  const plan = user.plan ?? 'FREE';
  const limits = getLimitsForPlan(plan);

  switch (feature) {
    case 'scan': {
      if (isAtScanLimit(plan, user.scansUsed)) {
        const limit = limits.maxScansPerMonth;
        return {
          allowed: false,
          reason: `You have reached the ${limit}-scan limit for the ${plan} plan. Upgrade to Pro for 50 scans/month.`,
          upgradeUrl: UPGRADE_URL,
        };
      }
      return { allowed: true };
    }

    case 'advisor': {
      if (!limits.canAccessAdvisor) {
        return {
          allowed: false,
          reason: 'The AI Advisor is a Pro feature. Upgrade to access unlimited advice.',
          upgradeUrl: UPGRADE_URL,
        };
      }
      return { allowed: true };
    }

    case 'exportReport': {
      if (!limits.canExportReports) {
        return {
          allowed: false,
          reason: 'Report export is available on Pro and Enterprise plans.',
          upgradeUrl: UPGRADE_URL,
        };
      }
      return { allowed: true };
    }

    case 'bulkScan': {
      if (!limits.canAccessBulkScan) {
        return {
          allowed: false,
          reason: 'Bulk scanning is an Enterprise-only feature.',
          upgradeUrl: UPGRADE_URL,
        };
      }
      return { allowed: true };
    }

    case 'savedQuotes': {
      const saved = user.savedFacts?.length ?? 0;
      if (saved >= limits.maxSavedQuotes) {
        return {
          allowed: false,
          reason: `You have reached the ${limits.maxSavedQuotes}-quote limit for the ${plan} plan.`,
          upgradeUrl: UPGRADE_URL,
        };
      }
      return { allowed: true };
    }

    default:
      return { allowed: true };
  }
}
