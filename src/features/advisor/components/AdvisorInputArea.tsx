import { Send, Shield, Zap } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function AdvisorInputArea({
    inputValue,
    setInputValue,
    handleSend,
    isTyping
}: {
    inputValue: string
    setInputValue: (val: string) => void
    handleSend: () => void
    isTyping: boolean
}) {
    const t = useTranslations('auditI18n.advisorWidget')

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="p-3 border-t border-default bg-white dark:bg-slate-900 shrink-0">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={t('placeholder')}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 text-sm
                             focus:ring-2 focus:ring-accent transition-all text-theme-primary outline-none shadow-inner"
                />
                <button
                    onClick={() => handleSend()}
                    disabled={!inputValue.trim() || isTyping}
                    className="p-2.5 bg-accent text-white rounded-xl hover:bg-accent-hover transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label={t('sendAria')}
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>
            <div className="flex justify-center gap-4 mt-2">
                <span className="text-[10px] text-theme-muted flex items-center gap-1 font-medium">
                    <Shield className="w-3 h-3 text-accent" /> {t('insuranceExpert')}
                </span>
                <span className="text-[10px] text-theme-muted flex items-center gap-1 font-medium">
                    <Zap className="w-3 h-3 text-accent" /> {t('instantAnswers')}
                </span>
            </div>
        </div>
    )
}
