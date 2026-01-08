/**
 * Analytics & Event Tracking for Insurance Platform
 * 
 * Tracks insurance-specific user interactions for insights.
 * Designed to work with Google Analytics 4 and custom backends.
 */

// Type definitions for insurance events
type InsuranceCategory = 'life' | 'health' | 'motor' | 'home' | 'travel' | 'specialized';
type ToolName = 'hidden_facts' | 'calculator' | 'compare' | 'claim_cases';

interface PolicyComparisonEvent {
    category: InsuranceCategory;
    policyCount: number;
    duration_seconds?: number;
}

interface CalculatorEvent {
    type: InsuranceCategory;
    sum_insured?: number;
    age?: number;
    completed: boolean;
}

interface FormEvent {
    form_name: string;
    step?: number;
    field?: string;
    success?: boolean;
}

interface PageViewEvent {
    page_path: string;
    page_title: string;
    insurance_category?: InsuranceCategory;
}

// Check if gtag is available (Google Analytics 4)
declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void;
    }
}

/**
 * PII/Sensitive fields that must NEVER be sent to analytics.
 * These are blocked at the tracking layer for compliance.
 */
const BLOCKED_PARAMS = new Set([
    'age',
    'user_age',
    'sum_insured',
    'sum_assured',
    'phone',
    'email',
    'mobile',
    'aadhaar',
    'pan',
    'dob',
    'date_of_birth',
    'name',
    'full_name',
    'address',
    'policy_number',
    'income',
]);

/**
 * Sanitize event params by removing blocked PII fields.
 * Logs a warning in development if blocked fields are found.
 */
function sanitizeEventParams(params: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};
    const blockedFound: string[] = [];

    for (const [key, value] of Object.entries(params)) {
        const normalizedKey = key.toLowerCase();
        if (BLOCKED_PARAMS.has(normalizedKey)) {
            blockedFound.push(key);
        } else {
            sanitized[key] = value;
        }
    }

    if (blockedFound.length > 0 && process.env.NODE_ENV !== 'production') {
        console.warn('[Analytics] Blocked PII params:', blockedFound);
    }

    return sanitized;
}

/**
 * Check if user has Do Not Track enabled in browser.
 * Respects user privacy preference per audit recommendations.
 */
function isDoNotTrackEnabled(): boolean {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
        return false;
    }

    // @ts-expect-error - doNotTrack may not be in Navigator type
    const dnt = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;
    return dnt === '1' || dnt === 'yes';
}

/**
 * Core event tracking function
 */
export function trackEvent(
    eventName: string,
    eventParams: Record<string, unknown> = {}
): void {
    // Sanitize params to remove any PII
    const safeParams = sanitizeEventParams(eventParams);

    // Don't track in development
    if (process.env.NODE_ENV !== 'production') {
        console.log('[Analytics Dev]', eventName, safeParams);
        return;
    }

    // Respect Do Not Track browser setting
    if (isDoNotTrackEnabled()) {
        console.log('[Analytics] DNT enabled, skipping tracking');
        return;
    }

    // Google Analytics 4
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', eventName, safeParams);
    }

    // Future: Send to custom analytics endpoint
    // sendToCustomAnalytics(eventName, safeParams);
}

// ============================================
// INSURANCE-SPECIFIC EVENT TRACKING
// ============================================

/**
 * Track when user views a policy comparison
 */
export function trackPolicyComparison(event: PolicyComparisonEvent): void {
    trackEvent('policy_comparison_viewed', {
        insurance_category: event.category,
        policies_compared: event.policyCount,
        duration_seconds: event.duration_seconds,
    });
}

/**
 * Track calculator usage with bucketed (privacy-safe) ranges
 */
export function trackCalculatorUsed(event: CalculatorEvent): void {
    // Bucket age into ranges for privacy
    const getAgeRange = (age?: number): string => {
        if (!age) return 'unknown';
        if (age < 25) return '18-24';
        if (age < 35) return '25-34';
        if (age < 45) return '35-44';
        if (age < 55) return '45-54';
        if (age < 65) return '55-64';
        return '65+';
    };

    // Bucket sum insured into ranges for privacy
    const getSumRange = (sum?: number): string => {
        if (!sum) return 'unknown';
        if (sum < 1000000) return 'under_10L';
        if (sum < 2500000) return '10L-25L';
        if (sum < 5000000) return '25L-50L';
        if (sum < 10000000) return '50L-1Cr';
        return '1Cr+';
    };

    trackEvent('calculator_used', {
        calculator_type: event.type,
        sum_range: getSumRange(event.sum_insured),
        age_range: getAgeRange(event.age),
        calculation_completed: event.completed,
    });
}

/**
 * Track tool usage (Hidden Facts, Claim Cases, etc.)
 */
export function trackToolUsed(tool: ToolName, details?: Record<string, unknown>): void {
    trackEvent('tool_used', {
        tool_name: tool,
        ...details,
    });
}

/**
 * Track form interactions
 */
export function trackFormEvent(type: 'start' | 'progress' | 'submit' | 'abandon', event: FormEvent): void {
    trackEvent(`form_${type}`, {
        form_name: event.form_name,
        step: event.step,
        field: event.field,
        success: event.success,
    });
}

/**
 * Track insurance category page views
 */
export function trackInsurancePageView(category: InsuranceCategory, pagePath: string): void {
    trackEvent('insurance_page_view', {
        insurance_category: category,
        page_path: pagePath,
    });
}

/**
 * Track claim case views
 */
export function trackClaimCaseView(caseId: string, category: InsuranceCategory, outcome: 'approved' | 'rejected'): void {
    trackEvent('claim_case_viewed', {
        case_id: caseId,
        insurance_category: category,
        claim_outcome: outcome,
    });
}

/**
 * Track hidden fact reveals
 */
export function trackHiddenFactRevealed(factId: string, category: InsuranceCategory): void {
    trackEvent('hidden_fact_revealed', {
        fact_id: factId,
        insurance_category: category,
    });
}

// ============================================
// WEB VITALS TRACKING
// ============================================

interface WebVitalMetric {
    id: string;
    name: string;
    value: number;
}

/**
 * Track Core Web Vitals for performance monitoring
 */
export function trackWebVitals(metric: WebVitalMetric): void {
    trackEvent('web_vitals', {
        metric_id: metric.id,
        metric_name: metric.name,
        metric_value: Math.round(metric.value),
    });
}

/**
 * Initialize Web Vitals tracking
 * Call this in your app's entry point
 */
export async function initWebVitalsTracking(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
        const webVitals = await import('web-vitals');

        // Type-safe wrapper for web vitals
        const reportVital = (metric: { id: string; name: string; value: number }) => {
            trackWebVitals({
                id: metric.id,
                name: metric.name,
                value: metric.value,
            });
        };

        webVitals.onCLS(reportVital);
        webVitals.onFCP(reportVital);
        webVitals.onLCP(reportVital);
        webVitals.onTTFB(reportVital);
    } catch (error) {
        console.warn('Web Vitals not available:', error);
    }
}
