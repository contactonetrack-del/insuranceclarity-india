import Link from 'next/link'
import { Bot, User, ArrowRight } from 'lucide-react'
import { Message } from '../types'

export function AdvisorMessageBubble({ msg, setIsOpen }: { msg: Message, setIsOpen: (val: boolean) => void }) {
    const formatText = (text: string) => {
        return text.split('\n').map((line, i) => {
            const parts = line.split(/\*\*(.+?)\*\*/g)
            return (
                <span key={i}>
                    {parts.map((part, j) =>
                        j % 2 === 1
                            ? <strong key={j} className="font-semibold text-theme-primary">{part}</strong>
                            : <span key={j}>{part}</span>
                    )}
                    {i < text.split('\n').length - 1 && <br />}
                </span>
            )
        })
    }

    return (
        <div className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'} space-y-2`}>
            <div className={`flex gap-3 max-w-[88%] ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm border ${msg.type === 'bot'
                    ? 'bg-accent text-white border-accent'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-default'
                    }`}>
                    {msg.type === 'bot' ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                </div>
                {/* Bubble */}
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.type === 'bot'
                    ? 'rounded-tl-none bg-white dark:bg-slate-800 text-theme-primary border border-default'
                    : 'rounded-tr-none bg-accent text-white'
                    }`}>
                    {formatText(msg.text)}
                </div>
            </div>

            {/* Action buttons */}
            {msg.actions && msg.actions.length > 0 && (
                <div className="grid grid-cols-1 gap-1.5 w-full max-w-[88%] ml-10">
                    {msg.actions.map((action) => {
                        const Icon = action.icon
                        return (
                            <Link
                                key={action.label}
                                href={action.href}
                                target={action.href.startsWith('http') ? '_blank' : undefined}
                                rel={action.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                onClick={() => { if (!action.href.startsWith('http')) setIsOpen(false) }}
                                className="flex items-center justify-between p-2.5 rounded-xl border border-default
                                         bg-white dark:bg-slate-800 hover:border-accent hover:bg-accent/5
                                         transition-all group text-xs font-semibold text-theme-primary hover:text-accent shadow-sm"
                            >
                                <div className="flex items-center gap-2.5">
                                    {Icon && <Icon className="w-3.5 h-3.5 text-accent" />}
                                    {action.label}
                                </div>
                                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
