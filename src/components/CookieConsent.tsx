'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Check if user has already consented
        const consented = localStorage.getItem('cookie-consent')
        if (!consented) {
            // Show banner after a small delay
            const timer = setTimeout(() => setIsVisible(true), 1000)
            return () => clearTimeout(timer)
        }
    }, [])

    const handleAccept = () => {
        localStorage.setItem('cookie-consent', 'true')
        setIsVisible(false)
    }

    const handleDecline = () => {
        localStorage.setItem('cookie-consent', 'false')
        setIsVisible(false)
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
                >
                    <div className="mx-auto max-w-7xl rounded-2xl bg-white/10 p-6 shadow-2xl backdrop-blur-xl border border-white/20 dark:bg-black/10 dark:border-white/10">
                        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    We value your privacy 🍪
                                </h3>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                    We use cookies to enhance your experience, analyze site traffic, and serve relevant content.
                                    Read our <a href="/privacy" className="underline hover:text-primary">Privacy Policy</a> to learn more.
                                </p>
                            </div>
                            <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
                                <button
                                    onClick={handleDecline}
                                    className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-white/5"
                                >
                                    Decline
                                </button>
                                <button
                                    onClick={handleAccept}
                                    className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    Accept All
                                </button>
                            </div>
                            <button
                                onClick={handleDecline}
                                className="absolute right-2 top-2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 md:hidden"
                                aria-label="Close"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
