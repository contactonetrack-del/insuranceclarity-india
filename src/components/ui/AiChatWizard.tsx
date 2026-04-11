'use client'

import { useState, useRef, useEffect } from 'react'
import { Bot, User, ArrowUp, Zap, CheckCircle2 } from 'lucide-react'
import { processChatStep, type ChatMessage, type ApplicationState } from '../../app/actions/advisor-actions'
import { cn } from '@/lib/utils'
import { inputClasses } from './FormField'
import { useTranslations } from 'next-intl'

export default function AiChatWizard() {
    const t = useTranslations('auditI18n.aiChatWizard')

    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [inputValue, setInputValue] = useState('')
    const [isTyping, setIsTyping] = useState(false)

    const [step, setStep] = useState(1)
    const [appState, setAppState] = useState<ApplicationState>({})
    const [isComplete, setIsComplete] = useState(false)

    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const initChat = async () => {
            setIsTyping(true)
            const res = await processChatStep({}, '', 1)
            setMessages([res.nextMessage])
            setIsTyping(false)
        }
        initChat()
    }, [])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isTyping])

    const handleSend = async (event?: React.FormEvent) => {
        event?.preventDefault()
        if (!inputValue.trim() || isTyping || isComplete) return

        const currentInput = inputValue
        setInputValue('')

        const userMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'user',
            content: currentInput,
        }

        setMessages((prev) => [...prev, userMsg])
        setIsTyping(true)

        try {
            const expectedNextStep = step + 1
            const res = await processChatStep(appState, currentInput, expectedNextStep)

            setAppState(res.newState)
            if ('nextStepNumber' in res && typeof res.nextStepNumber === 'number') {
                setStep(res.nextStepNumber)
            } else {
                setStep(expectedNextStep)
            }

            setMessages((prev) => [...prev, res.nextMessage])
            if (res.isComplete) {
                setIsComplete(true)
            }
        } catch (error) {
            if (process.env.NODE_ENV !== 'production') {
                console.error('chat.process_failed', error)
            }
            setMessages((prev) => [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    role: 'bot',
                    content: t('networkError'),
                },
            ])
        } finally {
            setIsTyping(false)
        }
    }

    return (
        <div className="relative mx-auto flex h-[600px] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-default bg-white/50 shadow-glow backdrop-blur-xl dark:bg-slate-900/50">
            <div className="flex items-center justify-between border-b border-default bg-slate-50/80 px-6 py-4 backdrop-blur-md dark:bg-slate-800/80">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-accent shadow-md animate-pulse-slow">
                        <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="flex items-center gap-2 font-bold text-theme-primary">
                            {t('title')} <Zap className="h-4 w-4 fill-amber-500 text-amber-500" />
                        </h3>
                        <p className="text-xs text-theme-muted">{t('subtitle')}</p>
                    </div>
                </div>
                {isComplete ? <CheckCircle2 className="h-6 w-6 animate-fade-in-up text-success-500" /> : null}
            </div>

            <div ref={scrollRef} className="flex-1 space-y-6 overflow-y-auto p-6 scroll-smooth">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex animate-fade-in-up ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex max-w-[85%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className="mt-1 shrink-0">
                                {msg.role === 'user' ? (
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-accent/25 bg-accent/10 dark:bg-accent/20">
                                        <User className="h-4 w-4 text-accent" />
                                    </div>
                                ) : (
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-default bg-slate-100 shadow-sm dark:bg-slate-800">
                                        <Bot className="h-4 w-4 text-theme-secondary" />
                                    </div>
                                )}
                            </div>

                            <div
                                className={`rounded-2xl px-5 py-3.5 ${
                                    msg.role === 'user'
                                        ? 'rounded-tr-sm bg-gradient-accent text-white shadow-md shadow-[0_10px_24px_rgba(var(--token-accent-rgb),0.28)]'
                                        : 'rounded-tl-sm border border-default bg-white text-theme-secondary shadow-sm dark:bg-slate-800'
                                } ${
                                    msg.type === 'summary'
                                        ? 'border-transparent ring-2 ring-accent bg-gradient-to-br from-accent/10 to-accent/5 dark:from-accent/20 dark:to-accent/10'
                                        : ''
                                }`}
                            >
                                <p className="text-[15px] leading-relaxed">
                                    {msg.content.split(/(\*\*.*?\*\*)/g).map((part, index) => {
                                        if (part.startsWith('**') && part.endsWith('**')) {
                                            return (
                                                <strong key={index} className="font-bold">
                                                    {part.slice(2, -2)}
                                                </strong>
                                            )
                                        }
                                        return <span key={index}>{part}</span>
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}

                {isTyping ? (
                    <div className="flex justify-start animate-fade-in-up">
                        <div className="flex max-w-[85%] flex-row gap-3">
                            <div className="mt-1 shrink-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-default bg-slate-100 shadow-sm dark:bg-slate-800">
                                    <Bot className="h-4 w-4 text-slate-500" />
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-default bg-white px-5 py-4 shadow-sm dark:bg-slate-800">
                                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-300 dark:bg-slate-600" style={{ animationDelay: '0ms' }} />
                                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-300 dark:bg-slate-600" style={{ animationDelay: '150ms' }} />
                                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-300 dark:bg-slate-600" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>

            <div className="border-t border-default bg-white/50 p-4 backdrop-blur-md dark:bg-slate-900/50">
                <form onSubmit={handleSend} className="relative flex items-center gap-2">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(event) => setInputValue(event.target.value)}
                            disabled={isTyping || isComplete}
                            placeholder={isComplete ? t('completedPlaceholder') : t('typingPlaceholder')}
                            aria-label={t('messageAria')}
                            className={cn(inputClasses, 'py-3.5 pr-12')}
                        />
                        <button
                            type="submit"
                            disabled={!inputValue.trim() || isTyping || isComplete}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-xl bg-accent p-2 text-white shadow-sm transition-colors hover:bg-accent-hover disabled:bg-slate-300 dark:disabled:bg-slate-700"
                        >
                            <ArrowUp className="h-5 w-5" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
