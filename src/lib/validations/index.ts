import { z } from 'zod';

export const quoteRequestSchema = z.object({
    insuranceType: z.enum(['TERM_LIFE', 'HEALTH', 'AUTO', 'HOME', 'DISABILITY', 'CRITICAL_ILLNESS']),
    coverageAmount: z.number().int().positive().min(10000),
    termLengthYears: z.number().int().positive().max(50).optional(),
    applicantAge: z.number().int().min(18).max(100),
    tobaccoUser: z.boolean().default(false),
    postalCode: z.string().regex(/^\d{5,6}$/, 'Invalid postal code format').optional(),
});

export const policyCreationSchema = z.object({
    quoteId: z.string().uuid(),
    applicantName: z.string().min(2).max(100),
    applicantEmail: z.string().email(),
    startDate: z.string().datetime(),
});

export const claimSubmissionSchema = z.object({
    policyId: z.string().uuid(),
    incidentDate: z.string().datetime(),
    description: z.string().min(20).max(2000),
    estimatedAmount: z.number().positive(),
    documents: z.array(z.string().url()).optional(),
});

export type QuoteRequest = z.infer<typeof quoteRequestSchema>;
export type PolicyCreation = z.infer<typeof policyCreationSchema>;
export type ClaimSubmission = z.infer<typeof claimSubmissionSchema>;
