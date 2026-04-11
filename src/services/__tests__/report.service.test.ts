import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FullReportResponse } from '@/types/report.types';
import {
    countAnonymousScansSince,
    createScan,
    findExistingScan,
    getReport,
    getScanStatus,
    markScanFailed,
    saveReport,
    updateScanStatus,
} from '../report.service';

const {
    mockFindExistingCompletedScanByHash,
    mockCountAnonymousScansSince,
    mockCreateScan,
    mockUpdateScanStatus,
    mockSaveReport,
    mockMarkScanFailed,
    mockFindCompletedScanWithReportById,
    mockFindScanStatusById,
    mockMarkStaleScanFailed,
    mockRedisGet,
    mockRedisSet,
    mockInfo,
    mockWarn,
} = vi.hoisted(() => ({
    mockFindExistingCompletedScanByHash: vi.fn(),
    mockCountAnonymousScansSince: vi.fn(),
    mockCreateScan: vi.fn(),
    mockUpdateScanStatus: vi.fn(),
    mockSaveReport: vi.fn(),
    mockMarkScanFailed: vi.fn(),
    mockFindCompletedScanWithReportById: vi.fn(),
    mockFindScanStatusById: vi.fn(),
    mockMarkStaleScanFailed: vi.fn(),
    mockRedisGet: vi.fn(),
    mockRedisSet: vi.fn(),
    mockInfo: vi.fn(),
    mockWarn: vi.fn(),
}));

vi.mock('@/repositories/report.repository', () => ({
    reportRepository: {
        findExistingCompletedScanByHash: mockFindExistingCompletedScanByHash,
        countAnonymousScansSince: mockCountAnonymousScansSince,
        createScan: mockCreateScan,
        updateScanStatus: mockUpdateScanStatus,
        saveReport: mockSaveReport,
        markScanFailed: mockMarkScanFailed,
        findCompletedScanWithReportById: mockFindCompletedScanWithReportById,
        findScanStatusById: mockFindScanStatusById,
        markStaleScanFailed: mockMarkStaleScanFailed,
    },
}));

vi.mock('@/lib/cache/redis', () => ({
    redisClient: {
        get: mockRedisGet,
        set: mockRedisSet,
    },
}));

vi.mock('@/lib/logger', () => ({
    logger: {
        info: mockInfo,
        warn: mockWarn,
    },
}));

