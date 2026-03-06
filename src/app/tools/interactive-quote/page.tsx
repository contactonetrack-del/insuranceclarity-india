import AiChatWizard from '@/components/ui/AiChatWizard';

export default function InteractiveQuotePage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32 pb-20 selection:bg-accent/30">
            <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">

                {/* Left: Value Proposition */}
                <div className="space-y-8 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 text-sm font-medium text-indigo-700 dark:text-indigo-400">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        Next-Generation Quoting
                    </div>

                    <h1 className="text-4xl lg:text-5xl font-extrabold text-theme-primary leading-tight tracking-tight">
                        Ditch the Forms. <br />
                        <span className="text-gradient hover-gradient">Talk to an Assistant.</span>
                    </h1>

                    <p className="text-lg text-theme-secondary leading-relaxed max-w-xl">
                        Our AI-powered Underwriting Assistant replaces a 40-page questionnaire with an intelligent conversation. It adapts to your answers in real-time, reducing the time to quote by <strong className="text-theme-primary">85%</strong>.
                    </p>

                    <ul className="space-y-4 text-theme-secondary font-medium">
                        <li className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">✓</div>
                            Dynamic Questioning Matrix
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">✓</div>
                            Powered by Server Actions at the Edge
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">✓</div>
                            Asynchronous PDF Policy Generation
                        </li>
                    </ul>
                </div>

                {/* Right: The Conversational Wizard */}
                <div className="lg:pl-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <div className="relative">
                        {/* Decorative Background Blur */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-[2rem] blur opacity-20 dark:opacity-40 animate-pulse-slow"></div>
                        <AiChatWizard />
                    </div>
                </div>

            </div>
        </div>
    );
}

export const metadata = {
    title: 'Interactive Quote Wizard | InsuranceClarity',
    description: 'Experience the future of insurance quoting with our conversational AI Assistant.',
};
