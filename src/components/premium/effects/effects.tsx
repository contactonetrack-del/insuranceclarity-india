'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AnimatedBlobProps {
    className?: string
    /** Color of the blob */
    color?: string
    /** Blur amount */
    blur?: 'sm' | 'md' | 'lg' | 'xl'
    /** Animation duration in seconds */
    duration?: number
    /** Opacity */
    opacity?: number
}

const blurClasses = {
    sm: 'blur-2xl',
    md: 'blur-3xl',
    lg: 'blur-[80px]',
    xl: 'blur-[100px]'
}

/**
 * AnimatedBlob - Morphing blob background effect.
 * 
 * Based on SVGator's Liquid Motion Effects (#17) and MagicUI patterns.
 */
export function AnimatedBlob({
    className,
    color = 'rgba(var(--color-accent-rgb), 0.3)',
    blur = 'lg',
    duration = 8,
    opacity = 0.6
}: AnimatedBlobProps) {
    return (
        <motion.div
            className={cn(
                'absolute rounded-full pointer-events-none',
                blurClasses[blur],
                className
            )}
            style={{
                backgroundColor: color,
                opacity
            }}
            animate={{
                scale: [1, 1.2, 1.1, 1],
                x: [0, 30, -20, 0],
                y: [0, -30, 20, 0],
                borderRadius: ['40%', '60%', '50%', '40%']
            }}
            transition={{
                duration,
                repeat: Infinity,
                ease: 'easeInOut'
            }}
        />
    )
}

interface AnimatedGradientBgProps {
    className?: string
    /** Gradient colors */
    colors?: string[]
    /** Animation duration in seconds */
    duration?: number
}

/**
 * AnimatedGradientBg - Shifting gradient background.
 * 
 * Based on SVGator's Animated Gradient Effects (#18).
 */
export function AnimatedGradientBg({
    className,
    colors = [
        'rgba(var(--color-accent-rgb), 0.15)',
        'rgba(var(--color-accent-light), 0.1)',
        'rgba(var(--color-accent-rgb), 0.15)'
    ],
    duration = 8
}: AnimatedGradientBgProps) {
    return (
        <motion.div
            className={cn('absolute inset-0 pointer-events-none', className)}
            style={{
                background: `linear-gradient(135deg, ${colors.join(', ')})`,
                backgroundSize: '400% 400%'
            }}
            animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{
                duration,
                repeat: Infinity,
                ease: 'easeInOut'
            }}
        />
    )
}

interface FloatingElementProps {
    children: React.ReactNode
    className?: string
    /** Float range in pixels */
    range?: number
    /** Animation duration in seconds */
    duration?: number
    /** Delay before starting */
    delay?: number
}

/**
 * FloatingElement - Makes children float up and down.
 */
export function FloatingElement({
    children,
    className,
    range = 15,
    duration = 4,
    delay = 0
}: FloatingElementProps) {
    return (
        <motion.div
            className={cn(className)}
            animate={{
                y: [-range / 2, range / 2, -range / 2]
            }}
            transition={{
                duration,
                repeat: Infinity,
                ease: 'easeInOut',
                delay
            }}
        >
            {children}
        </motion.div>
    )
}

interface ShimmerProps {
    className?: string
    /** Width of the shimmer element */
    width?: string
    /** Height of the shimmer element */
    height?: string
}

/**
 * Shimmer - Loading skeleton with shimmer effect.
 * 
 * Based on SVGator's Loading Skeleton Screens (#24).
 */
export function Shimmer({
    className,
    width = '100%',
    height = '1rem'
}: ShimmerProps) {
    return (
        <motion.div
            className={cn('rounded-lg overflow-hidden', className)}
            style={{ width, height }}
        >
            <motion.div
                className="w-full h-full"
                style={{
                    background: 'linear-gradient(90deg, rgba(var(--color-text-muted), 0.1) 0%, rgba(var(--color-text-muted), 0.2) 50%, rgba(var(--color-text-muted), 0.1) 100%)',
                    backgroundSize: '200% 100%'
                }}
                animate={{
                    backgroundPosition: ['-100% 0%', '200% 0%']
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'linear'
                }}
            />
        </motion.div>
    )
}

interface SkeletonCardProps {
    className?: string
    /** Show image placeholder */
    hasImage?: boolean
    /** Number of text lines */
    lines?: number
}

/**
 * SkeletonCard - Card-shaped loading skeleton.
 */
export function SkeletonCard({
    className,
    hasImage = true,
    lines = 3
}: SkeletonCardProps) {
    return (
        <div className={cn('glass rounded-2xl overflow-hidden', className)}>
            {hasImage && (
                <Shimmer height="12rem" className="rounded-none" />
            )}
            <div className="p-6 space-y-3">
                <Shimmer height="1.5rem" width="75%" />
                {Array.from({ length: lines }).map((_, i) => (
                    <Shimmer
                        key={i}
                        height="1rem"
                        width={i === lines - 1 ? '50%' : '100%'}
                    />
                ))}
            </div>
        </div>
    )
}
