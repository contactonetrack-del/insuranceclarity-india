'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface ErrorPageProps {
    error: Error & { digest?: string }
    reset: () => void
}

/**
 * Global Error Boundary — catches unhandled runtime errors in the app directory.
 * This is the Next.js App Router error.tsx convention.
 */
export default function GlobalError({ error, reset }: ErrorPageProps) {
    useEffect(() => {
        // Log to error monitoring (Sentry will automatically capture this)
        console.error('[GlobalError]', error)
    }, [error])

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-6 py-24">
            <div className="max-w-lg w-full text-center">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-danger-100 dark:bg-danger-500/10 
                                    flex items-center justify-center">
                        <AlertTriangle className="w-10 h-10 text-danger-500" />
                    </div>
                </div>

                {/* Heading */}
                <h1 className="font-display font-bold text-3xl text-theme-primary mb-3">
                    Something went wrong
                </h1>
                <p className="text-theme-secondary mb-6 leading-relaxed">
                    An unexpected error occurred. Our team has been notified automatically.
                    Please try again or return to the homepage.
                </p>

                {/* Error digest for support reference */}
                {error.digest && (
                    <p className="text-xs text-theme-muted mb-6 font-mono glass rounded-lg px-4 py-2 inline-block">
                        Reference: {error.digest}
                    </p>
                )}

                {/* Actions */}
                <div className="flex flex-wrap justify-center gap-4">
                    <button
                        onClick={reset}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
                                   bg-accent text-white hover:bg-accent/90 transition-all duration-200
                                   hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </button>
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
                                   glass border border-default text-theme-primary 
                                   hover:border-hover transition-all duration-200
                                   hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Home className="w-4 h-4" />
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    )
}
