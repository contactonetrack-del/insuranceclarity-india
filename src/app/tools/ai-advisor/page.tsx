import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Bot } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export const runtime = 'nodejs'

const AdvisorClient = dynamic(() => import('./advisor-client'), {
    ssr: true,
})

function AdvisorLoadingState({
    title,
    subtitle,
}: {
    title: string
    subtitle: string
}) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center pt-20">
            <div className="flex animate-pulse flex-col items-center gap-4">
                <div className="rounded-full bg-accent/10 p-4">
                    <Bot className="h-12 w-12 animate-bounce text-accent" />
                </div>
                <h2 className="text-2xl font-bold text-theme-primary">{title}</h2>
                <p className="mt-2 text-sm text-theme-secondary">{subtitle}</p>
            </div>
        </div>
    )
}

export default async function AiAdvisorPage() {
    const t = await getTranslations('tools.aiAdvisorPage')

    return (
        <Suspense
            fallback={
                <AdvisorLoadingState
                    title={t('loadingTitle')}
                    subtitle={t('loadingSubtitle')}
                />
            }
        >
            <AdvisorClient />
        </Suspense>
    )
}
