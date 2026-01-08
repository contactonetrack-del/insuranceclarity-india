/**
 * Structured Logger for Insurance Platform
 * 
 * Uses Pino for high-performance, JSON-structured logging.
 * Safe for production with PII masking integration.
 */

import pino from 'pino';
import { maskEmail, maskPhone, maskAadhaar, maskPAN, maskPolicyNo } from './pii-mask';

// Determine log level based on environment
const LOG_LEVEL = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

// Base logger configuration
const baseConfig: pino.LoggerOptions = {
    level: LOG_LEVEL,
    base: {
        app: 'insurance-clarity',
        env: process.env.NODE_ENV,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
};

// Pretty print in development
const devConfig: pino.LoggerOptions = {
    ...baseConfig,
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
        },
    },
};

// Production config (JSON for log aggregation)
const prodConfig: pino.LoggerOptions = {
    ...baseConfig,
    // Add custom serializers for production
    formatters: {
        level: (label) => ({ level: label }),
    },
};

// Create the logger instance
export const logger = pino(
    process.env.NODE_ENV === 'production' ? prodConfig : devConfig
);

// ============================================
// SAFE LOGGING HELPERS (with PII masking)
// ============================================

interface SafeUserContext {
    userId?: string;
    email?: string;
    phone?: string;
    aadhaar?: string;
    pan?: string;
}

/**
 * Create a safe user context with masked PII
 */
export function createSafeUserContext(user: SafeUserContext): Record<string, string> {
    const safe: Record<string, string> = {};

    if (user.userId) safe.userId = user.userId;
    if (user.email) safe.email = maskEmail(user.email);
    if (user.phone) safe.phone = maskPhone(user.phone);
    if (user.aadhaar) safe.aadhaar = maskAadhaar(user.aadhaar);
    if (user.pan) safe.pan = maskPAN(user.pan);

    return safe;
}

interface SafePolicyContext {
    policyId?: string;
    policyNo?: string;
    category?: string;
    provider?: string;
}

/**
 * Create a safe policy context with masked policy numbers
 */
export function createSafePolicyContext(policy: SafePolicyContext): Record<string, string> {
    const safe: Record<string, string> = {};

    if (policy.policyId) safe.policyId = policy.policyId;
    if (policy.policyNo) safe.policyNo = maskPolicyNo(policy.policyNo);
    if (policy.category) safe.category = policy.category;
    if (policy.provider) safe.provider = policy.provider;

    return safe;
}

// ============================================
// DOMAIN-SPECIFIC LOGGERS
// ============================================

/**
 * Log API request/response (for middleware)
 */
export function logApiRequest(
    method: string,
    path: string,
    statusCode: number,
    durationMs: number,
    metadata?: Record<string, unknown>
): void {
    const logData = {
        type: 'api_request',
        method,
        path,
        statusCode,
        durationMs,
        ...metadata,
    };

    if (statusCode >= 500) {
        logger.error(logData, 'API request failed');
    } else if (statusCode >= 400) {
        logger.warn(logData, 'API request client error');
    } else if (durationMs > 500) {
        logger.warn(logData, 'API request slow');
    } else {
        logger.info(logData, 'API request completed');
    }
}

/**
 * Log insurance-specific events
 */
export function logInsuranceEvent(
    event: string,
    category: string,
    metadata?: Record<string, unknown>
): void {
    logger.info({
        type: 'insurance_event',
        event,
        category,
        ...metadata,
    }, `Insurance event: ${event}`);
}

/**
 * Log database query performance
 */
export function logDbQuery(
    model: string,
    action: string,
    durationMs: number,
    metadata?: Record<string, unknown>
): void {
    const logData = {
        type: 'db_query',
        model,
        action,
        durationMs,
        ...metadata,
    };

    if (durationMs > 200) {
        logger.warn(logData, 'Slow database query');
    } else {
        logger.debug(logData, 'Database query');
    }
}

/**
 * Log security events
 */
export function logSecurityEvent(
    event: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    metadata?: Record<string, unknown>
): void {
    const logData = {
        type: 'security_event',
        event,
        severity,
        ...metadata,
    };

    if (severity === 'critical' || severity === 'high') {
        logger.error(logData, `Security event: ${event}`);
    } else if (severity === 'medium') {
        logger.warn(logData, `Security event: ${event}`);
    } else {
        logger.info(logData, `Security event: ${event}`);
    }
}

export default logger;
