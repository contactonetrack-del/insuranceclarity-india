import type { UserPlan } from '@/lib/domain/enums';

/**
 * src/lib/subscriptions/plan-limits.ts
 *
 * Central definition of plan limits and a reusable guard utility.
 * This ensures all tier-gating logic comes from one place.
 */

// ─── Plan Feature Limits ──────────────────────────────────────────────────────

export interface PlanLimits {
  maxScansPerMonth: number;
  maxSavedQuotes: number;
  maxChatMessages: number;
  canExportReports: boolean;
  canAccessAdvisor: boolean;
  canAccessBulkScan: boolean;
}

export const PLAN_LIMITS: Record<UserPlan, PlanLimits> = {
  FREE: {
    maxScansPerMonth: 2,
    maxSavedQuotes: 3,
    maxChatMessages: 10,
    canExportReports: false,
    canAccessAdvisor: false,
    canAccessBulkScan: false,
  },
  PRO: {
    maxScansPerMonth: 50,
    maxSavedQuotes: 100,
    maxChatMessages: 500,
    canExportReports: true,
    canAccessAdvisor: true,
    canAccessBulkScan: false,
  },
  ENTERPRISE: {
    maxScansPerMonth: Infinity,
    maxSavedQuotes: Infinity,
    maxChatMessages: Infinity,
    canExportReports: true,
    canAccessAdvisor: true,
    canAccessBulkScan: true,
  },
};

// ─── Helper Guards ────────────────────────────────────────────────────────────

export function getLimitsForPlan(plan: string): PlanLimits {
  const normalised = plan?.toUpperCase() as UserPlan;
  return PLAN_LIMITS[normalised] ?? PLAN_LIMITS.FREE;
}

/**
 * Returns true when the user has exceeded the monthly scan limit.
 */
export function isAtScanLimit(plan: string, scansUsed: number): boolean {
  const limits = getLimitsForPlan(plan);
  return scansUsed >= limits.maxScansPerMonth;
}

/**
 * Returns the remaining scans for a user.
 */
export function getRemainingScan(plan: string, scansUsed: number): number {
  const limits = getLimitsForPlan(plan);
  if (limits.maxScansPerMonth === Infinity) return Infinity;
  return Math.max(0, limits.maxScansPerMonth - scansUsed);
}
