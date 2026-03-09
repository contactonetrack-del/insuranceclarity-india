import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';

// Hoist mocks
const { mockGetServerSession, mockChatCreate } = vi.hoisted(() => ({
    mockGetServerSession: vi.fn(),
    mockChatCreate: vi.fn()
}));

vi.mock('next-auth/next', () => ({
    getServerSession: mockGetServerSession
}));

vi.mock('@/app/api/auth/[...nextauth]/route', () => ({
    getAuthOptions: vi.fn().mockResolvedValue({})
}));

vi.mock('@/lib/openai', () => ({
    openai: {
        chat: {
            completions: {
                create: mockChatCreate
            }
        }
    }
}));

vi.mock('@/lib/prisma', () => ({
    prisma: {
        policyScan: {
            create: vi.fn().mockResolvedValue({ id: 'scan_123' })
        }
    }
}));

// Mock pdf-parse module
const longMockText = 'This is a sample extracted PDF text for testing. It needs to be sufficiently long to pass the 100 character minimum validation threshold defined in the scan-policy route handler. ' + 'A'.repeat(50);
const mockPdfParse = vi.fn().mockResolvedValue({ text: longMockText });
vi.mock('pdf-parse', () => ({
    default: mockPdfParse
}));

describe('POST /api/ai/scan-policy', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const createFormDataRequest = (file: File | null) => {
        const formData = {
            get: (key: string) => key === 'file' ? file : null
        };

        const request = new Request('http://localhost:3000/api/ai/scan-policy', {
            method: 'POST',
        });

        // Mock the formData method directly to bypass undici parsing issues in vitest
        request.formData = async () => formData as any;

        return request;
    };

    it('should reject unauthorized requests', async () => {
        mockGetServerSession.mockResolvedValue(null);

        const request = createFormDataRequest(null);
        const response = await POST(request as any);
        const json = await response.json();

        expect(response.status).toBe(401);
        expect(json.error).toBe('Unauthorized');
    });

    it('should reject requests without a file', async () => {
        mockGetServerSession.mockResolvedValue({ user: { id: 'user_1' } });

        const request = createFormDataRequest(null);
        const response = await POST(request as any);
        const json = await response.json();

        expect(response.status).toBe(400);
        expect(json.error).toBe('No file provided');
    });

    it('should reject oversized files', async () => {
        mockGetServerSession.mockResolvedValue({ user: { id: 'user_1' } });

        // Create a massive "file" array buffer trick to simulate > 10MB
        const largeContent = new Uint8Array(11 * 1024 * 1024);
        const file = new File([largeContent], 'large.pdf', { type: 'application/pdf' });

        const request = createFormDataRequest(file);
        const response = await POST(request as any);
        const json = await response.json();

        expect(response.status).toBe(400);
        expect(json.error).toMatch(/File too large/);
    });

    it('should successfully process a valid PDF and return AI scan results', async () => {
        mockGetServerSession.mockResolvedValue({ user: { id: 'user_1' } });

        // Mock OpenAI response
        mockChatCreate.mockResolvedValue({
            choices: [{
                message: {
                    content: JSON.stringify({
                        policyName: 'Test Policy',
                        overallScore: 85,
                        summary: 'Good policy',
                        redFlags: [],
                        waitingPeriods: [],
                        verdict: 'Recommended'
                    })
                }
            }]
        });

        const file = new File(['mock content'], 'test.pdf', { type: 'application/pdf' });
        // JSDOM File polyfill doesn't have arrayBuffer, so we mock it
        file.arrayBuffer = async () => new TextEncoder().encode('mock content').buffer;

        const request = createFormDataRequest(file);

        const response = await POST(request as any);
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.policyName).toBe('Test Policy');
        expect(json.overallScore).toBe(85);
        expect(mockChatCreate).toHaveBeenCalled();
    });
});
