'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    MessageSquare,
    X,
    ArrowRight,
    Shield,
    Calculator,
    Heart,
    Info,
    Coffee,
    Send,
    Bot,
    User,
    Sparkles,
    Navigation,
    BookOpen
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Message {
    id: string
    type: 'bot' | 'user'
    text: string
    actions?: { label: string; href: string; icon: any }[]
}

// Knowledge Base for Simulated AI Responses
const INTENTS = [
    {
        keywords: ['calc', 'premium', 'estimate', 'how much', 'cost', 'quote', 'price', 'payment', 'money', 'calculate'],
        response: "I can help you estimate your insurance costs! Our Smart Premium Advisor is perfect for that. It accounts for age, tobacco use, and more.",
        actions: [{ label: 'Open Calculator', href: '/tools/calculator', icon: Calculator }]
    },
    {
        keywords: ['term', 'life', 'death', 'family', 'protection', 'policy', 'secure', 'income', 'future'],
        response: "Term insurance provides a huge cover at a low cost, ensuring your family's financial security. Would you like to see our comprehensive guide?",
        actions: [
            { label: 'Term Guide', href: '/resources', icon: BookOpen },
            { label: 'Calculate Term Needs', href: '/tools/calculator', icon: Calculator }
        ]
    },
    {
        keywords: ['health', 'medical', 'hospital', 'doctor', 'illness', 'disease', 'surgery', 'mediclaim', 'care'],
        response: "Health insurance is essential to protect your savings from medical emergencies. I have checklists and guides ready for you.",
        actions: [{ label: 'Health Hub', href: '/resources', icon: Heart }]
    },
    {
        keywords: ['car', 'bike', 'motor', 'vehicle', 'accident', 'claim', 'service', 'garage', 'idv', 'repair'],
        response: "Motor insurance is mandatory and provides peace of mind on the road. I can help with claim processes or IDV estimates.",
        actions: [{ label: 'Motor Guide', href: '/resources', icon: Navigation }]
    },
    {
        keywords: ['download', 'pdf', 'guide', 'ebook', 'checklist', 'report', 'document', 'form'],
        response: "All our professional guides, like 'Choosing Term Insurance' and 'Health Checklists', are available as downloadable PDFs.",
        actions: [{ label: 'Browse Downloads', href: '/resources', icon: Info }]
    },
    {
        keywords: ['support', 'donate', 'coffee', 'help you', 'funding', 'pay', 'contribute', 'donation'],
        response: "Insurance Clarity is a free resource. Your support helps us keep it that way! Would you like to visit our support page?",
        actions: [{ label: 'Support Us', href: 'https://buymeacoffee.com/insuranceclarity', icon: Coffee }]
    },
    {
        keywords: ['who', 'what', 'you', 'advisor', 'bot', 'help', 'assist', 'do', 'purpose', 'name'],
        response: "I'm the Clarity Advisor! I'm here to help you navigate our calculators, download expert guides, and answer your insurance questions.",
        actions: []
    },
    {
        keywords: ['hi', 'hello', 'hey', 'greetings', 'morning', 'evening', 'yo'],
        response: "Hello there! I'm your Clarity Advisor. How can I help you make insurance simple today?",
        actions: [
            { label: 'Start Calculator', href: '/tools/calculator', icon: Calculator },
            { label: 'Read Guides', href: '/resources', icon: BookOpen }
        ]
    }
]

