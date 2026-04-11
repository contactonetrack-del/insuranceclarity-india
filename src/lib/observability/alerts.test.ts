import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { sendUrgentWebhook } from './alerts'

const { mockLoggerWarn, mockLoggerError } = vi.hoisted(() => ({
    mockLoggerWarn: vi.fn(),
    mockLoggerError: vi.fn(),
}))

vi.mock('@/lib/logger', () => ({
    logger: {
        warn: mockLoggerWarn,
        error: mockLoggerError,
    },
}))

describe('sendUrgentWebhook', () => {
    const fetchMock = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        vi.stubGlobal('fetch', fetchMock)
        vi.stubEnv('DISCORD_WEBHOOK_URL', '')
        vi.stubEnv('SLACK_WEBHOOK_URL', '')
        vi.stubEnv('NODE_ENV', 'test')
    })

    afterEach(() => {
        vi.unstubAllEnvs()
        vi.unstubAllGlobals()
    })

    it('logs and skips when no alert webhooks are configured', async () => {
        await sendUrgentWebhook('Queue Spike', 'Dead-letter queue is growing', 'WARNING')

        expect(fetchMock).not.toHaveBeenCalled()
        expect(mockLoggerWarn).toHaveBeenCalledWith(
            expect.objectContaining({
                action: 'observability.webhook.skipped',
            }),
        )
    })

    it('posts to all configured webhook destinations', async () => {
        process.env.DISCORD_WEBHOOK_URL = 'https://discord.example/webhook'
        process.env.SLACK_WEBHOOK_URL = 'https://slack.example/webhook'
        fetchMock.mockResolvedValue({ ok: true })

        await sendUrgentWebhook('Payment Drift', 'Mismatch detected', 'CRITICAL')

        expect(fetchMock).toHaveBeenCalledTimes(2)
        expect(fetchMock).toHaveBeenNthCalledWith(
            1,
            'https://discord.example/webhook',
            expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            }),
        )
        expect(fetchMock).toHaveBeenNthCalledWith(
            2,
            'https://slack.example/webhook',
            expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            }),
        )
    })

    it('logs transport failures but continues to the next destination', async () => {
        process.env.DISCORD_WEBHOOK_URL = 'https://discord.example/webhook'
        process.env.SLACK_WEBHOOK_URL = 'https://slack.example/webhook'
        fetchMock
            .mockRejectedValueOnce(new Error('discord unavailable'))
            .mockResolvedValueOnce({ ok: true })

        await sendUrgentWebhook('Cron Failure', 'Daily cron failed', 'FATAL')

        expect(fetchMock).toHaveBeenCalledTimes(2)
        expect(mockLoggerError).toHaveBeenCalledWith(
            expect.objectContaining({
                action: 'observability.webhook.failed',
                error: 'Error: discord unavailable',
            }),
        )
    })
})
