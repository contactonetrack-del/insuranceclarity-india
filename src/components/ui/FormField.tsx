'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface FormFieldProps {
    id?: string
    label?: string
    error?: string
    description?: string
    children: ReactNode
    className?: string
    required?: boolean
}

/**
 * FormField - A consistent wrapper for form inputs (input, select, textarea).
 * Handles labels, validation error states, and accessibility.
 */
export function FormField({
    id,
    label,
    error,
    description,
    children,
    className,
    required
}: FormFieldProps) {
    return (
        <div className={cn('flex flex-col gap-1.5 w-full', className)}>
            {label && (
                <label htmlFor={id} className="text-sm font-semibold text-theme-primary flex items-center gap-1">
                    {label}
                    {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div className="relative">
                {children}
            </div>

            {error && (
                <p className="text-xs font-medium text-red-500 animate-fade-in-up">
                    {error}
                </p>
            )}

            {description && !error && (
                <p className="text-xs text-theme-muted">
                    {description}
                </p>
            )}
        </div>
    )
}

/**
 * Common Input/Select classes for consistency
 */
export const inputClasses = cn(
    'w-full px-4 py-2.5 rounded-xl border border-default bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm',
    'focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all',
    'disabled:opacity-50 disabled:cursor-not-allowed text-theme-primary placeholder:text-theme-muted',
    'aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-500/20'
)
