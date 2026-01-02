'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

interface PageTransitionProps {
    children: React.ReactNode
}

/**
 * PageTransition - Premium page transitions using Framer Motion.
 * 
 * Features:
 * - Smooth fade + slide on route changes
 * - Exit animations before new page enters
 * - Respects prefers-reduced-motion
 * 
 * Based on Awwwards page transition patterns and SVGator #22.
 */
export default function PageTransition({ children }: PageTransitionProps) {
    const pathname = usePathname()
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

    useEffect(() => {
        setPrefersReducedMotion(
            window.matchMedia('(prefers-reduced-motion: reduce)').matches
        )
    }, [])

    // Skip animations if user prefers reduced motion
    if (prefersReducedMotion) {
        return <>{children}</>
    }

    const variants = {
        initial: {
            opacity: 0,
            y: 20
        },
        enter: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94] as const
            }
        },
        exit: {
            opacity: 0,
            y: -10,
            transition: {
                duration: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94] as const
            }
        }
    }

    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key={pathname}
                initial="initial"
                animate="enter"
                exit="exit"
                variants={variants}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    )
}

/**
 * LoadingBar - Animated progress bar for page loads.
 * 
 * Uses Framer Motion for smooth width animations.
 */
export function LoadingBar({ isLoading }: { isLoading: boolean }) {
    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    className="fixed top-0 left-0 right-0 z-50 h-1 bg-theme-secondary"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="h-full bg-gradient-accent"
                        initial={{ width: '0%' }}
                        animate={{ width: '90%' }}
                        transition={{ duration: 2, ease: 'easeOut' }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    )
}

/**
 * SlidePageTransition - Horizontal slide transition variant.
 * 
 * Use this for wizard-like flows or step-by-step forms.
 */
export function SlidePageTransition({ children }: PageTransitionProps) {
    const pathname = usePathname()

    const variants = {
        initial: {
            opacity: 0,
            x: 50
        },
        enter: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94] as const
            }
        },
        exit: {
            opacity: 0,
            x: -50,
            transition: {
                duration: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94] as const
            }
        }
    }

    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key={pathname}
                initial="initial"
                animate="enter"
                exit="exit"
                variants={variants}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    )
}

/**
 * ScalePageTransition - Scale transition variant.
 * 
 * Creates a zoom-in/zoom-out effect between pages.
 */
export function ScalePageTransition({ children }: PageTransitionProps) {
    const pathname = usePathname()

    const variants = {
        initial: {
            opacity: 0,
            scale: 0.98
        },
        enter: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94] as const
            }
        },
        exit: {
            opacity: 0,
            scale: 1.02,
            transition: {
                duration: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94] as const
            }
        }
    }

    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key={pathname}
                initial="initial"
                animate="enter"
                exit="exit"
                variants={variants}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    )
}
