import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClaimsService } from '../claims.service';
import { claimRepository } from '@/repositories/claim.repository';

// Mock dependencies
vi.mock('@/repositories/claim.repository', () => ({
    claimRepository: {
        create: vi.fn(),
        findById: vi.fn(),
        update: vi.fn(),
    }
}));

vi.mock('@/lib/logger', () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
    }
}));

describe('ClaimsService', () => {
    let service: ClaimsService;

    beforeEach(() => {
        service = new ClaimsService();
        vi.clearAllMocks();
    });

    it('should auto-approve a straightforward collision claim under $1500 with police report', async () => {
        const payload = {
            policyId: 'POL-123',
            incidentType: 'COLLISION' as const,
            claimedAmount: 1200, // < 1500
            hasPoliceReport: true, // Auto criteria
            imageEvidenceCount: 1
        };

        const mockClaim = { id: 'claim_999', ...payload, status: 'APPROVED' };
        vi.mocked(claimRepository.create).mockResolvedValue(mockClaim as any);

        const result = await service.fastTrackClaim(payload);

        expect(result.adjudicationStatus).toBe('APPROVED');
        expect(claimRepository.create).toHaveBeenCalledWith(expect.objectContaining({
            status: 'APPROVED',
            outcome: 'Auto-Adjudicated'
        }));
    });

    it('should route to manual review if claim amount is over $1500', async () => {
        const payload = {
            policyId: 'POL-123',
            incidentType: 'COLLISION' as const,
            claimedAmount: 2000, // > 1500
            hasPoliceReport: true,
            imageEvidenceCount: 5
        };

        const mockClaim = { id: 'claim_999', ...payload, status: 'MANUAL_REVIEW' };
        vi.mocked(claimRepository.create).mockResolvedValue(mockClaim as any);

        const result = await service.fastTrackClaim(payload);

        expect(result.adjudicationStatus).toBe('MANUAL_REVIEW');
        expect(claimRepository.create).toHaveBeenCalledWith(expect.objectContaining({
            status: 'MANUAL_REVIEW'
        }));
    });

    it('should throw an error if repository persistence fails', async () => {
        const payload = {
            policyId: 'POL-123',
            incidentType: 'THEFT' as const,
            claimedAmount: 5000,
            hasPoliceReport: true,
            imageEvidenceCount: 0
        };

        vi.mocked(claimRepository.create).mockRejectedValue(new Error('DB connection failed'));

        await expect(service.fastTrackClaim(payload)).rejects.toThrow('Failed to process claim submission.');
    });
});
