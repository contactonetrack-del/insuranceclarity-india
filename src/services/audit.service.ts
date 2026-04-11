/**
 * Audit Service — Logs sensitive operations for compliance and security
 *
 * Tracks user actions on payments, subscriptions, scans, and admin operations
 * for regulatory compliance (IRDAI requirements) and security monitoring.
 */

import { logger } from '@/lib/logger';
import { auditRepository } from '@/repositories/audit.repository';

export interface AuditEvent {
  userId?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  details?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Log an audit event to the database
 */
export async function logAuditEvent(event: AuditEvent): Promise<void> {
  try {
    await auditRepository.createLog({
      userId: event.userId,
      action: event.action,
      resource: event.resource,
      resourceId: event.resourceId,
      details: event.details ? JSON.parse(JSON.stringify(event.details)) : null,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
    });

    // Also log to structured logger for monitoring
    logger.info({
      action: 'audit.log.created',
      userId: event.userId,
      auditAction: event.action,
      resource: event.resource,
      resourceId: event.resourceId,
    });

  } catch (error) {
    // Don't fail the main operation if audit logging fails
    logger.error({
      action: 'audit.log.failed',
      error,
      originalEvent: event,
    });
  }
}

/**
 * Get audit logs for a user (admin only)
 */
export async function getUserAuditLogs(userId: string, limit = 50) {
  return auditRepository.listByUserId(userId, limit);
}

/**
 * Get audit logs by action type
 */
export async function getAuditLogsByAction(action: string, limit = 100) {
  return auditRepository.listByAction(action, limit);
}

/**
 * Get recent audit logs for monitoring
 */
export async function getRecentAuditLogs(hours = 24, limit = 100) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  return auditRepository.listSince(since, limit);
}
