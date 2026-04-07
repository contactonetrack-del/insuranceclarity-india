import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Bot } from 'lucide-react';

export const runtime = 'nodejs';

// Phase 11: Lazy load advisor client to reduce initial bundle size
// This defers loading the semantic search and match logic until the page is viewed
const AdvisorClient = dynamic(() => import('./advisor-client'), {
    loading: () => (
        <div className="min-h-screen pt-20 flex flex-col items-center justify-center">
            <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="p-4 rounded-full bg-indigo-500/10">
                    <Bot className="w-12 h-12 text-indigo-500 animate-bounce" />
                </div>
                <h2 className="text-2xl font-bold text-theme-primary">Initializing AI Engine...</h2>
                <p className="text-sm text-theme-secondary mt-2">Loading semantic matching models...</p>
            </div>
        </div>
    ),
    ssr: true,
});

export default function AiAdvisorPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen pt-20 flex flex-col items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="p-4 rounded-full bg-indigo-500/10">
                        <Bot className="w-12 h-12 text-indigo-500 animate-bounce" />
                    </div>
                    <h2 className="text-2xl font-bold text-theme-primary">Initializing Edge AI Engine...</h2>
                </div>
            </div>
        }>
            <AdvisorClient />
        </Suspense>
    );
}
