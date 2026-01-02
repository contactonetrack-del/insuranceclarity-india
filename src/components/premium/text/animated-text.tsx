'use client'

import { motion, useMotionValue, useTransform, animate, type Variants } from 'framer-motion'
import { useEffect, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AnimatedHeadingProps {
    text: string
    className?: string
    /** Animation type */
    animation?: 'letterByLetter' | 'wordByWord' | 'fade'
    /** Delay between each character/word */
    staggerDelay?: number
    /** Initial delay before animation starts */
    delay?: number
    /** HTML tag to use */
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span'
}

/**
 * AnimatedHeading - Text reveal with staggered letter or word animations.
 * 
 * Based on SVGator's Expressive Typography (#4) and MagicUI patterns.
 */
export function AnimatedHeading({
    text,
    className,
    animation = 'wordByWord',
    staggerDelay = 0.05,
    delay = 0,
    as: Tag = 'h1'
}: AnimatedHeadingProps) {
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: staggerDelay,
                delayChildren: delay
            }
        }
    }

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94]
            }
        }
    }

    const items = animation === 'letterByLetter'
        ? text.split('')
        : text.split(' ')

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className={cn('inline-flex flex-wrap', className)}
            aria-label={text}
        >
            {items.map((item, index) => (
                <motion.span
                    key={index}
                    variants={itemVariants}
                    className="inline-block"
                >
                    {animation === 'letterByLetter'
                        ? (item === ' ' ? '\u00A0' : item)
                        : item}
                    {animation === 'wordByWord' && index < items.length - 1 && '\u00A0'}
                </motion.span>
            ))}
        </motion.div>
    )
}

interface AnimatedCounterProps {
    value: number
    /** Duration of the count animation in seconds */
    duration?: number
    /** Delay before animation starts */
    delay?: number
    /** Format function (e.g., add commas, currency, etc.) */
    formatFn?: (value: number) => string
    className?: string
    /** Suffix to display after the number (e.g., '+', '%') */
    suffix?: string
    /** Prefix to display before the number (e.g., '$', '₹') */
    prefix?: string
}

/**
 * AnimatedCounter - Smooth number counting animation.
 * 
 * Based on MagicUI's counter components and 60fps.design patterns.
 */
export function AnimatedCounter({
    value,
    duration = 1.5,
    delay = 0,
    formatFn = (v) => Math.round(v).toString(),
    className,
    suffix = '',
    prefix = ''
}: AnimatedCounterProps) {
    const motionValue = useMotionValue(0)
    const rounded = useTransform(motionValue, (latest) => formatFn(latest))

    useEffect(() => {
        const controls = animate(motionValue, value, {
            duration,
            delay,
            ease: [0.25, 0.46, 0.45, 0.94]
        })

        return () => controls.stop()
    }, [value, duration, delay, motionValue])

    return (
        <span className={cn('tabular-nums', className)}>
            {prefix}
            <motion.span>{rounded}</motion.span>
            {suffix}
        </span>
    )
}

interface GradientTextProps {
    children: ReactNode
    className?: string
    /** Enable animated gradient movement */
    animate?: boolean
    /** Animation duration in seconds */
    duration?: number
}

/**
 * GradientText - Text with animated gradient background.
 * 
 * Based on SVGator's Animated Gradient Effects (#18) and MagicUI patterns.
 */
export function GradientText({
    children,
    className,
    animate: shouldAnimate = true,
    duration = 3
}: GradientTextProps) {
    return (
        <motion.span
            className={cn(
                'inline-block bg-clip-text text-transparent',
                'bg-gradient-to-r from-[rgb(var(--color-accent))] via-[rgb(var(--color-accent-light))] to-[rgb(var(--color-accent))]',
                'bg-[length:200%_auto]',
                className
            )}
            animate={shouldAnimate ? {
                backgroundPosition: ['0% center', '200% center']
            } : undefined}
            transition={shouldAnimate ? {
                duration,
                repeat: Infinity,
                ease: 'linear'
            } : undefined}
        >
            {children}
        </motion.span>
    )
}

interface TypewriterProps {
    text: string
    className?: string
    /** Delay between each character in seconds */
    speed?: number
    /** Initial delay before typing starts */
    delay?: number
    /** Show cursor */
    cursor?: boolean
}

/**
 * Typewriter - Types out text character by character.
 */
export function Typewriter({
    text,
    className,
    speed = 0.05,
    delay = 0,
    cursor = true
}: TypewriterProps) {
    const containerVariants: Variants = {
        hidden: { opacity: 1 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: speed,
                delayChildren: delay
            }
        }
    }

    const charVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    }

    return (
        <motion.span
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className={cn('inline-block', className)}
            aria-label={text}
        >
            {text.split('').map((char, index) => (
                <motion.span
                    key={index}
                    variants={charVariants}
                    className="inline-block"
                >
                    {char === ' ' ? '\u00A0' : char}
                </motion.span>
            ))}
            {cursor && (
                <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="inline-block ml-0.5"
                >
                    |
                </motion.span>
            )}
        </motion.span>
    )
}
