'use client'

import Image from 'next/image'
import { useState } from 'react'

interface AppImageProps {
    src: string
    alt: string
    variant?: 'hero' | 'card' | 'avatar' | 'thumbnail'
    priority?: boolean
    className?: string
    overlay?: boolean
}

const variantStyles = {
    hero: {
        aspectRatio: '16/9',
        sizes: '100vw',
        className: 'w-full h-64 md:h-96 lg:h-[500px]',
    },
    card: {
        aspectRatio: '4/3',
        sizes: '(max-width: 768px) 100vw, 50vw',
        className: 'w-full h-48 md:h-56',
    },
    avatar: {
        aspectRatio: '1/1',
        sizes: '128px',
        className: 'w-16 h-16 md:w-20 md:h-20',
    },
    thumbnail: {
        aspectRatio: '1/1',
        sizes: '64px',
        className: 'w-12 h-12',
    },
}

export default function AppImage({
    src,
    alt,
    variant = 'card',
    priority = false,
    className = '',
    overlay = true,
}: AppImageProps) {
    const [isLoading, setIsLoading] = useState(true)
    const styles = variantStyles[variant]

    return (
        <div className={`relative overflow-hidden rounded-xl ${styles.className} ${className}`}>
            {/* Loading skeleton */}
            {isLoading && (
                <div className="absolute inset-0 skeleton" />
            )}

            <Image
                src={src}
                alt={alt}
                fill
                sizes={styles.sizes}
                priority={priority}
                className={`object-cover transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'
                    }`}
                onLoad={() => setIsLoading(false)}
            />

            {/* Theme-aware overlay for dark mode */}
            {overlay && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent 
                      dark:from-black/60 dark:to-black/20 pointer-events-none" />
            )}
        </div>
    )
}

// Hero image with text overlay
interface HeroImageProps {
    src: string
    alt: string
    children?: React.ReactNode
    priority?: boolean
}

export function HeroImage({ src, alt, children, priority = true }: HeroImageProps) {
    const [isLoading, setIsLoading] = useState(true)

    return (
        <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden rounded-2xl">
            {isLoading && (
                <div className="absolute inset-0 skeleton" />
            )}

            <Image
                src={src}
                alt={alt}
                fill
                sizes="100vw"
                priority={priority}
                className={`object-cover transition-opacity duration-700 ${isLoading ? 'opacity-0' : 'opacity-100'
                    }`}
                onLoad={() => setIsLoading(false)}
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

            {/* Content */}
            {children && (
                <div className="absolute inset-0 flex items-center">
                    <div className="px-8 md:px-12 max-w-2xl">
                        {children}
                    </div>
                </div>
            )}
        </div>
    )
}
