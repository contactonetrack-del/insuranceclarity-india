'use client'

import { motion, Variants } from 'framer-motion'

const skeletonVariants: Variants = {
    initial: { opacity: 0.5 },
    animate: {
        opacity: [0.5, 1, 0.5],
        transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut'
        }
    }
}

interface SkeletonProps {
    className?: string
    width?: string | number
    height?: string | number
    rounded?: 'sm' | 'md' | 'lg' | 'full'
}

const roundedClasses: Record<string, string> = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
}

export function Skeleton({
    className = '',
    width = '100%',
    height = '1rem',
    rounded = 'md'
}: SkeletonProps) {
    return (
        <motion.div
            variants={skeletonVariants}
            initial="initial"
            animate="animate"
            className={`bg-[var(--border-default)] ${roundedClasses[rounded]} ${className}`}
            style={{ width, height }}
            aria-hidden="true"
        />
    )
}

// Skeleton for text content
export function TextSkeleton({ lines = 3, className = '' }: { lines?: number; className?: string }) {
    return (
        <div className={`space-y-2 ${className}`} aria-hidden="true">
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    height="1rem"
                    width={i === lines - 1 ? '75%' : '100%'}
                />
            ))}
        </div>
    )
}

// Skeleton for cards
export function CardSkeleton({ className = '' }: { className?: string }) {
    return (
        <div className={`card p-6 ${className}`} aria-hidden="true">
            <div className="flex items-start gap-4">
                <Skeleton width={48} height={48} rounded="lg" />
                <div className="flex-1 space-y-2">
                    <Skeleton height="1.25rem" width="60%" />
                    <Skeleton height="0.875rem" width="80%" />
                </div>
            </div>
            <div className="mt-4 space-y-2">
                <Skeleton height="0.875rem" />
                <Skeleton height="0.875rem" width="90%" />
            </div>
        </div>
    )
}

// Skeleton for hero section
export function HeroSkeleton() {
    return (
        <div className="min-h-[80vh] flex items-center" aria-hidden="true">
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <Skeleton height="2rem" width="200px" rounded="full" />
                        <Skeleton height="4rem" />
                        <Skeleton height="4rem" width="80%" />
                        <div className="space-y-2">
                            <Skeleton height="1.25rem" />
                            <Skeleton height="1.25rem" width="90%" />
                        </div>
                        <div className="flex gap-4">
                            <Skeleton height="48px" width="160px" rounded="lg" />
                            <Skeleton height="48px" width="160px" rounded="lg" />
                        </div>
                    </div>
                    <Skeleton height="400px" rounded="lg" className="hidden lg:block" />
                </div>
            </div>
        </div>
    )
}

// Skeleton for stats grid
export function StatsGridSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" aria-hidden="true">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="card p-4 text-center">
                    <Skeleton height="2.5rem" width="60%" className="mx-auto mb-2" />
                    <Skeleton height="0.875rem" width="80%" className="mx-auto" />
                </div>
            ))}
        </div>
    )
}

export default Skeleton
