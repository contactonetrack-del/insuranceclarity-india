/**
 * Subscription Plan Validation
 * 
 * Validates that all required Razorpay plan IDs are properly configured
 * and accessible. Runs on application startup.
 */

import { logger } from '@/lib/logger';

export interface PlanValidationResult {
  valid: boolean;
  issues: string[];
  warnings: string[];
}

/**
 * Validates subscription plan configuration
 */
export async function validateSubscriptionPlans(): Promise<PlanValidationResult> {
  const issues: string[] = [];
  const warnings: string[] = [];

  const skipRequested = process.env.RAZORPAY_SKIP_PLAN_VALIDATION === 'true';
  const mode = process.env.RAZORPAY_MODE?.trim() || 'test';
  const skip = skipRequested && process.env.NODE_ENV !== 'production';

  if (skipRequested && !skip) {
    warnings.push('RAZORPAY_SKIP_PLAN_VALIDATION is ignored in production.');
    logger.error({
      action: 'startup.plan_validation.skip_blocked',
      reason: 'RAZORPAY_SKIP_PLAN_VALIDATION=true',
      environment: process.env.NODE_ENV,
    });
  }

  if (skip) {
    logger.warn({
      action: 'startup.plan_validation.skipped',
      reason: 'RAZORPAY_SKIP_PLAN_VALIDATION=true',
    });
    return { valid: true, issues, warnings };
  }

  // Check required environment variables
  const requiredEnv = [
    { key: 'RAZORPAY_KEY_ID', description: 'Razorpay API Key ID' },
    { key: 'RAZORPAY_KEY_SECRET', description: 'Razorpay API Key Secret' },
    { key: 'RAZORPAY_PLAN_ID_PRO', description: 'Pro Plan ID' },
    { key: 'RAZORPAY_PLAN_ID_ENTERPRISE', description: 'Enterprise Plan ID' },
  ];

  for (const { key, description } of requiredEnv) {
    if (!process.env[key]?.trim()) {
      issues.push(`Missing environment variable: ${key} (${description})`);
    }
  }

  if (issues.length > 0) {
    logger.error({
      action: 'startup.plan_validation.failed',
      issues,
      count: issues.length,
    });
    return { valid: false, issues, warnings };
  }

  // Validate plan ID format (should be plan_* not rzp_*)
  const proPlanId = process.env.RAZORPAY_PLAN_ID_PRO?.trim() || '';
  const enterprisePlanId = process.env.RAZORPAY_PLAN_ID_ENTERPRISE?.trim() || '';

  if (!proPlanId.startsWith('plan_')) {
    issues.push(`Invalid Pro Plan ID format. Expected "plan_*", got: ${proPlanId.substring(0, 10)}...`);
  }

  if (!enterprisePlanId.startsWith('plan_')) {
    issues.push(`Invalid Enterprise Plan ID format. Expected "plan_*", got: ${enterprisePlanId.substring(0, 10)}...`);
  }

  // Check for test plan IDs in production
  if (mode === 'live') {
    const isProTestPlan =
      proPlanId.toLowerCase().includes('test') ||
      proPlanId === 'plan_00000000000001';

    const isEnterpriseTestPlan =
      enterprisePlanId.toLowerCase().includes('test') ||
      enterprisePlanId === 'plan_00000000000001';

    if (isProTestPlan) {
      issues.push('Pro Plan ID appears to be a test plan in LIVE mode');
    }

    if (isEnterpriseTestPlan) {
      issues.push('Enterprise Plan ID appears to be a test plan in LIVE mode');
    }
  }

  // Log validation result
  if (issues.length === 0) {
    logger.info({
      action: 'startup.plan_validation.success',
      mode,
      proPlanPrefix: proPlanId.substring(0, 8),
      enterprisePlanPrefix: enterprisePlanId.substring(0, 8),
    });
  } else {
    logger.error({
      action: 'startup.plan_validation.failed',
      issues,
      count: issues.length,
      mode,
    });
  }

  return {
    valid: issues.length === 0,
    issues,
    warnings,
  };
}

/**
 * Runs validation during application startup
 * Call this in your app initialization code (e.g., middleware or layout)
 */
let validationCompleted = false;
let validationResult: PlanValidationResult | null = null;

export async function ensurePlansValidated(): Promise<PlanValidationResult> {
  if (validationCompleted) {
    return validationResult!;
  }

  validationResult = await validateSubscriptionPlans();
  validationCompleted = true;

  if (!validationResult.valid && process.env.NODE_ENV === 'production') {
    logger.error({
      action: 'startup.plan_validation.critical',
      message: 'Subscription plan validation failed in production. Service may be degraded.',
      issues: validationResult.issues,
    });
  }

  return validationResult;
}
