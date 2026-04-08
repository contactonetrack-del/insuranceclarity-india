export function isRuntimeAnalyticsDisabled(): boolean {
    return process.env.NEXT_PUBLIC_DISABLE_RUNTIME_ANALYTICS === 'true';
}