export default function ClarityAdvisor() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [hasNewMessage, setHasNewMessage] = useState(false)
    const pathname = usePathname()
    const scrollRef = useRef<HTMLDivElement>(null)

    // Initial Greeting
    useEffect(() => {
        if (messages.length === 0) {
            setTimeout(() => {
                addBotMessage("Hi! I'm your Clarity Advisor. I can help you navigate through the world of insurance. What are you looking for today?", [
                    { label: 'Calculators', href: '/tools/calculator', icon: Calculator },
                    { label: 'Expert Guides', href: '/resources', icon: BookOpen },
                    { label: 'Support Us', href: 'https://buymeacoffee.com/insuranceclarity', icon: Coffee }
                ])
                if (!isOpen) setHasNewMessage(true)
            }, 1000)
        }
    }, [])

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isTyping])

    const addBotMessage = (text: string, actions?: Message['actions']) => {
        const newMessage: Message = {
            id: Date.now().toString(),
            type: 'bot',
            text,
            actions
        }
        setMessages(prev => [...prev, newMessage])
    }

    const handleSend = async () => {
        if (!inputValue.trim()) return

        const userText = inputValue.trim()
        const userMsg: Message = {
            id: Date.now().toString(),
            type: 'user',
            text: userText
        }

        setMessages(prev => [...prev, userMsg])
        setInputValue('')
        setIsTyping(true)

        // Simulate AI Thinking
        setTimeout(() => {
            const lowerText = userText.toLowerCase()

            // Intelligence: Try to find multiple keyword matches or exact matches
            let matchedIntent = INTENTS.find(intent =>
                intent.keywords.some(key => lowerText.includes(key))
            )

            if (matchedIntent) {
                addBotMessage(matchedIntent.response, matchedIntent.actions)
            } else {
                // Fallback for general insurance interest
                if (lowerText.includes('insurance')) {
                    addBotMessage("Insurance can be complex! Which type are you interested in? I have specific guides for Life, Health, and Motor.", [
                        { label: 'Term Insurance', href: '/resources', icon: Shield },
                        { label: 'Health Insurance', href: '/resources', icon: Heart },
                        { label: 'Motor Insurance', href: '/resources', icon: Navigation }
                    ])
                } else {
                    addBotMessage("I'm still learning! While I didn't fully catch that, I can definitely help you with calculators or our expert guides. Give it a try!", [
                        { label: 'Browse Resources', href: '/resources', icon: BookOpen },
                        { label: 'Try Calculators', href: '/tools/calculator', icon: Calculator }
                    ])
                }
            }
            setIsTyping(false)
        }, 1200)
    }

    const toggleOpen = () => {
        setIsOpen(!isOpen)
        setHasNewMessage(false)
    }

    return (
        <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="mb-4 w-[380px] max-w-[95vw] h-[580px] flex flex-col overflow-hidden rounded-3xl border border-default shadow-3xl bg-theme-primary"
                    >
                        {/* Header */}
                        <div className="p-5 bg-gradient-accent flex items-center justify-between text-white shadow-lg">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                                        <Bot className="w-6 h-6" />
                                    </div>
                                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-accent rounded-full animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base leading-none flex items-center gap-1.5">
                                        Clarity Advisor
                                        <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                                    </h3>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">Intelligent Advisor</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={toggleOpen} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Chat Body */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-5 space-y-6 scroll-smooth scrollbar-hide bg-slate-50/50 dark:bg-slate-900/50"
                        >
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'} space-y-2`}>
                                    <div className={`flex gap-3 max-w-[85%] ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm border ${msg.type === 'bot'
                                                ? 'bg-accent text-white border-accent'
                                                : 'bg-theme-secondary text-theme-secondary border-default'
                                            }`}>
                                            {msg.type === 'bot' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                        </div>
                                        <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm font-medium ${msg.type === 'bot'
                                                ? 'rounded-tl-none bg-white dark:bg-slate-800 text-theme-primary border border-default'
                                                : 'rounded-tr-none bg-accent text-white dark:text-white'
                                            }`}>
                                            {msg.text}
                                        </div>
                                    </div>

                                    {msg.actions && (
                                        <div className="grid grid-cols-1 gap-2 w-full max-w-[85%] ml-11">
                                            {msg.actions.map((action) => (
                                                <Link
                                                    key={action.label}
                                                    href={action.href}
                                                    onClick={() => {
                                                        if (!action.href.startsWith('http')) setIsOpen(false)
                                                    }}
                                                    className="flex items-center justify-between p-3 rounded-xl border border-default
                                                             bg-white dark:bg-slate-800 hover:border-accent hover:bg-accent-5 transition-all group text-xs font-semibold
                                                             text-theme-primary hover:text-accent shadow-sm"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <action.icon className="w-4 h-4 text-accent" />
                                                        {action.label}
                                                    </div>
                                                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {isTyping && (
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center animate-pulse">
                                        <Bot className="w-4 h-4" />
                                    </div>
                                    <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl rounded-tl-none border border-default flex gap-1 items-center shadow-sm">
                                        <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-default bg-white dark:bg-slate-900">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask anything about insurance..."
                                    className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-accent transition-all text-theme-primary shadow-inner"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!inputValue.trim() || isTyping}
                                    className="p-2.5 bg-accent text-white rounded-xl hover:bg-accent-hover transition-all shadow-glow disabled:opacity-50"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex justify-center gap-4 mt-3">
                                <span className="text-[10px] text-theme-muted flex items-center gap-1 font-medium">
                                    <Shield className="w-3 h-3 text-accent" /> Expert Advisor
                                </span>
                                <span className="text-[10px] text-theme-muted flex items-center gap-1 font-medium">
                                    <Sparkles className="w-3 h-3 text-accent" /> Multitasker AI
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleOpen}
                className="relative w-16 h-16 rounded-3xl bg-gradient-accent shadow-2xl flex items-center justify-center text-white
                         group focus:outline-none focus:ring-4 focus:ring-accent focus:ring-offset-2 dark:focus:ring-offset-slate-950 transition-all"
            >
                {isOpen ? <X className="w-8 h-8" /> : <MessageSquare className="w-8 h-8" />}

                {/* Pulse Animation */}
                {!isOpen && (
                    <span className="absolute inset-0 rounded-3xl bg-accent animate-ping opacity-20 pointer-events-none" />
                )}

                {/* Notification Dot */}
                {hasNewMessage && !isOpen && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 border-2 border-white dark:border-slate-950 rounded-full flex items-center justify-center text-[10px] font-bold text-white">1</span>
                )}

                {/* Tooltip Label */}
                {!isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        whileHover={{ opacity: 1, x: 0 }}
                        className="absolute right-20 bg-theme-primary border border-default px-4 py-2 rounded-xl shadow-xl text-xs font-bold whitespace-nowrap text-accent hidden md:block"
                    >
                        Chat with Clarity Advisor
                    </motion.div>
                )}
            </motion.button>
        </div>
    )
}
