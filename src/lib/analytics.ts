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
 * Core event tracking function
 */
export function trackEvent(
    eventName: string,
    eventParams: Record<string, unknown> = {}
): void {
    // Don't track in development
    if (process.env.NODE_ENV !== 'production') {
        console.log('[Analytics Dev]', eventName, eventParams);
        return;
    }

    // Google Analytics 4
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', eventName, eventParams);
    }

    // Future: Send to custom analytics endpoint
    // sendToCustomAnalytics(eventName, eventParams);
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
 * Track calculator usage
 */
export function trackCalculatorUsed(event: CalculatorEvent): void {
    trackEvent('calculator_used', {
        calculator_type: event.type,
        sum_insured: event.sum_insured,
        user_age: event.age,
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
