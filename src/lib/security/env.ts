import { logger } from '@/lib/logger';

const PLACEHOLDER_MARKERS = [
    'replace_with',
    'placeholder',
    'change_me',
    'change-me',
    'example',
    'mock',
    'dummy',
    'todo',
];

function normalized(value: string | null | undefined): string {
    return value?.trim().toLowerCase() ?? '';
}

export function isPlaceholderValue(value: string | null | undefined): boolean {
    const v = normalized(value);
    if (!v) return true;

    return PLACEHOLDER_MARKERS.some((marker) => v.includes(marker));
}

type SubscriptionPlan = 'PRO' | 'ENTERPRISE';

function shouldEnforceHostedProductionChecks(): boolean {
    return process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production';
}

export function requireStrongNextAuthSecret(): string {
    const secret = process.env.NEXTAUTH_SECRET?.trim() ?? '';
    const isWeak = secret.length < 32 || isPlaceholderValue(secret) || secret.includes('insurance-clarity-secret-key');

    if (isWeak) {
        const message =
            'NEXTAUTH_SECRET is weak or placeholder. Generate a secure secret: openssl rand -base64 32';

        if (process.env.NODE_ENV === 'production') {
            throw new Error(message);
        }

        logger.warn({ action: 'auth.secret.weak', message });
    }

    return secret;
}

export function getGoogleOAuthConfig(): { clientId: string; clientSecret: string } | null {
    const clientId = process.env.GOOGLE_CLIENT_ID?.trim() ?? '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim() ?? '';

    const invalid =
        !clientId ||
        !clientSecret ||
        isPlaceholderValue(clientId) ||
        isPlaceholderValue(clientSecret);

    if (!invalid) {
        return { clientId, clientSecret };
    }

    const message =
        'Google OAuth credentials are missing or placeholder values. Configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.';

    if (process.env.NODE_ENV === 'production') {
        throw new Error(message);
    }

    logger.warn({ action: 'auth.google.disabled', message });
    return null;
}

export function getRazorpayCredentials(): { keyId: string; keySecret: string; webhookSecret: string } {
    const keyId = process.env.RAZORPAY_KEY_ID?.trim() ?? '';
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim() ?? '';
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim() ?? '';

    if (!keyId || !keySecret || isPlaceholderValue(keyId) || isPlaceholderValue(keySecret)) {
        throw new Error('Razorpay credentials are missing or placeholder values.');
    }

    if (!webhookSecret || isPlaceholderValue(webhookSecret)) {
        logger.warn({ action: 'payment.webhook.unconfigured', message: 'RAZORPAY_WEBHOOK_SECRET is missing. Webhooks will fail verification.' });
    }

    if (process.env.NODE_ENV === 'production' && keyId.startsWith('rzp_test_')) {
        throw new Error('Razorpay is configured with test keys in production. Use live keys before launch.');
    }

    return { keyId, keySecret, webhookSecret };
}

export function getRazorpayPublicKeyId(expectedKeyId?: string): string {
    const publicKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() ?? '';

    if (!publicKeyId || isPlaceholderValue(publicKeyId)) {
        throw new Error('NEXT_PUBLIC_RAZORPAY_KEY_ID is missing or placeholder.');
    }

    if (process.env.NODE_ENV === 'production' && publicKeyId.startsWith('rzp_test_')) {
        throw new Error('NEXT_PUBLIC_RAZORPAY_KEY_ID is a test key in production. Use live keys before launch.');
    }

    if (expectedKeyId && publicKeyId !== expectedKeyId) {
        throw new Error('Razorpay public key mismatch: NEXT_PUBLIC_RAZORPAY_KEY_ID must match RAZORPAY_KEY_ID.');
    }

    return publicKeyId;
}

export function getRazorpayPlanId(plan: SubscriptionPlan): string {
    const envKey = plan === 'PRO' ? 'RAZORPAY_PLAN_ID_PRO' : 'RAZORPAY_PLAN_ID_ENTERPRISE';
    const planId = process.env[envKey]?.trim() ?? '';

    if (!planId || isPlaceholderValue(planId)) {
        throw new Error(`Razorpay plan ID is missing for ${plan}. Configure ${envKey}.`);
    }

    if (!/^plan_[A-Za-z0-9_]+$/.test(planId)) {
        throw new Error(`Invalid ${envKey} format. Expected a Razorpay plan id like plan_xxxxx.`);
    }

    if (process.env.NODE_ENV === 'production' && planId.toLowerCase().includes('test')) {
        throw new Error(`${envKey} appears to reference a test plan. Use a live Razorpay plan before launch.`);
    }

    return planId;
}

export function getResendApiKey(): string {
    const apiKey = process.env.RESEND_API_KEY?.trim() ?? '';

    if (!apiKey || isPlaceholderValue(apiKey)) {
        const message = 'RESEND_API_KEY is missing or placeholder. Emails will not be sent.';

        if (process.env.NODE_ENV === 'production') {
            throw new Error(message);
        }

        logger.warn({ action: 'email.resend_key.missing', message });
    }

    return apiKey;
}

export function getSanityConfig(): { projectId: string; dataset: string; isConfigured: boolean } {
    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() ?? '';
    const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() ?? '';

    const isConfigured =
        Boolean(projectId) &&
        Boolean(dataset) &&
        !isPlaceholderValue(projectId) &&
        !isPlaceholderValue(dataset);

    if (isConfigured) {
        return { projectId, dataset, isConfigured: true };
    }

    const message =
        'Sanity project configuration is missing or placeholder. Configure NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET.';

    if (shouldEnforceHostedProductionChecks()) {
        throw new Error(message);
    }

    logger.warn({ action: 'sanity.config.missing', message });
    return {
        projectId: 'missing-project-id',
        dataset: 'production',
        isConfigured: false,
    };
}

/**
 * Returns the Sanity API token.
 * NOTE: Ensure this token only has 'Viewer' (Read-only) scope for production SSR
 * unless write operations are explicitly required.
 */
export function getSanityToken(): string | null {
    const token = process.env.SANITY_API_TOKEN?.trim() ?? '';
    if (!token || isPlaceholderValue(token)) return null;

    if (process.env.NODE_ENV === 'production' && token.length > 50) {
        logger.warn({
            action: 'sanity.token.scope_check',
            message: 'SANITY_API_TOKEN detected. Verify it is restricted to READ-ONLY scope for production safety.'
        });
    }

    return token;
}

export function validateAlertConfig(): { discord: string | null; slack: string | null } {
    const discord = process.env.DISCORD_WEBHOOK_URL?.trim() ?? '';
    const slack = process.env.SLACK_WEBHOOK_URL?.trim() ?? '';

    const hasDiscord = Boolean(discord) && !isPlaceholderValue(discord);
    const hasSlack = Boolean(slack) && !isPlaceholderValue(slack);

    if (!hasDiscord && !hasSlack) {
        const message = 'No monitoring webhooks (DISCORD_WEBHOOK_URL or SLACK_WEBHOOK_URL) are configured. Operational alerts will be silent.';

        if (process.env.NODE_ENV === 'production') {
            // We don't throw here to avoid blocking boot, but we log a heavy error
            logger.error({ action: 'alerts.config.missing', message });
        } else {
            logger.warn({ action: 'alerts.config.missing', message });
        }
    }

    return {
        discord: hasDiscord ? discord : null,
        slack: hasSlack ? slack : null,
    };
}
