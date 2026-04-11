import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { api } from '@/lib/api-client'
import { usePathname } from 'next/navigation'
import { useAuthSession } from '@/lib/auth-client'
import { Message, AdvisorAction } from '../types'
import {
    Calculator, BookOpen, AlertCircle, Scale, Heart, Shield,
    Navigation, Home, Plane, FileText, Coffee, Info
} from 'lucide-react'

import { ElementType } from 'react'

const ICON_MAP: Record<string, ElementType> = {
    Calculator, BookOpen, AlertCircle, Scale, Heart, Shield, Navigation, Home, Plane, FileText, Coffee, Info
}

export function useAdvisorChat() {
    const t = useTranslations('auditI18n.advisorChat')
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [hasNewMessage, setHasNewMessage] = useState(false)
    const pathname = usePathname()
    const scrollRef = useRef<HTMLDivElement>(null)
    const { data: session } = useAuthSession()
    const [currentChatId, setCurrentChatId] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    const getContextGreeting = (): { text: string; actions: AdvisorAction[] } => {
        if (pathname?.includes('/tools/calculator')) {
            return {
                text: "👋 It looks like you're using the **Premium Calculator**! Need help understanding any fields — like IDV, NCB, or sum insured? Just ask!",
                actions: [{ label: t('actions.calculatorGuide'), href: '/resources', icon: Calculator }]
            }
        }
        if (pathname?.includes('/tools/hidden-facts')) {
            return {
                text: "👋 Welcome to the **Hidden Facts Revealer**! Ask me about any insurance exclusion, or I can explain what any fact means.",
                actions: [{ label: t('actions.claimCases'), href: '/tools/claim-cases', icon: FileText }]
            }
        }
        if (pathname?.includes('/tools/compare')) {
            return {
                text: "👋 I see you're comparing policies! I can help explain what to look for — CSR ratios, room rent limits, network hospitals, and more.",
                actions: [{ label: t('actions.expertGuides'), href: '/resources', icon: BookOpen }]
            }
        }
        if (pathname?.includes('/insurance/')) {
            const type = pathname.split('/insurance/')[1]?.replace(/-/g, ' ')
            return {
                text: `👋 You're reading about **${type} insurance**. Ask me anything about it — coverage, exclusions, premiums, or how to claim!`,
                actions: [
                    { label: t('actions.hiddenFacts'), href: '/tools/hidden-facts', icon: AlertCircle },
                    { label: t('actions.calculator'), href: '/tools/calculator', icon: Calculator }
                ]
            }
        }
        return {
            text: "👋 Hi! I'm your **Clarity Advisor** — India's smartest insurance guide.\n\nAsk me about any insurance type, policy exclusions, premiums, claims, or comparisons. I'll give you clear, honest answers!",
            actions: [
                { label: t('actions.calculatePremium'), href: '/tools/calculator', icon: Calculator },
                { label: t('actions.expertGuides'), href: '/resources', icon: BookOpen },
                { label: t('actions.hiddenFacts'), href: '/tools/hidden-facts', icon: AlertCircle },
            ]
        }
    }

    const addBotMessage = (text: string, actions?: AdvisorAction[]) => {
        setMessages(prev => [...prev, {
            id: Date.now().toString() + Math.random(),
            type: 'bot',
            text,
            actions
        }])
    }

    useEffect(() => {
        const loadRecentHistory = async () => {
            if (session?.user && messages.length === 0) {
                try {
                    const histories = await api.advisor.getHistory();
                    if (histories && histories.length > 0) {
                        const latest = await api.advisor.getHistoryDetail(histories[0].id);
                        if (latest && latest.messages) {
                            setMessages(latest.messages);
                            setCurrentChatId(latest.id);
                            return; // Skip greeting if we loaded history
                        }
                    }
                } catch (err) {
                    console.error('Failed to load chat history:', err);
                }

                // If loading fails or no history, show greeting
                const greeting = getContextGreeting()
                addBotMessage(greeting.text, greeting.actions)
                if (!isOpen) setHasNewMessage(true)
            } else if (messages.length === 0) {
                // Not logged in, show default greeting
                const greeting = getContextGreeting()
                addBotMessage(greeting.text, greeting.actions)
                if (!isOpen) setHasNewMessage(true)
            }
        };

        // Delay slightly for smooth transition
        const timer = setTimeout(loadRecentHistory, 800);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isTyping])

    const handleSend = async (overrideText?: string) => {
        const textToSend = overrideText || inputValue.trim()
        if (!textToSend || isTyping) return

        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            type: 'user',
            text: textToSend
        }])
        if (!overrideText) setInputValue('')
        setIsTyping(true)

        try {
            const data = await api.advisor.sendMessage(textToSend)

            const mappedActions = data.actions?.map((action: Record<string, unknown>) => ({
                ...action,
                icon: ICON_MAP[action.icon as string] || Info
            })) as AdvisorAction[] | undefined

            addBotMessage(data.response, mappedActions && mappedActions.length > 0 ? mappedActions : undefined)
        } catch (error) {
            console.error(error)
            addBotMessage("Sorry, I'm having trouble connecting to the advisor. Please try again.")
        } finally {
            setIsTyping(false)
        }
    }

    // Effect to persist chat after messages change (for bot responses)
    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        if (session?.user && messages.length > 1 && lastMessage?.type === 'bot' && !isSaving) {
            const persistChat = async () => {
                setIsSaving(true);
                try {
                    const firstUserMsg = messages.find(m => m.type === 'user')?.text || 'New Conversation';
                    const title = firstUserMsg.slice(0, 40) + (firstUserMsg.length > 40 ? '...' : '');

                    const res = await api.advisor.saveHistory({
                        id: currentChatId || undefined,
                        title,
                        messages
                    });

                    if (res.id && !currentChatId) {
                        setCurrentChatId(res.id);
                    }
                } catch (err) {
                    console.error('Failed to persist chat:', err);
                } finally {
                    setIsSaving(false);
                }
            };
            persistChat();
        }
    }, [messages, session, currentChatId, isSaving]);

    const toggleOpen = () => {
        setIsOpen(!isOpen)
        setHasNewMessage(false)
    }

    const clearChat = () => {
        setMessages([])
        setTimeout(() => {
            const greeting = getContextGreeting()
            addBotMessage(greeting.text, greeting.actions)
        }, 300)
    }

    return {
        isOpen,
        messages,
        inputValue,
        isTyping,
        hasNewMessage,
        scrollRef,
        setInputValue,
        setIsOpen,
        handleSend,
        toggleOpen,
        clearChat
    }
}
