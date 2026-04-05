import { logger } from '@/lib/logger';

/**
 * sendUrgentWebhook
 * 
 * Bypasses standard telemetry to immediately notify Ops of critical revenue drops, 
 * cron failures, or systemic AI failures via Discord/Slack webhooks.
 */
export async function sendUrgentWebhook(
    title: string, 
    message: string, 
    severity: 'WARNING' | 'CRITICAL' | 'FATAL' = 'WARNING'
) {
    const webhookUrls = [
        process.env.DISCORD_WEBHOOK_URL,
        process.env.SLACK_WEBHOOK_URL
    ].filter(Boolean) as string[];

    if (webhookUrls.length === 0) {
        logger.warn({ 
            action: 'observability.webhook.skipped', 
            reason: 'No webhook URLs configured',
            message: `${severity}: ${title} - ${message}` 
        });
        return;
    }

    const payload = {
        content: `**[${severity}] ${title}**\n${message}\n*Environment: ${process.env.NODE_ENV}*`
    };

    for (const url of webhookUrls) {
        try {
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (error) {
            logger.error({ 
                action: 'observability.webhook.failed', 
                error: String(error) 
            });
        }
    }
}
