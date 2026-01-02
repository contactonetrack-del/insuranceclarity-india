'use client'

import { motion, useInView, type Variants, type Transition } from 'framer-motion'
import { useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'

type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade'

interface RevealOnScrollProps {
    children: ReactNode
    className?: string
    direction?: RevealDirection
    delay?: number
    duration?: number
    once?: boolean
    threshold?: number
    /** Distance to travel during animation (px) */
    distance?: number
}

const directionVariants = {
    up: {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0 }
    },
    down: {
        hidden: { opacity: 0, y: -40 },
        visible: { opacity: 1, y: 0 }
    },
    left: {
        hidden: { opacity: 0, x: -40 },
        visible: { opacity: 1, x: 0 }
    },
    right: {
        hidden: { opacity: 0, x: 40 },
        visible: { opacity: 1, x: 0 }
    },
    scale: {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1 }
    },
    fade: {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    }
} as const

/**
 * RevealOnScroll - Animates children when they enter the viewport.
 * 
 * Based on patterns from animate-ui.com and 60fps.design
 * Respects prefers-reduced-motion accessibility setting.
 */
export function RevealOnScroll({
    children,
    className,
    direction = 'up',
    delay = 0,
    duration = 0.5,
    once = true,
    threshold = 0.2,
    distance
}: RevealOnScrollProps) {
    const ref = useRef<HTMLDivElement>(null)
    const isInView = useInView(ref, { once, amount: threshold })
    const prefersReducedMotion = useReducedMotion()

    // Skip animation if user prefers reduced motion
    if (prefersReducedMotion) {
        return <div ref={ref} className={cn(className)}>{children}</div>
    }

    // Build variants with custom distance if provided
    const getVariants = (): Variants => {
        const base = directionVariants[direction]
        if (!distance) return base as Variants

        if (direction === 'up') {
            return { hidden: { opacity: 0, y: distance }, visible: { opacity: 1, y: 0 } }
        } else if (direction === 'down') {
            return { hidden: { opacity: 0, y: -distance }, visible: { opacity: 1, y: 0 } }
        } else if (direction === 'left') {
            return { hidden: { opacity: 0, x: -distance }, visible: { opacity: 1, x: 0 } }
        } else if (direction === 'right') {
            return { hidden: { opacity: 0, x: distance }, visible: { opacity: 1, x: 0 } }
        }
        return base as Variants
    }

    const transition: Transition = {
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94] // Smooth ease-out
    }

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={getVariants()}
            transition={transition}
            className={cn(className)}
        >
            {children}
        </motion.div>
    )
}

interface StaggerContainerProps {
    children: ReactNode
    className?: string
    /** Delay between each child animation */
    staggerDelay?: number
    /** Initial delay before first child animates */
    delayChildren?: number
    once?: boolean
    threshold?: number
}

/**
 * StaggerContainer - Animates children with staggered timing.
 * 
 * Wrap your items with this component and they will animate in sequence.
 * Based on patterns from MagicUI and animate-ui.com
 * Respects prefers-reduced-motion accessibility setting.
 */
export function StaggerContainer({
    children,
    className,
    staggerDelay = 0.1,
    delayChildren = 0,
    once = true,
    threshold = 0.1
}: StaggerContainerProps) {
    const ref = useRef<HTMLDivElement>(null)
    const isInView = useInView(ref, { once, amount: threshold })
    const prefersReducedMotion = useReducedMotion()

    // Skip animation if user prefers reduced motion
    if (prefersReducedMotion) {
        return <div ref={ref} className={cn(className)}>{children}</div>
    }

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: staggerDelay,
                delayChildren
            }
        }
    }

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={containerVariants}
            className={cn(className)}
        >
            {children}
        </motion.div>
    )
}

interface StaggerItemProps {
    children: ReactNode
    className?: string
    direction?: RevealDirection
}

/**
 * StaggerItem - Individual item within a StaggerContainer.
 * 
 * Use inside StaggerContainer for coordinated staggered animations.
 * Respects prefers-reduced-motion accessibility setting.
 */
export function StaggerItem({
    children,
    className,
    direction = 'up'
}: StaggerItemProps) {
    const prefersReducedMotion = useReducedMotion()

    // Skip animation if user prefers reduced motion
    if (prefersReducedMotion) {
        return <div className={cn(className)}>{children}</div>
    }

    const itemVariants: Variants = {
        hidden: { ...directionVariants[direction].hidden },
        visible: {
            ...directionVariants[direction].visible,
            transition: {
                duration: 0.5,
                ease: [0.25, 0.46, 0.45, 0.94]
            }
        }
    }

    return (
        <motion.div variants={itemVariants} className={cn(className)}>
            {children}
        </motion.div>
    )
}
