// =============================================================================
// Shared TypeScript Types — Admin, Insurance, Leads, Dashboard
// =============================================================================

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

export interface QuoteRecord {
    id: string;
    insuranceType: string;
    coverageAmount: number;
    premiumAmount: number;
    applicantAge: number;
    tobaccoUser: boolean | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface AdminDashboardStats {
    totalQuotes: number;
    totalPremium: number;
    totalCoverage: number;
    recentQuotes: QuoteRecord[];
}

export interface AdminDashboardError {
    error: string;
}

export type AdminDashboardResult = AdminDashboardStats | AdminDashboardError;

// ─── Lead Management ─────────────────────────────────────────────────────────

export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CLOSED' | 'LOST';
export type LeadSource = 'ORGANIC' | 'REFERRAL' | 'PAID' | 'SOCIAL' | 'EMAIL';

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

// ─── Insurance Categories ─────────────────────────────────────────────────────

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

// ─── Insurance Policy ─────────────────────────────────────────────────────────

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

// ─── User Dashboard ───────────────────────────────────────────────────────────

export type UserPlan = 'FREE' | 'PRO' | 'ENTERPRISE';

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


// ─── Hidden Facts & Claims ────────────────────────────────────────────────────

export type FactSeverity = 'HIGH' | 'MEDIUM' | 'LOW';

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

// ─── Quote Request ────────────────────────────────────────────────────────────

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
