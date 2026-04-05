import { type Variants, type Transition } from 'framer-motion'

/**
 * Standard spring transition for premium UI elements
 */
export const springTransition: Transition = {
    type: 'spring',
    stiffness: 300,
    damping: 20
}

/**
 * Smooth transition for subtle fades/moves
 */
export const smoothTransition: Transition = {
    duration: 0.4,
    ease: [0.25, 0.1, 0.25, 1]
}

/**
 * Card elevation and lift variants
 */
export const cardVariants: Variants = {
    initial: {
        y: 0,
        boxShadow: 'var(--shadow-md)'
    },
    hover: {
        y: -8,
        boxShadow: 'var(--shadow-premium-lift)'
    }
}

/**
 * Glass card variants with specific shadows
 */
export const glassCardVariants: Variants = {
    initial: {
        y: 0,
        boxShadow: 'var(--shadow-sm)'
    },
    hover: {
        y: -6,
        boxShadow: 'var(--shadow-xl)'
    }
}

/**
 * Stagger container variants
 */
export const staggerContainer: Variants = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
}

/**
 * Individual item reveal variants
 */
export const revealItem: Variants = {
    initial: {
        opacity: 0,
        y: 20
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: smoothTransition
    }
}
