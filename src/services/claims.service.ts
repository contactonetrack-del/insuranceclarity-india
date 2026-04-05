import { claimRepository } from '@/repositories/claim.repository';
import { Prisma } from '@prisma/client';
import { logger } from '@/lib/logger';

// Mock Payload matching Section 12 Audit requirements
export interface ClaimSubmission {
    policyId: string;
    incidentType: 'COLLISION' | 'WEATHER' | 'THEFT' | 'MEDICAL';
    claimedAmount: number;
    hasPoliceReport: boolean;
    imageEvidenceCount: number;
}

export class ClaimsService {
    /**
     * AI-Driven Auto-Adjudication Pipeline (Simulated)
     * 
     * Applies a rules-engine overlay on incoming claims. If constraints match
     * "low-risk" parameters, the claim is auto-approved instantly. Otherwise,
     * it is routed to a human adjuster.
     */
    async fastTrackClaim(payload: ClaimSubmission) {
        logger.info({ action: 'fastTrackClaim.started', policyId: payload.policyId });

        let finalStatus: 'APPROVED' | 'MANUAL_REVIEW' = 'MANUAL_REVIEW';

        // Simulated AI Rules Engine Evaluation
        const isLowValue = payload.claimedAmount < 1500;
        const hasSufficientEvidence = payload.imageEvidenceCount >= 3;
        const isStraightforward = payload.incidentType === 'COLLISION' && payload.hasPoliceReport;

        if (isLowValue && (hasSufficientEvidence || isStraightforward)) {
            logger.debug({ action: 'fastTrackClaim.rulesMatched' }, 'Claim fits auto-adjudication constraints.');
            finalStatus = 'APPROVED';
        } else {
            logger.debug({ action: 'fastTrackClaim.rulesFailed' }, 'Routing to human adjuster queue.');
        }

        // Persist the Decision
        try {
            const claimData: Prisma.ClaimCaseCreateInput = {
                category: payload.incidentType,
                title: `Auto-generated submission for ${payload.incidentType}`,
                status: finalStatus,
                amount: payload.claimedAmount,
                issue: "Automated digital submission",
                details: `Policy ID: ${payload.policyId} | Evidence: ${payload.imageEvidenceCount} | Police Report: ${payload.hasPoliceReport}`,
                outcome: finalStatus === 'APPROVED' ? "Auto-Adjudicated" : "Pending Manual Review",
                lesson: "AI Engine Processing"
            };

            const savedClaim = await claimRepository.create(claimData);

            logger.info({
                action: 'fastTrackClaim.completed',
                claimId: savedClaim.id,
                status: finalStatus
            });

            return {
                claimId: savedClaim.id,
                adjudicationStatus: finalStatus,
                message: finalStatus === 'APPROVED'
                    ? 'Your claim was auto-approved by our AI system.'
                    : 'Your claim has been received and routed to a human adjuster.'
            };

        } catch (error) {
            logger.error({ action: 'fastTrackClaim.error', error });
            throw new Error('Failed to process claim submission.');
        }
    }
}

export const claimsService = new ClaimsService();
