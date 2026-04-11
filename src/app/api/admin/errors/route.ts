/**
 * POST /api/admin/errors
 *
 * Admin dashboard endpoint for error monitoring.
 * Returns error statistics, trends, and anomalies.
 *
 * Security: Requires admin role
 */

import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { auth } from '@/auth';
import { logger } from '@/lib/logger';
import { ErrorFactory } from '@/lib/api/error-response';
import {
  countErrorLogs,
  groupAffectedUsers,
  groupErrorLogsByCode,
  groupErrorLogsByRoute,
  groupErrorLogsBySeverity,
  groupErrorLogsByStatus,
  listRateLimitAnomaliesSince,
  listRecentErrors,
} from '@/services/ops.service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check admin auth
    const session = await auth();
    if (!session?.user) {
      return ErrorFactory.unauthorized('Authentication required');
    }

    const role = (session.user as { role?: string }).role;
    if (role !== 'ADMIN') {
      return ErrorFactory.forbidden('Admin access required');
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const daysStr = searchParams.get('days') || '7';
    const severityFilter = searchParams.get('severity'); // CRITICAL, HIGH, MEDIUM, LOW
    const routeFilter = searchParams.get('route');
    const errorCodeFilter = searchParams.get('errorCode');

    const days = Math.max(1, Math.min(90, parseInt(daysStr, 10) || 7));
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    // Build where clause
    const where: Prisma.ErrorLogWhereInput = {
      timestamp: { gte: sinceDate },
    };

    if (severityFilter) {
      where.severity = severityFilter;
    }
    if (routeFilter) {
      where.route = { contains: routeFilter };
    }
    if (errorCodeFilter) {
      where.errorCode = errorCodeFilter;
    }

    // 1. Error frequency by code
    const byErrorCode = await groupErrorLogsByCode(where);

    // 2. Error frequency by route
    const byRoute = await groupErrorLogsByRoute(where);

    // 3. Error frequency by HTTP status
    const byStatus = await groupErrorLogsByStatus(where);

    // 4. Severity distribution
    const bySeverity = await groupErrorLogsBySeverity(where);

    // 5. Top errors by impact (count × severity weight)
    const topErrors = await listRecentErrors(where, 50);

    // 6. Recent rate limit anomalies
    const anomalies = await listRateLimitAnomaliesSince(sinceDate, 20);

    // 7. Users affected
    const affectedUsers = await groupAffectedUsers(where, 10);

    // 8. Total error count
    const totalErrors = await countErrorLogs(where);

    logger.info({
      action: 'admin.errors.dashboard',
      daysBack: days,
      totalErrors,
      routes: byRoute.length,
    });

    return NextResponse.json({
      success: true,
      data: {
        period: {
          days,
          since: sinceDate.toISOString(),
          until: new Date().toISOString(),
        },
        summary: {
          totalErrors,
          uniqueErrorCodes: byErrorCode.length,
          affectedRoutes: byRoute.length,
          affectedUsers: affectedUsers.length,
        },
        distribution: {
          byErrorCode: byErrorCode.map((g) => ({
            code: g.errorCode,
            severity: g.severity,
            count: g._count.id,
          })),
          byRoute: byRoute.map((g) => ({
            route: g.route,
            method: g.method,
            count: g._count.id,
          })),
          byStatus: byStatus.map((g) => ({
            status: g.httpStatus,
            count: g._count.id,
          })),
          bySeverity: bySeverity.map((g) => ({
            severity: g.severity,
            count: g._count.id,
          })),
        },
        topErrors: topErrors.slice(0, 10).map((e) => ({
          code: e.errorCode,
          message: e.message,
          severity: e.severity,
        })),
        anomalies: anomalies.map((a) => ({
          ip: a.ipAddress,
          scope: a.scope,
          requestCount: a.requestCount,
          windowSeconds: a.windowSeconds,
          detectedAt: a.detectedAt.toISOString(),
        })),
        affectedUsers: affectedUsers.map((u) => ({
          userId: u.userId,
          errorCount: u._count.id,
        })),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error({ action: 'admin.errors.failed', error: message });
    return ErrorFactory.internalServerError('Failed to fetch error statistics');
  }
}
