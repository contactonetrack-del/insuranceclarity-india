/**
 * Rate Limit Anomaly Detection
 *
 * Monitors for unusual rate limiting patterns that indicate abuse or DDoS.
 * Triggers alerts when rate limit thresholds are exceeded.
 */

import { logger } from '@/lib/logger';
import { reportRepository } from '@/repositories/report.repository';

export interface RateLimitAnomaly {
  ipAddress: string;
  scope: string; // 'leads', 'uploads', 'ai-requests', etc.
  requestCount: number;
  windowSeconds: number;
}

/**
 * Alert thresholds (triggers email/Slack alert)
 */
const ALERT_THRESHOLDS = {
  // If >10 IPs hit rate limit in 5-minute window
  SPIKE_IP_COUNT: 10,
  SPIKE_WINDOW_MS: 5 * 60 * 1000,

  // If single IP gets >80% of quota
  SINGLE_IP_QUOTA_PCT: 0.8,

  // If any scope gets >100 rate limit hits/min
  SCOPE_SPIKE_COUNT: 100,
  SCOPE_SPIKE_WINDOW_MS: 60 * 1000,
};

class AnomalyDetector {
  private recentAnomalies: Map<string, number> = new Map(); // key -> timestamp
  private readonly ALERT_COOLDOWN_MS = 5 * 60 * 1000; // Don't re-alert within 5 min

  /**
   * Detect rate limit anomaly
   */
  async detectAnomaly(anomaly: RateLimitAnomaly): Promise<void> {
    try {
      // Store anomaly in database
      await reportRepository.createRateLimitAnomaly({
        ipAddress: anomaly.ipAddress,
        scope: anomaly.scope,
        requestCount: anomaly.requestCount,
        windowSeconds: anomaly.windowSeconds,
      }).catch((err) => {
        logger.warn({
          action: 'anomaly.store.failed',
          error: err instanceof Error ? err.message : String(err),
        });
      });

      // Check if this warrants an alert
      await this.checkAlertConditions(anomaly);
    } catch (err) {
      logger.error({
        action: 'anomaly_detector.detect.failed',
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  /**
   * Check if anomaly exceeds alert thresholds
   */
  private async checkAlertConditions(anomaly: RateLimitAnomaly): Promise<void> {
    const key = `anomaly:${anomaly.scope}`;
    const lastAlertTime = this.recentAnomalies.get(key) || 0;
    const now = Date.now();

    // Skip if we've alerted recently
    if (now - lastAlertTime < this.ALERT_COOLDOWN_MS) {
      return;
    }

    // Check spike in recent anomalies
    try {
      const recentCount = await reportRepository.countRecentRateLimitAnomaliesByScope(
        anomaly.scope,
        new Date(now - ALERT_THRESHOLDS.SCOPE_SPIKE_WINDOW_MS),
      );

      if (recentCount > ALERT_THRESHOLDS.SCOPE_SPIKE_COUNT) {
        await this.sendAlert({
          type: 'RATE_LIMIT_SPIKE',
          scope: anomaly.scope,
          count: recentCount,
          period: 'last 1 minute',
        });

        this.recentAnomalies.set(key, now);
      }
    } catch (err) {
      logger.error({
        action: 'anomaly_detector.check_alert.failed',
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  /**
   * Send alert (email, Slack, etc.)
   */
  private async sendAlert(details: {
    type: string;
    scope: string;
    count: number;
    period: string;
  }): Promise<void> {
    logger.warn({
      action: 'rate_limit_alert',
      ...details,
    });

    // TODO: Implement email/Slack notification
    // For now, just log it
  }

  /**
   * Get anomalies for a given scope
   */
  async getAnomalies(scope: string, hoursBack: number = 1) {
    try {
      const since = new Date();
      since.setHours(since.getHours() - hoursBack);

      const anomalies = await reportRepository.listRateLimitAnomaliesByScope(scope, since, 100);

      return anomalies;
    } catch (err) {
      logger.error({
        action: 'anomaly_detector.get_anomalies.failed',
        scope,
        error: err instanceof Error ? err.message : String(err),
      });
      return [];
    }
  }

  /**
   * Check if IP should be rate limited at next request
   */
  async shouldBlockIP(ipAddress: string): Promise<boolean> {
    try {
      // Get recent anomalies for this IP
      const recentAnomalies = await reportRepository.countRecentRateLimitAnomaliesByIp(
        ipAddress,
        new Date(Date.now() - 5 * 60 * 1000),
      );

      // Block if >5 anomalies in 5 minute window
      return recentAnomalies > 5;
    } catch (err) {
      logger.error({
        action: 'anomaly_detector.should_block.failed',
        ipAddress,
        error: err instanceof Error ? err.message : String(err),
      });
      return false;
    }
  }
}

export const anomalyDetector = new AnomalyDetector();
