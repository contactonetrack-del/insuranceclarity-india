'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    copy?: {
        title: string;
        message: string;
        retryLabel: string;
        retryAriaLabel: string;
    };
}

interface State {
    hasError: boolean;
    error?: Error;
}

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors in the component tree below it,
 * logs them, and displays a fallback UI instead of crashing the page.
 *
 * Usage:
 * <ErrorBoundary>
 *   <ComponentThatMightError />
 * </ErrorBoundary>
 */
class ErrorBoundaryInner extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log to Sentry for monitoring
        Sentry.captureException(error, {
            contexts: {
                errorBoundary: {
                    componentStack: errorInfo.componentStack,
                },
            },
        });

        // Call custom error handler if provided
        this.props.onError?.(error, errorInfo);

        // Log to console in development only
        if (process.env.NODE_ENV !== 'production') {
            console.error('[ErrorBoundary]', error, errorInfo);
        }
    }

    render() {
        if (this.state.hasError) {
            const copy = this.props.copy ?? {
                title: '',
                message: '',
                retryLabel: '',
                retryAriaLabel: '',
            };
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback UI
            return (
                <div className="error-boundary" role="alert" aria-live="assertive">
                    <div className="error-boundary__content">
                        <div className="error-boundary__icon">
                            <AlertTriangle className="w-8 h-8 text-danger-500" />
                        </div>
                        <h3 className="error-boundary__title">{copy.title}</h3>
                        <p className="error-boundary__message">
                            {copy.message}
                        </p>
                        <button
                            className="error-boundary__retry"
                            onClick={() => this.setState({ hasError: false, error: undefined })}
                            aria-label={copy.retryAriaLabel}
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            {copy.retryLabel}
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Higher-order component to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    fallback?: ReactNode,
    onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
    const WrappedComponent = (props: P) => (
        <ErrorBoundary fallback={fallback} onError={onError}>
            <Component {...props} />
        </ErrorBoundary>
    );

    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

    return WrappedComponent;
}

export function ErrorBoundary(props: Props) {
    const t = useTranslations('auditI18n.errorBoundary')

    return (
        <ErrorBoundaryInner
            {...props}
            copy={
                props.copy ?? {
                    title: t('title'),
                    message: t('message'),
                    retryLabel: t('retryLabel'),
                    retryAriaLabel: t('retryAriaLabel'),
                }
            }
        />
    )
}
