import { registerOTel } from '@vercel/otel'

function resolveServiceName(): string {
    const configured = process.env.OTEL_SERVICE_NAME?.trim()
    if (configured) {
        return configured
    }

    return 'insurance-clarity-nextjs'
}

export function register() {
    if (process.env.OTEL_ENABLED === 'false') {
        return
    }

    registerOTel({
        serviceName: resolveServiceName(),
        traceSampler: process.env.NODE_ENV === 'production' ? 'parentbased_traceidratio' : 'always_on',
    })
}
