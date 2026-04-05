'use client'

import { motion, type Variants } from 'framer-motion'
import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type IconAnimation = 'bounce' | 'rotate' | 'scale' | 'shake' | 'pulse' | 'none'

interface AnimatedIconProps {
    icon: LucideIcon
    className?: string
    /** Size of the icon */
    size?: 'sm' | 'md' | 'lg' | 'xl'
    /** Animation on hover */
    hoverAnimation?: IconAnimation
    /** Animation on entrance */
    entranceAnimation?: 'scale' | 'fade' | 'none'
    /** Stroke width */
    strokeWidth?: number
}

const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
}

const hoverAnimations: Record<IconAnimation, Variants> = {
    bounce: {
        initial: { y: 0 },
        hover: { y: [-2, 2, -2, 0] }
    },
    rotate: {
        initial: { rotate: 0 },
        hover: { rotate: 360 }
    },
    scale: {
        initial: { scale: 1 },
        hover: { scale: 1.2 }
    },
    shake: {
        initial: { x: 0 },
        hover: { x: [-2, 2, -2, 2, 0] }
    },
    pulse: {
        initial: { scale: 1 },
        hover: { scale: [1, 1.1, 1] }
    },
    none: {
        initial: {},
        hover: {}
    }
}

/**
 * AnimatedIcon - Lucide icon with hover and entrance animations.
 * 
 * Based on Jitter animated icon templates and 60fps.design Icon category.
 */
export function AnimatedIcon({
    icon: Icon,
    className,
    size = 'md',
    hoverAnimation = 'bounce',
    entranceAnimation = 'none',
    strokeWidth = 2
}: AnimatedIconProps) {
    const entranceVariants: Variants = entranceAnimation === 'scale'
        ? {
            hidden: { scale: 0, opacity: 0 },
            visible: { scale: 1, opacity: 1 }
        }
        : entranceAnimation === 'fade'
            ? {
                hidden: { opacity: 0 },
                visible: { opacity: 1 }
            }
            : {
                hidden: {},
                visible: {}
            }

    return (
        <motion.span
            className={cn('inline-flex', className)}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            variants={{
                ...entranceVariants,
                ...hoverAnimations[hoverAnimation]
            }}
            transition={{
                type: 'spring',
                stiffness: 400,
                damping: 17
            }}
        >
            <Icon className={sizeClasses[size]} strokeWidth={strokeWidth} />
        </motion.span>
    )
}

interface IconContainerProps {
    icon: LucideIcon
    className?: string
    /** Container size */
    size?: 'sm' | 'md' | 'lg' | 'xl'
    /** Background variant */
    variant?: 'solid' | 'gradient' | 'glass'
    /** Gradient colors (for gradient variant) */
    gradientFrom?: string
    gradientTo?: string
    /** Enable hover animation */
    hover?: boolean
}

const containerSizes = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-14 h-14',
    xl: 'w-16 h-16'
}

const iconInContainerSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
    xl: 'w-8 h-8'
}

/**
 * IconContainer - Icon with background container and animations.
 * 
 * Used for feature icons, category icons, etc.
 */
export function IconContainer({
    icon: Icon,
    className,
    size = 'md',
    variant = 'gradient',
    gradientFrom = 'from-[rgb(var(--color-accent))]',
    gradientTo = 'to-[rgb(var(--color-accent-dark))]',
    hover = true
}: IconContainerProps) {
    const baseClasses = cn(
        'flex items-center justify-center rounded-xl',
        containerSizes[size]
    )

    const variantClasses = {
        solid: 'bg-accent-10',
        gradient: cn('bg-gradient-to-br', gradientFrom, gradientTo, 'shadow-sm'),
        glass: 'glass'
    }

    const hoverVariants: Variants = {
        initial: { scale: 1 },
        hover: { scale: 1.05 }
    }

    return (
        <motion.div
            className={cn(baseClasses, variantClasses[variant], className)}
            initial="initial"
            whileHover={hover ? 'hover' : undefined}
            variants={hoverVariants}
            transition={{
                type: 'spring',
                stiffness: 400,
                damping: 17
            }}
        >
            <Icon
                className={cn(
                    iconInContainerSizes[size],
                    variant === 'gradient' ? 'text-white' : 'text-accent'
                )}
                strokeWidth={2}
            />
        </motion.div>
    )
}
