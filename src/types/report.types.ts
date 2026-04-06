// =============================================================================
// Shared TypeScript Types — AI Policy Scanner MVP
// =============================================================================

// ─── Scan & Report ────────────────────────────────────────────────────────────

export type ScanStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type Severity   = 'HIGH' | 'MEDIUM' | 'LOW';
export type Priority   = 'HIGH' | 'MEDIUM' | 'LOW';

export interface RiskItem {
    title: string;
    severity: Severity;
    description: string;
}

export interface ExclusionItem {
    clause: string;
    impact: string;
}

export interface SuggestionItem {
    action: string;
    priority: Priority;
}

export interface HiddenClauseItem {
    clause: string;
    risk: string;
}

/** Full structured report returned by GPT and stored in DB */
export interface PolicyReport {
    score: number;           // 0–100
    summary: string;         // 2–3 sentence executive summary
    risks: RiskItem[];
    exclusions: ExclusionItem[];
    suggestions: SuggestionItem[];
    hiddenClauses: HiddenClauseItem[];
}

/** GPT raw JSON response shape (validated before persisting) */
export interface GptAnalysisResponse {
    score: number;
    summary: string;
    risks: RiskItem[];
    exclusions: ExclusionItem[];
    suggestions: SuggestionItem[];
    hiddenClauses: HiddenClauseItem[];
    rawText?: string;
}

// ─── API Response Shapes ──────────────────────────────────────────────────────

export interface ScanCreateResponse {
    scanId: string;
    status: ScanStatus;
    message: string;
}

export interface ScanStatusResponse {
    scanId: string;
    status: ScanStatus;
    score?: number;
    isPaid: boolean;
}

/** Free tier result — partial data only */
export interface FreeReportResponse {
    scanId: string;
    score: number;
    summary: string;
    risks: RiskItem[];           // only top 3
    isPaid: false;
    paywall: true;
    paywallMessage: string;
    exclusionsCount?: number;
    suggestionsCount?: number;
    hiddenClausesCount?: number;
}

/** Full paid report */
export interface FullReportResponse {
    scanId: string;
    score: number;
    summary: string;
    risks: RiskItem[];
    exclusions: ExclusionItem[];
    suggestions: SuggestionItem[];
    hiddenClauses: HiddenClauseItem[];
    isPaid: true;
    paywall: false;
    processingMs?: number;
}

export type ReportResponse = FreeReportResponse | FullReportResponse;

// ─── Payment ──────────────────────────────────────────────────────────────────

export type PaymentStatus = 'CREATED' | 'CAPTURED' | 'FAILED' | 'REFUNDED';

export interface CreateOrderRequest {
    scanId: string;
}

export interface CreateOrderResponse {
    orderId: string;
    amount: number;   // in paise
    currency: string;
    keyId: string;    // Razorpay publishable key
}

export interface VerifyPaymentRequest {
    scanId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
}

export interface VerifyPaymentResponse {
    success: boolean;
    message: string;
}

// ─── Upload ───────────────────────────────────────────────────────────────────

export interface UploadResponse {
    scanId: string;
    fileName: string;
    fileSizeKb: number;
    message: string;
    /** One-time claim token for anonymous users to prove scan ownership (24h TTL). */
    claimToken?: string;
}

// ─── Zustand Store ────────────────────────────────────────────────────────────

export interface ScanStoreState {
    // Current scan
    scanId: string | null;
    status: ScanStatus | null;
    uploadProgress: number;        // 0–100
    processingStep: ProcessingStep;

    // Actions
    setScanId: (id: string) => void;
    setStatus: (s: ScanStatus) => void;
    setUploadProgress: (p: number) => void;
    setProcessingStep: (step: ProcessingStep) => void;
    reset: () => void;
}

export type ProcessingStep =
    | 'idle'
    | 'uploading'
    | 'extracting'
    | 'analyzing'
    | 'scoring'
    | 'done'
    | 'error';
