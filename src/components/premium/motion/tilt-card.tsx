'use client'

import React, { useRef, useState } from 'react'
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface TiltCardProps {
    children: React.ReactNode
    className?: string
    containerClassName?: string
    tiltMaxAngleX?: number
    tiltMaxAngleY?: number
    perspective?: number
    scaleOnHover?: number
    glareOpacity?: number
    glareColor?: string
    darkGlareColor?: string
}

export function TiltCard({
    children,
    className,
    containerClassName,
    tiltMaxAngleX = 10,
    tiltMaxAngleY = 10,
    perspective = 1000,
    scaleOnHover = 1.02,
    glareOpacity = 0.4,
    glareColor = "255, 255, 255",
    darkGlareColor = "255, 255, 255",
}: TiltCardProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [isHovered, setIsHovered] = useState(false)
    const prefersReducedMotion = useReducedMotion()

    // Motion values for mouse position
    const x = useMotionValue(0)
    const y = useMotionValue(0)

    // Smooth springs for rotation
    const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [tiltMaxAngleX, -tiltMaxAngleX]), {
        stiffness: 150,
        damping: 20
    })
    const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-tiltMaxAngleY, tiltMaxAngleY]), {
        stiffness: 150,
        damping: 20
    })

    // Glare position
    const glareX = useTransform(rotateY, [-tiltMaxAngleY, tiltMaxAngleY], ['0%', '100%'])
    const glareY = useTransform(rotateX, [tiltMaxAngleX, -tiltMaxAngleX], ['0%', '100%'])

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current || prefersReducedMotion) return

        const rect = ref.current.getBoundingClientRect()
        const width = rect.width
        const height = rect.height

        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top

        const xPct = (mouseX / width) - 0.5
        const yPct = (mouseY / height) - 0.5

        x.set(xPct)
        y.set(yPct)
    }

    const handleMouseLeave = () => {
        setIsHovered(false)
        x.set(0)
        y.set(0)
    }

    // Skip 3D tilt effects if user prefers reduced motion
    if (prefersReducedMotion) {
        return (
            <div className={cn("relative", containerClassName)}>
                <div className={cn("relative grid place-items-center", className)}>
                    {children}
                </div>
            </div>
        )
    }

    return (
        <motion.div
            ref={ref}
            className={cn("relative preserve-3d", containerClassName)}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            style={{
                perspective: `${perspective}px`,
                transformStyle: "preserve-3d",
            }}
        >
            <motion.div
                className={cn("relative grid place-items-center", className)}
                style={{
                    rotateX,
                    rotateY,
                    scale: isHovered ? scaleOnHover : 1,
                    transformStyle: "preserve-3d",
                }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
                {/* Content */}
                {children}

                {/* Glare Effect */}
                <motion.div
                    className="absolute inset-0 pointer-events-none rounded-[inherit] overflow-hidden mix-blend-overlay z-10"
                    style={{
                        opacity: isHovered ? glareOpacity : 0,
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-radial from-white via-transparent to-transparent opacity-0 dark:opacity-100"
                        style={{
                            background: `radial-gradient(circle at ${50}% ${50}%, rgba(${glareColor}, 0.8), transparent 70%)`,
                            // We can't easily animate gradient position with basic CSS vars in Framer Motion efficiently without custom values, 
                            // so we rely on the container rotation to catch the light or use a pseudo element moving.
                            // For simplicity and performance, a static radial gradient that fades in is often enough or we can try to move it.
                        }}
                    />
                    {/* Advanced Moving Glare */}
                    <motion.div
                        className="absolute inset-[-100%] z-10 w-[300%] h-[300%]"
                        style={{
                            background: `radial-gradient(circle, rgba(${glareColor}, ${glareOpacity}) 0%, transparent 60%)`,
                            x: useTransform(x, [-0.5, 0.5], ['-20%', '20%']), // Move glare opposite to rotation or with it
                            y: useTransform(y, [-0.5, 0.5], ['-20%', '20%']),
                            left: -50 + '%',
                            top: -50 + '%'
                        }}
                    />
                </motion.div>
            </motion.div>
        </motion.div>
    )
}
