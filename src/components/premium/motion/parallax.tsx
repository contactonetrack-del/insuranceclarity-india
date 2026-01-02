'use client'

import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface ParallaxSectionProps {
    children: ReactNode
    className?: string
    /** Speed multiplier. 0.5 = moves at half scroll speed, 2 = twice scroll speed */
    speed?: number
    /** Direction of parallax movement */
    direction?: 'up' | 'down'
}

/**
 * ParallaxSection - Creates parallax scrolling effect on children.
 * 
 * Based on patterns from SVGator's Scrollytelling (#2) and Awwwards examples.
 * Respects prefers-reduced-motion accessibility setting.
 */
export function ParallaxSection({
    children,
    className,
    speed = 0.5,
    direction = 'up'
}: ParallaxSectionProps) {
    const ref = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end start']
    })
    const prefersReducedMotion = useReducedMotion()

    // Calculate movement range based on speed
    const range = 100 * speed
    const outputRange = direction === 'up' ? [range, -range] : [-range, range]
    const y = useTransform(scrollYProgress, [0, 1], outputRange)

    // Skip parallax if user prefers reduced motion
    if (prefersReducedMotion) {
        return (
            <div ref={ref} className={cn('relative overflow-hidden', className)}>
                <div>{children}</div>
            </div>
        )
    }

    return (
        <div ref={ref} className={cn('relative overflow-hidden', className)}>
            <motion.div style={{ y }}>
                {children}
            </motion.div>
        </div>
    )
}

interface ParallaxImageProps {
    src: string
    alt: string
    className?: string
    speed?: number
    /** Scale factor for the image to allow movement without gaps */
    scale?: number
}

/**
 * ParallaxImage - Background image with parallax scrolling effect.
 * 
 * The image is scaled up to prevent gaps during parallax movement.
 * Respects prefers-reduced-motion accessibility setting.
 */
export function ParallaxImage({
    src,
    alt,
    className,
    speed = 0.3,
    scale = 1.2
}: ParallaxImageProps) {
    const ref = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end start']
    })
    const prefersReducedMotion = useReducedMotion()

    const range = 50 * speed
    const y = useTransform(scrollYProgress, [0, 1], [range, -range])

    // Skip parallax animation if user prefers reduced motion
    if (prefersReducedMotion) {
        return (
            <div ref={ref} className={cn('absolute inset-0 overflow-hidden', className)}>
                <img
                    src={src}
                    alt={alt}
                    className="absolute inset-0 w-full h-full object-cover"
                />
            </div>
        )
    }

    return (
        <div ref={ref} className={cn('absolute inset-0 overflow-hidden', className)}>
            <motion.img
                src={src}
                alt={alt}
                style={{
                    y,
                    scale,
                }}
                className="absolute inset-0 w-full h-full object-cover"
            />
        </div>
    )
}

interface ScrollProgressProps {
    className?: string
    /** Custom motion value for scroll progress, defaults to document scroll */
    progress?: MotionValue<number>
}

/**
 * ScrollProgress - Horizontal progress bar showing scroll position.
 */
export function ScrollProgress({ className, progress }: ScrollProgressProps) {
    const { scrollYProgress } = useScroll()
    const scaleX = progress || scrollYProgress

    return (
        <motion.div
            className={cn(
                'fixed top-0 left-0 right-0 h-1 bg-gradient-accent origin-left z-50',
                className
            )}
            style={{ scaleX }}
        />
    )
}
