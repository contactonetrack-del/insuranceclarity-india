/**
 * Scan Store — Zustand
 *
 * Global state for the active policy scan lifecycle.
 */

import { create } from 'zustand';
import type { ScanStoreState } from '@/types/report.types';

export const useScanStore = create<ScanStoreState>((set) => ({
    scanId:          null,
    status:          null,
    uploadProgress:  0,
    processingStep:  'idle',

    setScanId:          (id)    => set({ scanId: id }),
    setStatus:          (s)     => set({ status: s }),
    setUploadProgress:  (p)     => set({ uploadProgress: p }),
    setProcessingStep:  (step)  => set({ processingStep: step }),

    reset: () => set({
        scanId:         null,
        status:         null,
        uploadProgress: 0,
        processingStep: 'idle',
    }),
}));
