'use client'

import { LucideIcon } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  loading?: boolean
  glow?: boolean
  children: React.ReactNode
}

const iconSizes = {
  sm: 16,
  md: 18,
  lg: 20,
}

export default function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  glow = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = `
    inline-flex items-center justify-center gap-2 font-medium
    transition-all active:scale-[0.98]
    disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent
  `

  const variants = {
    primary: `
      bg-gradient-accent text-white rounded-xl shadow-md
      hover:shadow-glow hover:-translate-y-0.5
      focus:ring-[rgb(var(--color-accent))]
      ${glow ? 'hero-glow' : ''}
    `,
    secondary: `
      glass text-theme-primary rounded-xl
      hover:border-hover hover:-translate-y-0.5
      focus:ring-[rgb(var(--color-accent))]
    `,
    outline: `
      bg-transparent border border-default text-theme-primary rounded-xl
      hover:bg-accent-5 hover:border-hover hover:-translate-y-0.5
      focus:ring-[rgb(var(--color-accent))]
    `,
    ghost: `
      bg-transparent text-theme-secondary rounded-lg
      hover:text-accent hover:bg-accent-5
      focus:ring-[rgb(var(--color-accent))]
    `,
    danger: `
      bg-red-500 text-white rounded-xl shadow-md
      hover:bg-red-600 hover:shadow-lg hover:-translate-y-0.5
      focus:ring-red-500
    `,
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3',
    lg: 'px-8 py-4 text-lg',
  }

  const iconSize = iconSizes[size]

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin"
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : Icon && iconPosition === 'left' ? (
        <Icon size={iconSize} strokeWidth={2} />
      ) : null}

      {children}

      {!loading && Icon && iconPosition === 'right' && (
        <Icon size={iconSize} strokeWidth={2} />
      )}
    </button>
  )
}