describe('report.service', () => {
    const originalDateNow = Date.now;
    const fullReport = {
        scanId: 'scan_1',
        score: 78,
        summary: 'Policy summary',
        risks: [
            { title: 'Risk 1', severity: 'HIGH', clause: 'Clause 1', whyItMatters: 'Reason 1', recommendation: 'Fix 1' },
            { title: 'Risk 2', severity: 'MEDIUM', clause: 'Clause 2', whyItMatters: 'Reason 2', recommendation: 'Fix 2' },
            { title: 'Risk 3', severity: 'LOW', clause: 'Clause 3', whyItMatters: 'Reason 3', recommendation: 'Fix 3' },
            { title: 'Risk 4', severity: 'LOW', clause: 'Clause 4', whyItMatters: 'Reason 4', recommendation: 'Fix 4' },
        ],
        exclusions: [{ title: 'Exclusion 1', text: 'Excluded' }],
        suggestions: [{ title: 'Suggestion 1', text: 'Improve' }],
        hiddenClauses: [{ title: 'Clause 1', text: 'Hidden clause' }],
        isPaid: true,
        paywall: false,
        processingMs: 4200,
    } as unknown as FullReportResponse;

    beforeEach(() => {
        vi.clearAllMocks();
        Date.now = vi.fn(() => new Date('2024-01-01T00:10:00Z').getTime());
    });

    afterEach(() => {
        Date.now = originalDateNow;
    });

    it('returns an existing scan id from cache before touching the database', async () => {
        mockRedisGet.mockResolvedValue('scan_cached');

        await expect(findExistingScan('hash_123', { userId: 'user_1' })).resolves.toBe('scan_cached');
        expect(mockFindExistingCompletedScanByHash).not.toHaveBeenCalled();
    });

    it('falls back to the repository for dedup lookups and backfills the cache', async () => {
        mockRedisGet.mockResolvedValue(null);
        mockFindExistingCompletedScanByHash.mockResolvedValue({ id: 'scan_db_1' });

        await expect(findExistingScan('hash_123', { ipAddress: '127.0.0.1' })).resolves.toBe('scan_db_1');
        expect(mockFindExistingCompletedScanByHash).toHaveBeenCalledWith('hash_123', {
            userId: null,
            ipAddress: '127.0.0.1',
        });
        expect(mockRedisSet).toHaveBeenCalledWith('hash:ip:127.0.0.1:hash_123', 'scan_db_1', { ex: 86400 });
    });

    it('delegates scan creation, status updates, counting, save, and fail operations', async () => {
        mockCountAnonymousScansSince.mockResolvedValue(3);
        mockCreateScan.mockResolvedValue({ id: 'scan_1' });
        mockUpdateScanStatus.mockResolvedValue({ id: 'scan_1', status: 'PROCESSING' });
        mockSaveReport.mockResolvedValue(undefined);
        mockMarkScanFailed.mockResolvedValue(undefined);

        expect(await countAnonymousScansSince('127.0.0.1', new Date('2024-01-01T00:00:00Z'))).toBe(3);
        await expect(
            createScan({
                fileHash: 'hash',
                fileName: 'policy.pdf',
                fileSizeKb: 123,
                fileUrl: 'https://cdn.example.com/policy.pdf',
                userId: 'user_1',
            }),
        ).resolves.toEqual({ id: 'scan_1' });
        await expect(updateScanStatus('scan_1', 'PROCESSING', 55)).resolves.toEqual({ id: 'scan_1', status: 'PROCESSING' });
        await saveReport('scan_1', {
            report: {
                score: 78,
                summary: 'Policy summary',
                risks: [],
                exclusions: [],
                suggestions: [],
                hiddenClauses: [],
                processingMs: 4200,
            },
        } as never);
        await markScanFailed('scan_1');

        expect(mockInfo).toHaveBeenCalledWith(expect.objectContaining({ action: 'report.saved', scanId: 'scan_1' }));
        expect(mockWarn).toHaveBeenCalledWith(expect.objectContaining({ action: 'report.failed', scanId: 'scan_1' }));
    });

    it('returns cached reports and applies the free-tier paywall projection', async () => {
        mockRedisGet.mockResolvedValue(JSON.stringify(fullReport));

        const report = await getReport({ scanId: 'scan_1', isPaid: false, locale: 'en' });

        expect(report).toEqual(
            expect.objectContaining({
                scanId: 'scan_1',
                isPaid: false,
                paywall: true,
                exclusionsCount: 1,
                suggestionsCount: 1,
                hiddenClausesCount: 1,
            }),
        );
        expect(report?.risks).toHaveLength(3);
    });

    it('loads reports from the repository, caches the full report, and returns the paid view', async () => {
        mockRedisGet.mockResolvedValue(null);
        mockFindCompletedScanWithReportById.mockResolvedValue({
            id: 'scan_1',
            status: 'COMPLETED',
            isPaid: true,
            report: {
                score: 78,
                summary: 'Policy summary',
                risks: fullReport.risks,
                exclusions: fullReport.exclusions,
                suggestions: fullReport.suggestions,
                hiddenClauses: fullReport.hiddenClauses,
                processingMs: 4200,
            },
        });

        const report = await getReport({ scanId: 'scan_1', locale: 'hi' });

        expect(report).toEqual(expect.objectContaining({ scanId: 'scan_1', isPaid: true, paywall: false }));
        expect(mockRedisSet).toHaveBeenCalledWith(
            'report:scan_1',
            expect.any(String),
            { ex: 86400 },
        );
    });

    it('returns null when no completed report is available', async () => {
        mockRedisGet.mockResolvedValue(null);
        mockFindCompletedScanWithReportById.mockResolvedValue(null);

        await expect(getReport({ scanId: 'missing_scan' })).resolves.toBeNull();
    });

    it('marks stale scans as failed when polling stale pending states', async () => {
        mockFindScanStatusById.mockResolvedValue({
            id: 'scan_1',
            status: 'PROCESSING',
            score: null,
            isPaid: false,
            updatedAt: new Date('2024-01-01T00:00:00Z'),
        });
        mockMarkStaleScanFailed.mockResolvedValue(undefined);

        await expect(getScanStatus('scan_1')).resolves.toEqual({
            id: 'scan_1',
            status: 'FAILED',
            score: null,
            isPaid: false,
        });
        expect(mockMarkStaleScanFailed).toHaveBeenCalledWith('scan_1');
        expect(mockWarn).toHaveBeenCalledWith(
            expect.objectContaining({ action: 'scan.stale.marked_failed', scanId: 'scan_1' }),
        );
    });

    it('returns current scan status unchanged when it is still fresh', async () => {
        mockFindScanStatusById.mockResolvedValue({
            id: 'scan_1',
            status: 'COMPLETED',
            score: 78,
            isPaid: true,
            updatedAt: new Date('2024-01-01T00:09:59Z'),
        });

        await expect(getScanStatus('scan_1')).resolves.toEqual({
            id: 'scan_1',
            status: 'COMPLETED',
            score: 78,
            isPaid: true,
        });
        expect(mockMarkStaleScanFailed).not.toHaveBeenCalled();
    });
});
