/**
 * Error Context Capture
 *
 * Captures browser, network, and user context for failed API requests.
 * Useful for debugging and support tickets.
 */

import type { RequestContext } from './api-client';

interface BrowserNetworkConnection {
  effectiveType?: string;
  downlink?: number;
}

interface NavigatorWithConnection extends Navigator {
  connection?: BrowserNetworkConnection;
}

export interface ErrorContext {
  browser: {
    userAgent: string;
    viewport: { width: number; height: number };
    timezone: string;
  };
  network: {
    latencyMs?: number;
    effectiveType?: string;
    connectionDownlink?: number;
  };
  user: {
    sessionId: string; // NOT authentication token - just a client session ID
  };
  request: {
    method: string;
    url: string;
    payloadSize?: number;
    timestamp: string;
  };
}

/**
 * Capture current browser context
 */
export function captureBrowserContext(): ErrorContext['browser'] {
  const viewport =
    typeof window !== 'undefined'
      ? {
          width: window.innerWidth,
          height: window.innerHeight,
        }
      : { width: 0, height: 0 };

  return {
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    viewport,
    timezone: (typeof Intl !== 'undefined' && Intl.DateTimeFormat().resolvedOptions().timeZone) || 'unknown',
  };
}

/**
 * Capture network metrics
 */
export function captureNetworkContext(): ErrorContext['network'] {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return {};
  }

  const connection = (navigator as NavigatorWithConnection).connection;
  return {
    effectiveType: connection?.effectiveType,
    connectionDownlink: connection?.downlink,
  };
}

/**
 * Get or create session ID
 */
function getSessionId(): string {
  const key = '_ic_session_id';

  if (typeof sessionStorage === 'undefined') {
    return 'unknown';
  }

  let sessionId = sessionStorage.getItem(key);
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem(key, sessionId);
  }

  return sessionId;
}

/**
 * Full context capture utility
 */
export function captureErrorContext(requestContext: RequestContext, payloadSize?: number): ErrorContext {
  return {
    browser: captureBrowserContext(),
    network: captureNetworkContext(),
    user: {
      sessionId: getSessionId(),
    },
    request: {
      method: requestContext.method,
      url: requestContext.url,
      payloadSize,
      timestamp: new Date(requestContext.timestamp).toISOString(),
    },
  };
}

/**
 * Format context for logging/reporting
 */
export function formatErrorContext(context: ErrorContext): string {
  return `
Browser: ${context.browser.userAgent}
Viewport: ${context.browser.viewport.width}x${context.browser.viewport.height}
Timezone: ${context.browser.timezone}
Network: ${context.network.effectiveType || 'unknown'}
Session: ${context.user.sessionId}
Method: ${context.request.method}
URL: ${context.request.url}
Timestamp: ${context.request.timestamp}
  `.trim();
}
