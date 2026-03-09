import { Bot } from 'lucide-react'

export function TypingIndicator() {
    return (
        <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center animate-pulse shrink-0">
                <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl rounded-tl-none border border-default flex gap-1.5 items-center shadow-sm">
                <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" />
            </div>
        </div>
    )
}
