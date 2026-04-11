export const USER_ROLES = ['GUEST', 'CUSTOMER', 'AGENT', 'ADMIN'] as const;
export type UserRole = typeof USER_ROLES[number];

export const USER_PLANS = ['FREE', 'PRO', 'ENTERPRISE'] as const;
export type UserPlan = typeof USER_PLANS[number];

export const PAYMENT_PLANS = ['SCAN_UNLOCK', 'PRO', 'ENTERPRISE'] as const;
export type PaymentPlan = typeof PAYMENT_PLANS[number];

export const SUBSCRIPTION_PLANS = ['PRO', 'ENTERPRISE'] as const;
export type SubscriptionPlan = typeof SUBSCRIPTION_PLANS[number];

export const LEAD_STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'CLOSED', 'LOST'] as const;
export type LeadStatus = typeof LEAD_STATUSES[number];

export const LEAD_SOURCES = ['ORGANIC', 'REFERRAL', 'PAID', 'SOCIAL', 'EMAIL'] as const;
export type LeadSource = typeof LEAD_SOURCES[number];

export const QUOTE_STATUSES = ['PENDING', 'READY', 'FAILED'] as const;
export type QuoteStatus = typeof QUOTE_STATUSES[number];

function normalizeAllowedValue<TAllowed extends readonly string[]>(
    value: string | null | undefined,
    allowed: TAllowed,
    fallback: TAllowed[number],
): TAllowed[number] {
    const normalized = value?.trim().toUpperCase();

    if (normalized && allowed.includes(normalized as TAllowed[number])) {
        return normalized as TAllowed[number];
    }

    return fallback;
}

export function normalizeUserRole(value?: string | null): UserRole {
    return normalizeAllowedValue(value, USER_ROLES, 'CUSTOMER');
}

export function normalizeUserPlan(value?: string | null): UserPlan {
    return normalizeAllowedValue(value, USER_PLANS, 'FREE');
}

export function normalizeLeadStatus(value?: string | null): LeadStatus {
    return normalizeAllowedValue(value, LEAD_STATUSES, 'NEW');
}

export function normalizeLeadSource(value?: string | null): LeadSource {
    return normalizeAllowedValue(value, LEAD_SOURCES, 'ORGANIC');
}

export function normalizeQuoteStatus(value?: string | null): QuoteStatus {
    return normalizeAllowedValue(value, QUOTE_STATUSES, 'PENDING');
}

export function deriveLeadSource(params: {
    source?: string | null;
    sourceUrl?: string | null;
}): LeadSource {
    const explicit = normalizeLeadSource(params.source);
    if (params.source && explicit !== 'ORGANIC') {
        return explicit;
    }

    const haystack = [params.source, params.sourceUrl]
        .filter((value): value is string => Boolean(value?.trim()))
        .join(' ')
        .toLowerCase();

    if (!haystack) {
        return 'ORGANIC';
    }

    if (/(gclid|fbclid|utm_medium=(cpc|ppc|paid|display)|\bpaid\b|\bads?\b|\badwords\b|\bcampaign\b)/.test(haystack)) {
        return 'PAID';
    }

    if (/(referral|refer|affiliate|partner)/.test(haystack)) {
        return 'REFERRAL';
    }

    if (/(instagram|facebook|linkedin|twitter|x\.com|youtube|whatsapp|\bsocial\b)/.test(haystack)) {
        return 'SOCIAL';
    }

    if (/(newsletter|email|mailchimp|resend|subscriber)/.test(haystack)) {
        return 'EMAIL';
    }

    return 'ORGANIC';
}
