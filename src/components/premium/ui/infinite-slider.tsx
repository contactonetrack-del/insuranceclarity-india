'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface InfiniteSliderProps {
    children: React.ReactNode
    gap?: number
    duration?: number
    direction?: 'left' | 'right'
    pauseOnHover?: boolean
    className?: string
}

/**
 * InfiniteSlider - Infinite horizontal marquee/carousel for logos.
 * 
 * Respects prefers-reduced-motion accessibility setting.
 */
export function InfiniteSlider({
    children,
    gap = 40,
    duration = 25,
    direction = 'left',
    pauseOnHover = true,
    className
}: InfiniteSliderProps) {
    const prefersReducedMotion = useReducedMotion()

    // CSS custom property for gap - needed for animation calc
    const gapVar = { '--marquee-gap': `${gap}px` } as React.CSSProperties

    // If user prefers reduced motion, show static content without animation
    if (prefersReducedMotion) {
        return (
            <div
                className={cn(
                    "relative overflow-x-auto w-full select-none",
                    className
                )}
            >
                <div
                    className="flex shrink-0 items-center justify-center"
                    style={{ gap: `${gap}px` }}
                >
                    {children}
                </div>

                {/* Fade masks */}
                <div className="absolute top-0 left-0 h-full w-16 bg-gradient-to-r from-white to-transparent dark:from-slate-950 dark:to-transparent z-10 pointer-events-none" />
                <div className="absolute top-0 right-0 h-full w-16 bg-gradient-to-l from-white to-transparent dark:from-slate-950 dark:to-transparent z-10 pointer-events-none" />
            </div>
        )
    }

    return (
        <div
            className={cn(
                "marquee relative overflow-hidden w-full select-none group",
                className
            )}
            style={gapVar}
        >
            {/* First copy */}
            <div
                className={cn(
                    "marquee__content flex shrink-0 items-center",
                    pauseOnHover && "group-hover:[animation-play-state:paused]"
                )}
                style={{
                    gap: `${gap}px`,
                    animation: `marquee-scroll ${duration}s linear infinite`,
                    animationDirection: direction === 'right' ? 'reverse' : 'normal'
                }}
            >
                {children}
            </div>

            {/* Second copy for seamless loop */}
            <div
                className={cn(
                    "marquee__content flex shrink-0 items-center",
                    pauseOnHover && "group-hover:[animation-play-state:paused]"
                )}
                style={{
                    gap: `${gap}px`,
                    animation: `marquee-scroll ${duration}s linear infinite`,
                    animationDirection: direction === 'right' ? 'reverse' : 'normal'
                }}
                aria-hidden="true"
            >
                {children}
            </div>

            {/* Fade masks */}
            <div className="absolute top-0 left-0 h-full w-16 bg-gradient-to-r from-white to-transparent dark:from-slate-950 dark:to-transparent z-10 pointer-events-none" />
            <div className="absolute top-0 right-0 h-full w-16 bg-gradient-to-l from-white to-transparent dark:from-slate-950 dark:to-transparent z-10 pointer-events-none" />
        </div>
    )
}
