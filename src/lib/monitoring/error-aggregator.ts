/**
 * Error Aggregator Service
 *
 * Batches error logs for efficient database writes.
 * Prevents error-logging loops and handles high-frequency errors gracefully.
 */

import { logger } from '@/lib/logger';
import { logErrorEvent, ErrorEvent } from './error-events';

interface PendingError {
  event: ErrorEvent;
  timestamp: number;
}

class ErrorAggregator {
  private queue: PendingError[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private readonly BATCH_SIZE = 50;
  private readonly FLUSH_MS = 5000; // Flush every 5 seconds
  private readonly ERROR_DEDUP_MS = 10000; // Deduplicate within 10 seconds
  private lastErrorByKey: Map<string, number> = new Map();

  /**
   * Queue an error for batch logging
   */
  queueError(event: ErrorEvent): void {
    try {
      // Prevent duplicate logs within short window
      const key = `${event.code}:${event.route}:${event.userId || 'anon'}`;
      const now = Date.now();
      const lastTime = this.lastErrorByKey.get(key) || 0;

      if (now - lastTime < this.ERROR_DEDUP_MS) {
        return; // Deduplicated
      }

      this.lastErrorByKey.set(key, now);

      this.queue.push({
        event,
        timestamp: now,
      });

      // Flush if batch limit reached
      if (this.queue.length >= this.BATCH_SIZE) {
        void this.flush();
      } else if (!this.flushInterval) {
        // Start flush timer if not already running
        this.flushInterval = setTimeout(() => {
          void this.flush();
        }, this.FLUSH_MS);
      }
    } catch (err) {
      logger.error({
        action: 'error_aggregator.queue.failed',
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  /**
   * Flush pending errors to database
   */
  private async flush(): Promise<void> {
    if (this.queue.length === 0) {
      if (this.flushInterval) {
        clearTimeout(this.flushInterval);
        this.flushInterval = null;
      }
      return;
    }

    try {
      const eventsToLog = this.queue.splice(0, this.BATCH_SIZE);

      // Log each event individually (distributed across time)
      for (const { event } of eventsToLog) {
        await logErrorEvent(event).catch(() => {
          // Silently fail — logging errors shouldn't crash the app
        });
      }

      // Reschedule if more events pending
      if (this.queue.length > 0) {
        this.flushInterval = setTimeout(() => {
          void this.flush();
        }, this.FLUSH_MS);
      } else {
        this.flushInterval = null;
      }
    } catch (err) {
      logger.error({
        action: 'error_aggregator.flush.failed',
        count: this.queue.length,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  /**
   * Force flush all pending errors
   */
  async forceFlush(): Promise<void> {
    if (this.flushInterval) {
      clearTimeout(this.flushInterval);
      this.flushInterval = null;
    }

    while (this.queue.length >0) {
      await this.flush();
    }
  }
}

export const errorAggregator = new ErrorAggregator();
