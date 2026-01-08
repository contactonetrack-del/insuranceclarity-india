import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

describe('useReducedMotion', () => {
    let matchMediaMock: ReturnType<typeof vi.fn>;
    let listeners: Map<string, (e: MediaQueryListEvent) => void>;

    beforeEach(() => {
        listeners = new Map();

        matchMediaMock = vi.fn().mockImplementation((query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addEventListener: (event: string, callback: (e: MediaQueryListEvent) => void) => {
                listeners.set(event, callback);
            },
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }));

        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: matchMediaMock,
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should return false by default (no reduced motion)', () => {
        const { result } = renderHook(() => useReducedMotion());
        expect(result.current).toBe(false);
    });

    it('should return true when user prefers reduced motion', () => {
        matchMediaMock.mockReturnValue({
            matches: true,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        });

        const { result } = renderHook(() => useReducedMotion());

        // After effect runs, it should be true
        expect(result.current).toBe(true);
    });

    it('should respond to media query changes', async () => {
        let changeHandler: ((e: MediaQueryListEvent) => void) | null = null;

        matchMediaMock.mockReturnValue({
            matches: false,
            addEventListener: (_: string, handler: (e: MediaQueryListEvent) => void) => {
                changeHandler = handler;
            },
            removeEventListener: vi.fn(),
        });

        const { result } = renderHook(() => useReducedMotion());

        // Initially false
        expect(result.current).toBe(false);

        // Simulate media query change
        if (changeHandler) {
            act(() => {
                changeHandler!({ matches: true } as MediaQueryListEvent);
            });
        }

        await waitFor(() => {
            expect(result.current).toBe(true);
        });
    });

    it('should clean up listener on unmount', () => {
        const removeEventListenerMock = vi.fn();

        matchMediaMock.mockReturnValue({
            matches: false,
            addEventListener: vi.fn(),
            removeEventListener: removeEventListenerMock,
        });

        const { unmount } = renderHook(() => useReducedMotion());
        unmount();

        expect(removeEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
    });
});
