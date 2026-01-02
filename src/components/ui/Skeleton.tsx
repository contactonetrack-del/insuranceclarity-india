'use client'

interface SkeletonProps {
    className?: string
    variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
    width?: string | number
    height?: string | number
    lines?: number
}

export default function Skeleton({
    className = '',
    variant = 'rounded',
    width,
    height,
    lines = 1,
}: SkeletonProps) {
    const baseClasses = 'skeleton animate-shimmer'

    const variantClasses = {
        text: 'h-4 rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-none',
        rounded: 'rounded-xl',
    }

    const style = {
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
    }

    if (lines > 1) {
        return (
            <div className={`space-y-2 ${className}`}>
                {Array.from({ length: lines }).map((_, i) => (
                    <div
                        key={i}
                        className={`${baseClasses} ${variantClasses.text}`}
                        style={{
                            ...style,
                            width: i === lines - 1 ? '60%' : style.width
                        }}
                    />
                ))}
            </div>
        )
    }

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={style}
        />
    )
}

// Preset skeleton components
export function SkeletonCard({ className = '' }: { className?: string }) {
    return (
        <div className={`glass rounded-2xl p-6 ${className}`}>
            <Skeleton variant="rounded" height={200} className="mb-4" />
            <Skeleton variant="text" width="60%" className="mb-2" />
            <Skeleton variant="text" lines={2} />
        </div>
    )
}

export function SkeletonListItem({ className = '' }: { className?: string }) {
    return (
        <div className={`flex items-center gap-4 p-4 glass rounded-xl ${className}`}>
            <Skeleton variant="circular" width={48} height={48} />
            <div className="flex-1">
                <Skeleton variant="text" width="40%" className="mb-2" />
                <Skeleton variant="text" width="70%" />
            </div>
        </div>
    )
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
    return (
        <div className="glass rounded-xl overflow-hidden">
            {/* Header */}
            <div className="flex gap-4 p-4 bg-accent-5 border-b border-default">
                {Array.from({ length: cols }).map((_, i) => (
                    <Skeleton key={i} variant="text" className="flex-1" />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="flex gap-4 p-4 border-b border-default last:border-0">
                    {Array.from({ length: cols }).map((_, colIndex) => (
                        <Skeleton key={colIndex} variant="text" className="flex-1" />
                    ))}
                </div>
            ))}
        </div>
    )
}

export function SkeletonStats({ count = 4 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="glass rounded-xl p-4 text-center">
                    <Skeleton variant="circular" width={48} height={48} className="mx-auto mb-3" />
                    <Skeleton variant="text" width="60%" className="mx-auto mb-2" />
                    <Skeleton variant="text" width="40%" className="mx-auto" />
                </div>
            ))}
        </div>
    )
}
