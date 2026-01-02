'use client'

import { useState, useEffect } from 'react'

/**
 * Hook to detect if user prefers reduced motion.
 * 
 * Listens to the `prefers-reduced-motion` media query and responds
 * to changes in real-time. Returns `false` during SSR to avoid hydration mismatch.
 * 
 * @returns boolean - true if user prefers reduced motion
 */
export function useReducedMotion(): boolean {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

        // Set initial value
        setPrefersReducedMotion(mediaQuery.matches)

        // Listen for changes
        const handleChange = (event: MediaQueryListEvent) => {
            setPrefersReducedMotion(event.matches)
        }

        mediaQuery.addEventListener('change', handleChange)

        return () => {
            mediaQuery.removeEventListener('change', handleChange)
        }
    }, [])

    return prefersReducedMotion
}
