'use client'

import { motion, type Variants, type Transition } from 'framer-motion'
import { type ReactNode, type ButtonHTMLAttributes, forwardRef } from 'react'
import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface MagicButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
    children: ReactNode
    variant?: ButtonVariant
    size?: ButtonSize
    icon?: LucideIcon
    iconPosition?: 'left' | 'right'
    /** Enable glow effect */
    glow?: boolean
    /** Enable ripple effect on click */
    ripple?: boolean
    /** Loading state */
    loading?: boolean
}

const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-4 py-2 text-sm gap-1.5',
    md: 'px-5 py-2.5 text-base gap-2',
    lg: 'px-7 py-3.5 text-lg gap-2.5'
}

const iconSizes: Record<ButtonSize, string> = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
}

/**
 * MagicButton - Premium animated button with physics-based interactions.
 * 
 * Features:
 * - Spring-based hover/tap animations (from Animate UI)
 * - Glow effect on hover (from MagicUI)
 * - Icon reveal on hover
 * - Loading state with spinner
 * 
 * Based on patterns from animate-ui.com, magicui.design, and 60fps.design
 */
export const MagicButton = forwardRef<HTMLButtonElement, MagicButtonProps>(
    function MagicButton(
        {
            children,
            variant = 'primary',
            size = 'md',
            icon: Icon,
            iconPosition = 'left',
            glow = false,
            ripple = false,
            loading = false,
            className,
            disabled,
            ...props
        },
        ref
    ) {
        const isDisabled = disabled || loading

        // Base classes for all variants
        const baseClasses = cn(
            'relative inline-flex items-center justify-center font-semibold rounded-xl',
            'transition-colors duration-200',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            sizeClasses[size]
        )

        // Variant-specific classes
        const variantClasses: Record<ButtonVariant, string> = {
            primary: cn(
                'bg-gradient-accent text-white',
                'focus-visible:ring-[rgb(var(--color-accent))]',
                glow && 'shadow-glow hover:shadow-glow-lg'
            ),
            secondary: cn(
                'glass text-theme-primary',
                'hover:border-hover',
                'focus-visible:ring-[rgb(var(--color-accent))]'
            ),
            ghost: cn(
                'bg-transparent text-theme-primary',
                'hover:bg-accent-10',
                'focus-visible:ring-[rgb(var(--color-accent))]'
            )
        }

        // Animation variants
        const buttonVariants: Variants = {
            initial: { scale: 1 },
            hover: { scale: 1.02 },
            tap: { scale: 0.98 }
        }

        const springTransition: Transition = {
            type: 'spring',
            stiffness: 400,
            damping: 17
        }

        const iconVariants: Variants = {
            initial: { x: 0, opacity: 1 },
            hover: iconPosition === 'right'
                ? { x: 3, opacity: 1 }
                : { x: -3, opacity: 1 }
        }

        return (
            <motion.button
                ref={ref}
                className={cn(baseClasses, variantClasses[variant], className)}
                disabled={isDisabled}
                initial="initial"
                whileHover={!isDisabled ? 'hover' : undefined}
                whileTap={!isDisabled ? 'tap' : undefined}
                variants={buttonVariants}
                transition={springTransition}
                {...props}
            >
                {/* Loading spinner */}
                {loading && (
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className={cn('border-2 border-current border-t-transparent rounded-full', iconSizes[size])}
                    />
                )}

                {/* Left icon */}
                {!loading && Icon && iconPosition === 'left' && (
                    <motion.span variants={iconVariants} transition={springTransition}>
                        <Icon className={iconSizes[size]} strokeWidth={2} />
                    </motion.span>
                )}

                {/* Button text */}
                {!loading && <span>{children}</span>}

                {/* Right icon */}
                {!loading && Icon && iconPosition === 'right' && (
                    <motion.span variants={iconVariants} transition={springTransition}>
                        <Icon className={iconSizes[size]} strokeWidth={2} />
                    </motion.span>
                )}
            </motion.button>
        )
    }
)

interface GlowButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
    children: ReactNode
    /** Intensity of the glow animation */
    intensity?: 'subtle' | 'medium' | 'strong'
}

/**
 * GlowButton - Button with animated pulsing glow effect.
 * 
 * Based on Awwwards "Ripple gradient button hover effect"
 */
export const GlowButton = forwardRef<HTMLButtonElement, GlowButtonProps>(
    function GlowButton(
        { children, intensity = 'medium', className, ...props },
        ref
    ) {
        const glowIntensity = {
            subtle: 'shadow-glow-sm',
            medium: 'shadow-glow',
            strong: 'shadow-glow-lg'
        }

        return (
            <motion.button
                ref={ref}
                className={cn(
                    'relative inline-flex items-center justify-center',
                    'px-6 py-3 font-semibold rounded-xl',
                    'bg-gradient-accent text-white',
                    glowIntensity[intensity],
                    className
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                animate={{
                    boxShadow: [
                        'var(--glow-sm)',
                        'var(--glow-lg)',
                        'var(--glow-sm)'
                    ]
                }}
                // transition={{
                //     boxShadow: {
                //         duration: 2,
                //         repeat: Infinity,
                //         ease: 'easeInOut'
                //     }
                // }}
                {...props}
            >
                {children}
            </motion.button>
        )
    }
)
