'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform, useMotionValue, useAnimationFrame } from 'framer-motion'
import { wrap } from '@motionone/utils'

interface InfinityTickerProps {
    items: string[]
    direction?: 'left' | 'right'
    speed?: number
}

export default function InfinityTicker({ items, direction = 'left', speed = 0.5 }: InfinityTickerProps) {
    const baseX = useMotionValue(0)
    const { scrollY } = useScroll()
    const scrollVelocity = useTransform(scrollY, [0, 1000], [0, 5], { clamp: false })
    const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`)

    const directionFactor = useRef<number>(1)

    useAnimationFrame((t, delta) => {
        let moveBy = directionFactor.current * speed * (delta / 1000) * 100 // Speed adjustment

        if (direction === 'left') {
            moveBy = -Math.abs(moveBy)
        } else {
            moveBy = Math.abs(moveBy)
        }

        baseX.set(baseX.get() + moveBy)
    })

    return (
        <div className="relative flex w-full overflow-hidden bg-primary/5 py-4 backdrop-blur-sm border-y border-primary/10">
            <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-background to-transparent" />

            <motion.div className="flex whitespace-nowrap" style={{ x }}>
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex gap-8 px-4 sm:gap-16 sm:px-8">
                        {items.map((item, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-2 text-lg font-medium text-muted-foreground/80 font-display"
                            >
                                <span className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                                {item}
                            </span>
                        ))}
                    </div>
                ))}
            </motion.div>
        </div>
    )
}
