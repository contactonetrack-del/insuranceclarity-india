import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MetadataService } from '../metadata.service';

vi.mock('next/cache', () => ({
    // Mock unstable_cache to simply execute and return the caching function
    unstable_cache: vi.fn((cb) => cb)
}));

describe('MetadataService', () => {
    let service: MetadataService;

    beforeEach(() => {
        service = new MetadataService();
        vi.clearAllMocks();
    });

    it('should retrieve risk categories correctly', async () => {
        const categories = await service.getRiskCategories();

        expect(categories).toBeInstanceOf(Array);
        expect(categories.length).toBeGreaterThan(0);
        expect(categories).toContainEqual(
            expect.objectContaining({ id: 'cat_smoker', multiplier: 1.5 })
        );
    });

    it('should retrieve base rates by state', async () => {
        const stateCode = 'CA';
        const rates = await service.getBaseRatesByState(stateCode);

        expect(rates).toEqual({
            state: 'CA',
            lifeBaseLimit: 250000,
            minimumPremium: 25.00
        });
    });
});
