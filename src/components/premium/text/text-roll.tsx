'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TextRollProps {
    words: string[]
    duration?: number
    className?: string
    textClassName?: string
}

export function TextRoll({
    words,
    duration = 3000,
    className,
    textClassName
}: TextRollProps) {
    const [index, setIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % words.length)
        }, duration)
        return () => clearInterval(interval)
    }, [duration, words.length])

    return (
        <div className={cn("relative inline-block h-[1.2em] overflow-hidden align-bottom", className)}>
            <AnimatePresence mode="popLayout">
                <motion.span
                    key={index}
                    initial={{ y: '100%', opacity: 0, filter: 'blur(4px)' }}
                    animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
                    exit={{ y: '-100%', opacity: 0, filter: 'blur(4px)' }}
                    transition={{
                        y: { type: "spring", stiffness: 100, damping: 20 },
                        opacity: { duration: 0.2 }
                    }}
                    className={cn("block whitespace-nowrap", textClassName)}
                >
                    {words[index]}
                </motion.span>
            </AnimatePresence>
        </div>
    )
}
