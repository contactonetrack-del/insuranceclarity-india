'use client'

import { forwardRef } from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'elevated' | 'interactive' | 'featured'
    padding?: 'none' | 'sm' | 'md' | 'lg'
    hover?: boolean
    glow?: boolean
}

const paddingMap = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
}

const Card = forwardRef<HTMLDivElement, CardProps>(({
    variant = 'default',
    padding = 'md',
    hover = false,
    glow = false,
    className = '',
    children,
    ...props
}, ref) => {
    const baseStyles = `
    glass rounded-2xl
    ${paddingMap[padding]}
    transition-all
  `

    const variants = {
        default: '',
        elevated: 'shadow-md',
        interactive: `
      cursor-pointer hover-lift-lg
      hover:border-hover
    `,
        featured: `
      border-hover shadow-glow
    `,
    }

    const hoverStyles = hover ? `
    cursor-pointer hover-lift
    hover:border-hover
  ` : ''

    const glowStyles = glow ? 'hero-glow' : ''

    return (
        <div
            ref={ref}
            className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${hoverStyles}
        ${glowStyles}
        ${className}
      `}
            {...props}
        >
            {children}
        </div>
    )
})

Card.displayName = 'Card'

export default Card

// Specialized Card variants
interface FeatureCardProps {
    icon: React.ReactNode
    title: string
    description: string
    badge?: string
    href?: string
    className?: string
}

export function FeatureCard({
    icon,
    title,
    description,
    badge,
    className = '',
}: FeatureCardProps) {
    return (
        <Card variant="interactive" className={`group ${className}`}>
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display font-semibold text-lg text-theme-primary truncate">
                            {title}
                        </h3>
                        {badge && (
                            <span className="badge text-xs">
                                {badge}
                            </span>
                        )}
                    </div>
                    <p className="text-theme-secondary text-sm line-clamp-2">
                        {description}
                    </p>
                </div>
            </div>
        </Card>
    )
}

// Stat Card
interface StatCardProps {
    value: string
    label: string
    icon?: React.ReactNode
    className?: string
}

export function StatCard({ value, label, icon, className = '' }: StatCardProps) {
    return (
        <Card padding="md" className={`text-center ${className}`}>
            {icon && (
                <div className="flex justify-center mb-2">
                    {icon}
                </div>
            )}
            <div className="font-display font-bold text-3xl text-gradient mb-1">
                {value}
            </div>
            <div className="text-theme-secondary text-sm">
                {label}
            </div>
        </Card>
    )
}

// Skeleton Card for loading states
export function SkeletonCard({ className = '' }: { className?: string }) {
    return (
        <Card padding="md" className={className}>
            <div className="skeleton h-4 w-3/4 mb-3" />
            <div className="skeleton h-3 w-full mb-2" />
            <div className="skeleton h-3 w-2/3" />
        </Card>
    )
}
