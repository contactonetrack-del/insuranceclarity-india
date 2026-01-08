'use client'

import React, { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface MagneticProps {
    children: React.ReactNode
    className?: string
    strength?: number // 0 to 1, higher is stronger pull
    activeRange?: number // Distance in pixels to trigger magnetism
}

export function Magnetic({
    children,
    className,
    strength = 0.5,
    activeRange = 100
}: MagneticProps) {
    const ref = useRef<HTMLDivElement>(null)
    const prefersReducedMotion = useReducedMotion()

    const x = useMotionValue(0)
    const y = useMotionValue(0)

    // Smooth return to center
    const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 })
    const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 })

    const [isHovered, setIsHovered] = useState(false)

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current || prefersReducedMotion) return

        setIsHovered(true)

        const rect = ref.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2

        const distanceX = e.clientX - centerX
        const distanceY = e.clientY - centerY

        // Apply magnetic force
        // The closer the mouse is to the center, the more the element moves towards it (or with it)
        // Usually magnetic buttons move WITH the cursor.

        x.set(distanceX * strength)
        y.set(distanceY * strength)
    }

    const handleMouseLeave = () => {
        setIsHovered(false)
        x.set(0)
        y.set(0)
    }

    // Skip magnetic effect if user prefers reduced motion
    if (prefersReducedMotion) {
        return (
            <div className={cn("relative inline-block", className)}>
                {children}
            </div>
        )
    }

    return (
        <motion.div
            ref={ref}
            className={cn("relative inline-block", className)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                x: springX,
                y: springY,
                zIndex: isHovered ? 50 : 1
            }}
        >
            {children}
        </motion.div>
    )
}
