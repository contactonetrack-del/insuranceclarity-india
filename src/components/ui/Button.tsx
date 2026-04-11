'use client'

import { motion, type Variants, type Transition } from 'framer-motion'
import { type ReactNode, type ButtonHTMLAttributes, forwardRef } from 'react'
import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  glow?: boolean
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
 * Universally merged Button Component
 * Supports standard enterprise variants (primary, secondary, outline, danger)
 * while inheriting Framer Motion physics and glow effects from the premium UI kit.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      children,
      variant = 'primary',
      size = 'md',
      icon: Icon,
      iconPosition = 'left',
      glow = false,
      loading = false,
      className,
      disabled,
      ...props
    },
    ref
  ) {
    const isDisabled = disabled || loading

    const baseClasses = cn(
      'relative inline-flex items-center justify-center font-semibold rounded-xl',
      'transition-colors duration-200',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:opacity-60 disabled:cursor-not-allowed',
      sizeClasses[size]
    )

    const variantClasses: Record<ButtonVariant, string> = {
      primary: cn(
        'bg-gradient-accent text-white',
        'focus-visible:ring-focus-ring',
        glow && 'shadow-glow hover:shadow-glow-lg hero-glow'
      ),
      secondary: cn(
        'glass text-theme-primary',
        'hover:border-hover hover:bg-theme-secondary/50',
        'focus-visible:ring-focus-ring'
      ),
      outline: cn(
        'bg-transparent border border-default text-theme-primary',
        'hover:bg-accent/5 hover:border-accent/30',
        'focus-visible:ring-focus-ring'
      ),
      ghost: cn(
        'bg-transparent text-theme-primary',
        'hover:bg-accent/10',
        'focus-visible:ring-focus-ring'
      ),
      danger: cn(
        'bg-red-500 text-white shadow-md',
        'hover:bg-red-600',
        'focus-visible:ring-red-500'
      )
    }

    const buttonVariants: Variants = {
      initial: { scale: 1 },
      hover: { scale: 1.02, y: -2 },
      tap: { scale: 0.98, y: 0 }
    }

    const springTransition: Transition = {
      type: 'spring',
      stiffness: 400,
      damping: 17
    }

    const iconVariants: Variants = {
      initial: { x: 0, opacity: 1 },
      hover: iconPosition === 'right' ? { x: 3 } : { x: -3 }
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
        {loading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className={cn('border-2 border-current border-t-transparent rounded-full', iconSizes[size])}
          />
        )}

        {!loading && Icon && iconPosition === 'left' && (
          <motion.span variants={iconVariants} transition={springTransition}>
            <Icon className={iconSizes[size]} strokeWidth={2} />
          </motion.span>
        )}

        {!loading && <span>{children}</span>}

        {!loading && Icon && iconPosition === 'right' && (
          <motion.span variants={iconVariants} transition={springTransition}>
            <Icon className={iconSizes[size]} strokeWidth={2} />
          </motion.span>
        )}
      </motion.button>
    )
  }
)

export default Button
