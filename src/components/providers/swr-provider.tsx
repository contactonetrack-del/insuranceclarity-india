'use client';

import React from 'react';
import { SWRConfig } from 'swr';

/**
 * Global SWR Provider — InsuranceClarity
 * 
 * Provides client-side caching, revalidation, and a standard fetcher.
 * This prevents "Frontend over-fetching" and improves UI snappiness
 * by reusing cached API responses across different components.
 */
export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: (resource, init) => fetch(resource, init).then(res => res.json()),
        revalidateOnFocus: false, // Standard for many SaaS apps to save bandwidth
        dedupingInterval: 5000,    // Dedupe requests within 5 seconds
        errorRetryCount: 3,
      }}
    >
      {children}
    </SWRConfig>
  );
}
