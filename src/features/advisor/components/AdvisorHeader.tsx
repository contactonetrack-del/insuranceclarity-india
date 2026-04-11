import { Bot, Sparkles, Trash2, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function AdvisorHeader({
    clearChat,
    toggleOpen
}: {
    clearChat: () => void
    toggleOpen: () => void
}) {
    const t = useTranslations('auditI18n.advisorWidget')

    return (
        <div className="p-5 bg-gradient-accent flex items-center justify-between text-white shadow-lg shrink-0">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                        <Bot className="w-6 h-6" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-accent bg-success-500 animate-pulse" />
                </div>
                <div>
                    <h3 className="font-bold text-base leading-none flex items-center gap-1.5">
                        {t('title')}
                        <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] bg-white/15 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                            {t('badge')}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-1">
                <button onClick={clearChat} title={t('clearChat')} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                    <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={toggleOpen} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                    <X className="w-6 h-6" />
                </button>
            </div>
        </div>
    )
}
