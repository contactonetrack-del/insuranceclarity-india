'use client'

import { useRef } from 'react'
import { motion, useAnimationFrame, useMotionValue } from 'framer-motion'

interface InfinityTickerProps {
    items: React.ReactNode[]
    direction?: 'left' | 'right'
    speed?: number
}

export default function InfinityTicker({ items, direction = 'left', speed = 1 }: InfinityTickerProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const x = useMotionValue(0)

    useAnimationFrame((time, delta) => {
        if (!containerRef.current) return

        const containerWidth = containerRef.current.scrollWidth / 4 // We duplicate 4 times
        const moveAmount = (delta / 1000) * speed * 50 // pixels per second

        if (direction === 'left') {
            x.set(x.get() - moveAmount)
            // Reset when we've scrolled one full set
            if (Math.abs(x.get()) >= containerWidth) {
                x.set(0)
            }
        } else {
            x.set(x.get() + moveAmount)
            if (x.get() >= containerWidth) {
                x.set(0)
            }
        }
    })

    return (
        <div className="relative w-full overflow-hidden py-6 bg-slate-50/50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
            {/* Left fade gradient */}
            <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-white dark:from-slate-950 to-transparent" />
            {/* Right fade gradient */}
            <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-white dark:from-slate-950 to-transparent" />

            <motion.div
                ref={containerRef}
                className="flex items-center"
                style={{ x }}
            >
                {/* Duplicate items 4 times for seamless loop */}
                {[...Array(4)].map((_, setIndex) => (
                    <div key={setIndex} className="flex items-center gap-12 px-6 shrink-0">
                        {items.map((item, itemIndex) => (
                            <div
                                key={`${setIndex}-${itemIndex}`}
                                className="flex items-center justify-center shrink-0 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300 hover:scale-110"
                            >
                                {item}
                            </div>
                        ))}
                    </div>
                ))}
            </motion.div>
        </div>
    )
}
