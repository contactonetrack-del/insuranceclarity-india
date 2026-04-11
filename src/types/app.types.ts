import type {
    LeadSource as DomainLeadSource,
    LeadStatus as DomainLeadStatus,
    QuoteStatus as DomainQuoteStatus,
    UserPlan as DomainUserPlan,
} from '@/lib/domain/enums';

export interface QuoteRecord {
    id: string;
    insuranceType: string;
    coverageAmount: number;
    premiumAmount: number;
    applicantAge: number;
    tobaccoUser: boolean | null;
    status: DomainQuoteStatus;
    createdAt: Date;
    updatedAt: Date;
}

export interface AdminDashboardStats {
    totalQuotes: number;
    totalPremium: number;
    totalCoverage: number;
    totalTokens?: number;
    estimatedAiCost?: number;
    activeSubscriptions?: number;
    recentQuotes: QuoteRecord[];
}

export interface AdminDashboardError {
    error: string;
}

export type AdminDashboardResult = AdminDashboardStats | AdminDashboardError;

export type JobHealthAlertLevel = 'ok' | 'warning' | 'critical';

export interface AdminJobHealth {
    pendingPaymentReconciliation: number;
    staleCreatedPayments: number;
    staleScans: number;
    deadLetterJobs: number;
    recentCronErrors1h: number;
    recentCronErrors24h: number;
    recentCronErrors7d: number;
    recentCronErrors30d: number;
    recentQueueErrors1h: number;
    recentQueueErrors24h: number;
    recentQueueErrors7d: number;
    recentQueueErrors30d: number;
    cronHourlyBaseline24h: number;
    queueHourlyBaseline24h: number;
    cronDailyBaseline7d: number;
    queueDailyBaseline7d: number;
    cronSpike: boolean;
    queueSpike: boolean;
    cronAlertLevel: JobHealthAlertLevel;
    queueAlertLevel: JobHealthAlertLevel;
    queueProvider: 'qstash' | 'http';
    redisConfigured: boolean;
    alertDestinationsConfigured: number;
    alertDestinationLabels: string[];
    generatedAt: string;
}

export interface AdminJobHealthError {
    error: string;
}

export type AdminJobHealthResult = AdminJobHealth | AdminJobHealthError;

export interface AdminBusinessReadiness {
    days: number;
    totals: {
        signup: number;
        scan: number;
        pay: number;
        retain: number;
    };
    conversion: {
        signupToScan: number;
        scanToPay: number;
        payToRetain: number;
    };
    supporting: {
        totalLeads: number;
        scansInWindow: number;
        capturedPaymentsInWindow: number;
        activeSubscriptions: number;
    };
    generatedAt: string;
}

export interface AdminBusinessReadinessError {
    error: string;
}

export type AdminBusinessReadinessResult = AdminBusinessReadiness | AdminBusinessReadinessError;

export type LeadStatus = DomainLeadStatus;
export type LeadSource = DomainLeadSource;

export interface Lead {
    id: string;
    name: string;
    email: string;
    phone: string;
    insuranceType: string;
    status: LeadStatus;
    source: LeadSource;
    notes?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateLeadRequest {
    name: string;
    email: string;
    phone: string;
    insuranceType: string;
    source?: LeadSource;
    notes?: string;
}

export interface UpdateLeadRequest {
    status?: LeadStatus;
    notes?: string;
}

export type InsuranceCategorySlug =
    | 'life'
    | 'health'
    | 'motor'
    | 'home'
    | 'travel'
    | 'business'
    | 'specialized';

export interface InsuranceCategory {
    id: string;
    name: string;
    slug: InsuranceCategorySlug;
    subcategories: InsuranceSubcategory[];
}

export interface InsuranceSubcategory {
    id: string;
    name: string;
    categoryId: string;
    types: InsuranceTypeItem[];
}

export interface InsuranceTypeItem {
    id: string;
    name: string;
    subcategoryId: string;
}

export interface CoverageData {
    minCoverage?: number;
    maxCoverage?: number;
    currency?: string;
    coverageDetails?: string[];
}

export interface EligibilityData {
    minAge?: number;
    maxAge?: number;
    conditions?: string[];
}

export interface FinancialData {
    premiumRange?: { min: number; max: number };
    taxBenefits?: string[];
    claimSettlementRatio?: number;
}

export interface InsurancePolicy {
    id: string;
    typeId: string;
    providerName: string;
    productName: string;
    coverageData: CoverageData;
    eligibilityData: EligibilityData;
    financialData: FinancialData;
    benefits: string[];
    exclusions: string[];
    seoSlug: string;
    createdAt: Date;
}

export type UserPlan = DomainUserPlan;

export interface DashboardUser {
    id: string;
    name: string | null;
    email: string | null;
    plan: UserPlan;
    scansUsed: number;
    savedFacts: string[];
    createdAt: Date;
}

export interface SavedQuote {
    id: string;
    type: string;
    provider: string;
    premium: number;
    coverAmount: number;
    notes?: string | null;
    createdAt: Date;
}

export type FactSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface HiddenFact {
    id: string;
    category: string;
    title: string;
    severity: FactSeverity;
    description: string;
    affectedPolicies: string[];
    whatToCheck: string;
    realCase: string;
    example?: string | null;
}

export interface ClaimCase {
    id: string;
    category: string;
    title: string;
    status: string;
    amount: number;
    issue: string;
    details: string;
    outcome: string;
    lesson: string;
}

export type QuoteStatus = DomainQuoteStatus;

export interface QuoteRequest {
    insuranceType: InsuranceCategorySlug;
    coverageAmount: number;
    applicantAge: number;
    tobaccoUser?: boolean;
}

export interface QuoteResult {
    premiumMonthly: number;
    premiumAnnual: number;
    discountApplied: number;
    provider: string;
    planName: string;
    taxBenefit: number;
}
