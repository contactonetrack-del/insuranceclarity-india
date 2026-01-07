/**
 * Structured Logger
 * A simple structured logging utility for consistent log formatting.
 * In production, consider using Pino or Winston with log aggregation.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
    level: LogLevel
    message: string
    timestamp: string
    [key: string]: unknown
}

const LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
}

const CURRENT_LOG_LEVEL: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info'

function shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[CURRENT_LOG_LEVEL]
}

function formatLog(entry: LogEntry): string {
    return JSON.stringify(entry)
}

function createLogEntry(level: LogLevel, message: string, data?: Record<string, unknown>): LogEntry {
    return {
        level,
        message,
        timestamp: new Date().toISOString(),
        ...data,
    }
}

export const logger = {
    debug(message: string, data?: Record<string, unknown>) {
        if (shouldLog('debug')) {
            console.debug(formatLog(createLogEntry('debug', message, data)))
        }
    },

    info(message: string, data?: Record<string, unknown>) {
        if (shouldLog('info')) {
            console.info(formatLog(createLogEntry('info', message, data)))
        }
    },

    warn(message: string, data?: Record<string, unknown>) {
        if (shouldLog('warn')) {
            console.warn(formatLog(createLogEntry('warn', message, data)))
        }
    },

    error(message: string, error?: Error | unknown, data?: Record<string, unknown>) {
        if (shouldLog('error')) {
            const errorData = error instanceof Error
                ? { errorName: error.name, errorMessage: error.message, stack: error.stack }
                : { error }
            console.error(formatLog(createLogEntry('error', message, { ...errorData, ...data })))
        }
    },

    // Log API requests
    request(method: string, path: string, statusCode: number, duration: number, data?: Record<string, unknown>) {
        this.info('API Request', {
            method,
            path,
            statusCode,
            duration: `${duration}ms`,
            ...data,
        })
    },
}

export default logger
