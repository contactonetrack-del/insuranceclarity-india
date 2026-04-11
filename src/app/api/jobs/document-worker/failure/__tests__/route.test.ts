import { beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from '../route'

const {
    mockVerifyQstashRequestSignature,
    mockRedisIsConfigured,
    mockRedisSet,
    mockMarkScanFailed,
    mockCaptureEvent,
} = vi.hoisted(() => ({
    mockVerifyQstashRequestSignature: vi.fn(),
    mockRedisIsConfigured: vi.fn(),
    mockRedisSet: vi.fn(),
    mockMarkScanFailed: vi.fn(),
    mockCaptureEvent: vi.fn(),
}))

vi.mock('@/lib/queue/config', () => ({
    verifyQstashRequestSignature: mockVerifyQstashRequestSignature,
}))

vi.mock('@/lib/cache/redis', () => ({
    redisClient: {
        isConfigured: mockRedisIsConfigured,
        set: mockRedisSet,
    },
}))

vi.mock('@/services/report.service', () => ({
    markScanFailed: mockMarkScanFailed,
}))

vi.mock('@sentry/nextjs', () => ({
    captureEvent: mockCaptureEvent,
}))

vi.mock('@/lib/logger', () => ({
    logger: {
        error: vi.fn(),
    },
}))

describe('POST /api/jobs/document-worker/failure', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockVerifyQstashRequestSignature.mockResolvedValue(true)
        mockRedisIsConfigured.mockReturnValue(true)
        mockRedisSet.mockResolvedValue(undefined)
        mockMarkScanFailed.mockResolvedValue(undefined)
    })

    it('returns 401 when signature is missing', async () => {
        const response = await POST(
            new Request('http://localhost:3000/api/jobs/document-worker/failure', {
                method: 'POST',
                body: JSON.stringify({}),
            }),
        )
        const json = await response.json()

        expect(response.status).toBe(401)
        expect(json).toEqual({ error: 'Unauthorized' })
        expect(mockVerifyQstashRequestSignature).not.toHaveBeenCalled()
    })

    it('returns 401 when signature verification fails', async () => {
        mockVerifyQstashRequestSignature.mockResolvedValue(false)

        const response = await POST(
            new Request('http://localhost:3000/api/jobs/document-worker/failure', {
                method: 'POST',
                headers: {
                    'upstash-signature': 'invalid',
                },
                body: JSON.stringify({}),
            }),
        )
        const json = await response.json()

        expect(response.status).toBe(401)
        expect(json).toEqual({ error: 'Unauthorized' })
    })

    it('returns 401 when signature verification throws', async () => {
        mockVerifyQstashRequestSignature.mockRejectedValueOnce(new Error('signature verifier unavailable'))

        const response = await POST(
            new Request('http://localhost:3000/api/jobs/document-worker/failure', {
                method: 'POST',
                headers: {
                    'upstash-signature': 'invalid',
                },
                body: JSON.stringify({}),
            }),
        )
        const json = await response.json()

        expect(response.status).toBe(401)
        expect(json).toEqual({ error: 'Unauthorized' })
    })

    it('dead-letters job payload and marks scan failed when signature is valid', async () => {
        const body = JSON.stringify({
            body: JSON.stringify({
                jobId: 'job_1',
                jobName: 'PROCESS_SCAN_ANALYSIS',
                payload: { scanId: 'scan_1' },
            }),
        })

        const response = await POST(
            new Request('http://localhost:3000/api/jobs/document-worker/failure', {
                method: 'POST',
                headers: {
                    'upstash-signature': 'valid',
                    'upstash-failure-cause': 'delivery_exhausted',
                },
                body,
            }),
        )
        const json = await response.json()

        expect(response.status).toBe(200)
        expect(json).toEqual({ ok: true })
        expect(mockRedisSet).toHaveBeenCalledWith(
            'queue:dead-letter:job_1',
            expect.objectContaining({
                deadLetterId: 'job_1',
                jobId: 'job_1',
                jobName: 'PROCESS_SCAN_ANALYSIS',
                scanId: 'scan_1',
                reason: 'delivery_exhausted',
            }),
            { ex: 604800 },
        )
        expect(mockMarkScanFailed).toHaveBeenCalledWith('scan_1')
        expect(mockCaptureEvent).toHaveBeenCalledTimes(1)
    })

    it('skips dead-letter persistence when redis is not configured', async () => {
        mockRedisIsConfigured.mockReturnValue(false)

        const body = JSON.stringify({
            body: JSON.stringify({
                jobId: 'job_no_redis',
                jobName: 'GENERATE_QUOTE_DOCUMENT',
                payload: { quoteId: 'quote_1' },
            }),
        })

        const response = await POST(
            new Request('http://localhost:3000/api/jobs/document-worker/failure', {
                method: 'POST',
                headers: {
                    'upstash-signature': 'valid',
                },
                body,
            }),
        )
        const json = await response.json()

        expect(response.status).toBe(200)
        expect(json).toEqual({ ok: true })
        expect(mockRedisSet).not.toHaveBeenCalled()
        expect(mockCaptureEvent).toHaveBeenCalledTimes(1)
    })

    it('returns ok even when markScanFailed errors', async () => {
        mockMarkScanFailed.mockRejectedValueOnce(new Error('scan update failed'))

        const body = JSON.stringify({
            body: JSON.stringify({
                jobId: 'job_scan_fail',
                jobName: 'PROCESS_SCAN_ANALYSIS',
                payload: { scanId: 'scan_2' },
            }),
        })

        const response = await POST(
            new Request('http://localhost:3000/api/jobs/document-worker/failure', {
                method: 'POST',
                headers: {
                    'upstash-signature': 'valid',
                    'upstash-failure-cause': 'delivery_exhausted',
                },
                body,
            }),
        )
        const json = await response.json()

        expect(response.status).toBe(200)
        expect(json).toEqual({ ok: true })
        expect(mockMarkScanFailed).toHaveBeenCalledWith('scan_2')
        expect(mockCaptureEvent).toHaveBeenCalledTimes(1)
    })
})
