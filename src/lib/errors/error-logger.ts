/**
 * Error logging utility
 * Logs errors to database and tracks error statistics
 */

import { ApiError, ErrorCode, ErrorSeverity } from './api-error';

export interface ErrorLogEntry {
  errorCode: ErrorCode;
  message: string;
  route?: string;
  method?: string;
  httpStatus: number;
  severity: ErrorSeverity;
  userId?: string;
  ipAddress?: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}

/**
 * Error logger - stores errors for monitoring
 */
export class ErrorLogger {
  private logs: ErrorLogEntry[] = [];
  private maxLogs = 10000; // In-memory buffer size

  /**
   * Log an error
   */
  log(error: ApiError | Error, context?: Partial<ErrorLogEntry>): void {
    const entry: ErrorLogEntry = {
      errorCode: (error instanceof ApiError ? error.code : 'INTERNAL_SERVER_ERROR') as ErrorCode,
      message: error.message,
      httpStatus: error instanceof ApiError ? error.status : 500,
      severity: error instanceof ApiError ? error.severity : 'CRITICAL',
      timestamp: new Date(),
      ...context,
    };

    this.logs.push(entry);

    // Keep buffer size manageable
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Optionally save to database in background (non-blocking)
    this.persistAsync(entry).catch(err => {
      console.error('Failed to persist error log:', err);
    });
  }

  /**
   * Get error statistics
   */
  getStats(filter?: { route?: string; errorCode?: ErrorCode; severity?: ErrorSeverity }) {
    const filtered = this.logs.filter(log => {
      if (filter?.route && log.route !== filter.route) return false;
      if (filter?.errorCode && log.errorCode !== filter.errorCode) return false;
      if (filter?.severity && log.severity !== filter.severity) return false;
      return true;
    });

    return {
      totalErrors: filtered.length,
      byErrorCode: this.groupBy(filtered, 'errorCode'),
      bySeverity: this.groupBy(filtered, 'severity'),
      byRoute: this.groupBy(filtered, 'route'),
      byHttp: this.groupBy(filtered, 'httpStatus'),
    };
  }

  /**
   * Get recent errors
   */
  getRecent(limit = 100): ErrorLogEntry[] {
    return this.logs.slice(-limit);
  }

  /**
   * Clear logs
   */
  clear(): void {
    this.logs = [];
  }

  /**
   * Persist error to database (non-blocking)
   * This is a placeholder - implementation depends on your database setup
   */
  private async persistAsync(_entry: ErrorLogEntry): Promise<void> {
    // This will be called in the background
    // The actual database write happens in the API route handler
    // For now, this is a no-op
  }

  /**
   * Group array by key
   */
  private groupBy(
    items: ErrorLogEntry[],
    key: keyof ErrorLogEntry
  ): Record<string, number> {
    return items.reduce(
      (acc, item) => {
        const value = String(item[key] ?? 'unknown');
        acc[value] = (acc[value] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }
}

/**
 * Global error logger instance
 */
export const errorLogger = new ErrorLogger();

type ErrorRequestContext = {
  headers?: Headers | Record<string, string>;
  nextUrl?: { pathname?: string };
  url?: string;
  method?: string;
  socket?: { remoteAddress?: string };
  user?: { id?: string };
};

function getHeaderValue(
  headers: Headers | Record<string, string> | undefined,
  key: string
): string | undefined {
  if (!headers) return undefined;

  if (headers instanceof Headers) {
    return headers.get(key) ?? undefined;
  }

  return headers[key];
}

/**
 * Context for error logging
 */
export function getErrorContext(req?: ErrorRequestContext): Partial<ErrorLogEntry> {
  if (!req) return {};

  const ip =
    getHeaderValue(req.headers, 'x-forwarded-for')?.split(',')[0] ||
    req.socket?.remoteAddress;

  return {
    route: req.nextUrl?.pathname ?? req.url,
    method: req.method,
    ipAddress: ip ? maskIpAddress(ip) : undefined,
    userId: req.user?.id,
  };
}

/**
 * Mask IP address for privacy (keep first 3 octets)
 */
function maskIpAddress(ip: string): string {
  const ipv4 = /^(\d+\.\d+\.\d+)\.\d+$/.exec(ip);
  if (ipv4) {
    return `${ipv4[1]}.xxx`;
  }
  // IPv6 or other format
  return ip.substring(0, ip.length / 2) + 'xxx';
}
