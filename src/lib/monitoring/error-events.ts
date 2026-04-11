/**
 * Error Event Logging System
 *
 * Centralized error tracking for all API endpoints.
 * Logs error events to database for analysis and monitoring.
 *
 * Error Sampling Strategy:
 * - CRITICAL: 100% logged
 * - HIGH: 50% sampled
 * - MEDIUM: 10% sampled
 * - LOW: Don't log
 */

import { Prisma } from '@prisma/client';
import { logger } from '@/lib/logger';
import { reportRepository } from '@/repositories/report.repository';

export enum ErrorSeverity {
  CRITICAL = 'CRITICAL', // Auth failures, payment failures, data corruption
  HIGH = 'HIGH', // Rate limits, validation errors, auth issues
  MEDIUM = 'MEDIUM', // Not found, conflicts, client errors
  LOW = 'LOW', // Info-level issues, deprecations
}

export interface ErrorEvent {
  code: string; // Error code (e.g., VALIDATION_ERROR, UNAUTHORIZED)
  message: string; // User-friendly message
  route: string; // API route (e.g., /api/payment/create-order)
  method: string; // HTTP method (GET, POST, etc.)
  statusCode: number; // HTTP status
  severity: ErrorSeverity;
  userId?: string; // User ID if authenticated
  ipAddress?: string; // Client IP address
  details?: Record<string, unknown>; // Additional context (no PII!)
  timestamp?: Date;
}

function toPrismaJson(
  details?: Record<string, unknown>,
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
  if (!details) {
    return undefined;
  }

  return JSON.parse(JSON.stringify(details)) as Prisma.InputJsonValue;
}

/**
 * Check if error should be logged based on sampling rate
 */
function shouldLogError(severity: ErrorSeverity): boolean {
  if (severity === ErrorSeverity.CRITICAL) return true;
  if (severity === ErrorSeverity.HIGH) return Math.random() < 0.5; // 50%
  if (severity === ErrorSeverity.MEDIUM) return Math.random() < 0.1; // 10%
  return false; // Don't log LOW severity
}

/**
 * Get severity level from HTTP status code
 */
export function getSeverityFromStatus(statusCode: number, errorCode: string): ErrorSeverity {
  // Critical: Auth, security, payment
  if ([401, 403].includes(statusCode)) return ErrorSeverity.CRITICAL;
  if (errorCode.includes('UNAUTHORIZED') || errorCode.includes('FORBIDDEN')) return ErrorSeverity.CRITICAL;
  if (errorCode.includes('PAYMENT')) return ErrorSeverity.CRITICAL;

  // High: Rate limits, internal errors
  if (statusCode === 429) return ErrorSeverity.HIGH;
  if (statusCode >= 500) return ErrorSeverity.HIGH;
  if (errorCode.includes('RATE_LIMIT')) return ErrorSeverity.HIGH;

  // Medium: Validation, not found
  if (statusCode === 400 || statusCode === 404 || statusCode === 422) return ErrorSeverity.MEDIUM;

  return ErrorSeverity.LOW;
}

/**
 * Log error event to database
 */
export async function logErrorEvent(event: ErrorEvent): Promise<void> {
  try {
    const severity = event.severity || getSeverityFromStatus(event.statusCode, event.code);

    // Check sampling rate
    if (!shouldLogError(severity)) {
      return;
    }

    // Store in database
    await reportRepository.createErrorLog({
      errorCode: event.code,
      message: event.message,
      route: event.route,
      method: event.method,
      httpStatus: event.statusCode,
      severity,
      userId: event.userId,
      ipAddress: event.ipAddress,
      details: toPrismaJson(event.details),
      timestamp: event.timestamp || new Date(),
    }).catch((err) => {
      // Log but don't throw — logging failures shouldn't break the app
      logger.error({
        action: 'error_event.log.failed',
        error: err instanceof Error ? err.message : String(err),
      });
    });
  } catch (error) {
    // Silently fail — error logging shouldn't crash the app
    logger.warn({
      action: 'error_event.logging.failed',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Batch log multiple error events (for efficiency)
 */
export async function batchLogErrorEvents(events: ErrorEvent[]): Promise<void> {
  if (events.length === 0) return;

  try {
    const loggableEvents = events.filter((e) => {
      const severity = e.severity || getSeverityFromStatus(e.statusCode, e.code);
      return shouldLogError(severity);
    });

    if (loggableEvents.length === 0) return;

    await reportRepository.createManyErrorLogs(loggableEvents.map((e) => ({
        errorCode: e.code,
        message: e.message,
        route: e.route,
        method: e.method,
        httpStatus: e.statusCode,
        severity: e.severity || getSeverityFromStatus(e.statusCode, e.code),
        userId: e.userId,
        ipAddress: e.ipAddress,
        details: toPrismaJson(e.details),
        timestamp: e.timestamp || new Date(),
      }))).catch((err) => {
      logger.error({
        action: 'error_event.batch_log.failed',
        count: loggableEvents.length,
        error: err instanceof Error ? err.message : String(err),
      });
    });
  } catch (error) {
    logger.warn({
      action: 'error_event.batch_logging.failed',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Get error statistics for a given period
 */
export async function getErrorStats(daysBack: number = 7) {
  try {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - daysBack);

    const stats = await reportRepository.groupErrorLogsByCodeAndSeverity(sinceDate);

    return stats.map((s) => ({
      errorCode: s.errorCode,
      severity: s.severity,
      count: s._count.id,
    }));
  } catch (error) {
    logger.error({
      action: 'error_stats.fetch.failed',
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}

/**
 * Get error timeline for dashboard
 */
export async function getErrorTimeline(daysBack: number = 7) {
  try {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - daysBack);

    const timeline = await reportRepository.getErrorTimeline(sinceDate);

    return timeline;
  } catch (error) {
    logger.error({
      action: 'error_timeline.fetch.failed',
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}
