'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import logger from '@/lib/logger'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error?: Error
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI.
 */
class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error to structured logger
        logger.error('React Error Boundary caught an error', error, {
            componentStack: errorInfo.componentStack,
        })

        // Here you could also send to an error tracking service like Sentry
        // if (typeof window !== 'undefined' && window.Sentry) {
        //     window.Sentry.captureException(error, { extra: errorInfo })
        // }
    }

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <div className="min-h-[400px] flex items-center justify-center p-8">
                    <div className="text-center max-w-md">
                        <div className="text-6xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                            Something went wrong
                        </h2>
                        <p className="text-[var(--text-secondary)] mb-6">
                            We apologize for the inconvenience. Please try refreshing the page.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-[var(--color-accent)] text-white rounded-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2"
                        >
                            Refresh Page
                        </button>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-6 text-left">
                                <summary className="cursor-pointer text-sm text-[var(--text-tertiary)]">
                                    Error Details (Development Only)
                                </summary>
                                <pre className="mt-2 p-4 bg-[var(--bg-tertiary)] rounded-lg text-xs overflow-auto text-red-400">
                                    {this.state.error.message}
                                    {'\n\n'}
                                    {this.state.error.stack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
