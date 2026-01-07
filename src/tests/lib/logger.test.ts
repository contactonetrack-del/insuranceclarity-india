import { describe, it, expect } from 'vitest'
import logger from '@/lib/logger'

describe('logger', () => {
    it('has debug method', () => {
        expect(typeof logger.debug).toBe('function')
    })

    it('has info method', () => {
        expect(typeof logger.info).toBe('function')
    })

    it('has warn method', () => {
        expect(typeof logger.warn).toBe('function')
    })

    it('has error method', () => {
        expect(typeof logger.error).toBe('function')
    })

    it('has request method', () => {
        expect(typeof logger.request).toBe('function')
    })

    it('logs info messages with data', () => {
        const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => { })

        logger.info('Test message', { key: 'value' })

        expect(consoleSpy).toHaveBeenCalled()
        const logOutput = consoleSpy.mock.calls[0][0]
        const parsed = JSON.parse(logOutput)

        expect(parsed.level).toBe('info')
        expect(parsed.message).toBe('Test message')
        expect(parsed.key).toBe('value')
        expect(parsed.timestamp).toBeDefined()

        consoleSpy.mockRestore()
    })

    it('logs errors with error details', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })
        const testError = new Error('Test error')

        logger.error('Error occurred', testError)

        expect(consoleSpy).toHaveBeenCalled()
        const logOutput = consoleSpy.mock.calls[0][0]
        const parsed = JSON.parse(logOutput)

        expect(parsed.level).toBe('error')
        expect(parsed.message).toBe('Error occurred')
        expect(parsed.errorName).toBe('Error')
        expect(parsed.errorMessage).toBe('Test error')
        expect(parsed.stack).toBeDefined()

        consoleSpy.mockRestore()
    })

    it('logs request with all details', () => {
        const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => { })

        logger.request('GET', '/api/test', 200, 150)

        expect(consoleSpy).toHaveBeenCalled()
        const logOutput = consoleSpy.mock.calls[0][0]
        const parsed = JSON.parse(logOutput)

        expect(parsed.method).toBe('GET')
        expect(parsed.path).toBe('/api/test')
        expect(parsed.statusCode).toBe(200)
        expect(parsed.duration).toBe('150ms')

        consoleSpy.mockRestore()
    })
})

import { vi } from 'vitest'
