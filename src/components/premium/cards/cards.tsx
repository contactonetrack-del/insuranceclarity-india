'use client'

import { motion, type Variants, type Transition } from 'framer-motion'
import { type ReactNode, type HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface GlassCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
    children: ReactNode
    /** Enable hover lift effect */
    hover?: boolean
    /** Enable animated gradient border on hover */
    animatedBorder?: boolean
    /** Enable glow on hover */
    glowOnHover?: boolean
    /** Padding size */
    padding?: 'sm' | 'md' | 'lg' | 'none'
}

const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
}

/**
 * GlassCard - Premium glassmorphism card with animated effects.
 * 
 * Based on SVGator's Glassmorphic Animation Effect (#28) and MagicUI patterns.
 */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
    function GlassCard(
        {
            children,
            hover = true,
            animatedBorder = false,
            glowOnHover = false,
            padding = 'md',
            className,
            ...props
        },
        ref
    ) {
        const cardVariants: Variants = {
            initial: {
                y: 0,
                boxShadow: 'var(--shadow-sm)'
            },
            hover: {
                y: -6,
                boxShadow: glowOnHover
                    ? 'var(--shadow-xl), var(--glow-md)'
                    : 'var(--shadow-xl)'
            }
        }

        const transition: Transition = {
            type: 'spring',
            stiffness: 300,
            damping: 20
        }

        return (
            <motion.div
                ref={ref}
                className={cn(
                    'relative rounded-2xl overflow-hidden',
                    'glass',
                    paddingClasses[padding],
                    animatedBorder && 'border-transparent',
                    className
                )}
                initial="initial"
                whileHover={hover ? 'hover' : undefined}
                variants={cardVariants}
                transition={transition}
                {...props}
            >
                {/* Animated gradient border overlay */}
                {animatedBorder && (
                    <motion.div
                        className="absolute inset-0 rounded-2xl pointer-events-none"
                        style={{
                            background: 'linear-gradient(90deg, transparent, rgba(var(--color-accent-rgb), 0.3), transparent)',
                            backgroundSize: '200% 100%'
                        }}
                        animate={{
                            backgroundPosition: ['0% 0%', '200% 0%']
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: 'linear'
                        }}
                    />
                )}

                {/* Content */}
                <div className="relative z-10">{children}</div>
            </motion.div>
        )
    }
)

interface ElevatedCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
    children: ReactNode
    /** Enable 3D tilt effect on hover */
    tilt?: boolean
    /** Enable image zoom on hover */
    imageZoom?: boolean
    padding?: 'sm' | 'md' | 'lg' | 'none'
}

/**
 * ElevatedCard - Card that lifts and elevates on hover with shadow.
 * 
 * Based on 60fps.design Card patterns and Awwwards examples.
 */
export const ElevatedCard = forwardRef<HTMLDivElement, ElevatedCardProps>(
    function ElevatedCard(
        {
            children,
            tilt = false,
            imageZoom = false,
            padding = 'md',
            className,
            ...props
        },
        ref
    ) {
        const cardVariants: Variants = {
            initial: {
                y: 0,
                boxShadow: 'var(--shadow-md)'
            },
            hover: {
                y: -8,
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
            }
        }

        return (
            <motion.div
                ref={ref}
                className={cn(
                    'rounded-2xl overflow-hidden',
                    'bg-theme-primary border border-default',
                    paddingClasses[padding],
                    className
                )}
                initial="initial"
                whileHover="hover"
                variants={cardVariants}
                transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 20
                }}
                {...props}
            >
                {children}
            </motion.div>
        )
    }
)

interface BentoCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
    children: ReactNode
    /** Grid span for width (1-4) */
    colSpan?: 1 | 2 | 3 | 4
    /** Grid span for height (1-3) */
    rowSpan?: 1 | 2 | 3
    /** Featured card with special styling */
    featured?: boolean
}

const colSpanClasses = {
    1: 'col-span-1',
    2: 'md:col-span-2',
    3: 'md:col-span-3',
    4: 'col-span-full'
}

const rowSpanClasses = {
    1: 'row-span-1',
    2: 'md:row-span-2',
    3: 'md:row-span-3'
}

/**
 * BentoCard - Card for modern bento-grid layouts.
 * 
 * Based on SVGator's Bento-style grids (#24) and MagicUI showcase.
 */
export const BentoCard = forwardRef<HTMLDivElement, BentoCardProps>(
    function BentoCard(
        {
            children,
            colSpan = 1,
            rowSpan = 1,
            featured = false,
            className,
            ...props
        },
        ref
    ) {
        return (
            <motion.div
                ref={ref}
                className={cn(
                    'glass rounded-2xl p-6 overflow-hidden',
                    colSpanClasses[colSpan],
                    rowSpanClasses[rowSpan],
                    featured && 'bg-gradient-to-br from-accent-5 to-transparent',
                    className
                )}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 20
                }}
                {...props}
            >
                {children}
            </motion.div>
        )
    }
)
