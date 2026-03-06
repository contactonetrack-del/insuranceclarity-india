'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, ArrowRight, Shield, Calculator, Heart, Info, Coffee } from 'lucide-react'
import Link from 'next/link'

interface Message {
    id: string
    type: 'bot' | 'user'
    text: string
    actions?: { label: string; href: string; icon: any }[]
}

export default function ClarityAdvisor() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [hasNewMessage, setHasNewMessage] = useState(false)

    useEffect(() => {
        // Initial Greeting
        setTimeout(() => {
            setMessages([
                {
                    id: '1',
                    type: 'bot',
                    text: "Hi! I'm your Clarity Advisor. I can help you navigate through the world of insurance. What are you looking for today?",
                    actions: [
                        { label: 'Find a Policy', href: '/#categories', icon: Heart },
                        { label: 'Use a Calculator', href: '/tools/calculator', icon: Calculator },
                        { label: 'Expert Guides', href: '/resources', icon: Info },
                        { label: 'Support Us', href: 'https://buymeacoffee.com/insuranceclarity', icon: Coffee }
                    ]
                }
            ])
            if (!isOpen) setHasNewMessage(true)
        }, 1500)
    }, [])

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
                        className="mb-4 w-[350px] max-w-[90vw] overflow-hidden rounded-2xl border border-default shadow-2xl bg-white dark:bg-slate-900"
                    >
                        {/* Header */}
                        <div className="p-4 bg-gradient-accent flex items-center justify-between text-white">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm leading-none">Clarity Advisor</h3>
                                    <span className="text-[10px] opacity-80">Site Navigation Helper</span>
                                </div>
                            </div>
                            <button onClick={toggleOpen} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Chat Body */}
                        <div className="h-96 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                            {messages.map((msg) => (
                                <div key={msg.id} className="space-y-3">
                                    <div className="flex gap-2">
                                        <div className="w-6 h-6 rounded-full bg-accent-5 flex items-center justify-center flex-shrink-0 mt-1">
                                            <Shield className="w-3.5 h-3.5 text-accent" />
                                        </div>
                                        <div className="p-3 rounded-2xl rounded-tl-none bg-slate-100 dark:bg-slate-800 text-sm text-theme-primary">
                                            {msg.text}
                                        </div>
                                    </div>

                                    {msg.actions && (
                                        <div className="grid grid-cols-1 gap-2 ml-8">
                                            {msg.actions.map((action) => (
                                                <Link
                                                    key={action.label}
                                                    href={action.href}
                                                    onClick={() => setIsOpen(false)}
                                                    className="flex items-center justify-between p-3 rounded-xl border border-default
                                                             hover:border-accent hover:bg-accent-5 transition-all group text-sm font-medium
                                                             text-theme-secondary hover:text-accent"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <action.icon className="w-4 h-4" />
                                                        {action.label}
                                                    </div>
                                                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-default bg-slate-50 dark:bg-slate-900/50">
                            <p className="text-[10px] text-theme-muted text-center italic">
                                "Helping you navigate insurance with 100% clarity"
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleOpen}
                className="relative w-14 h-14 rounded-full bg-gradient-accent shadow-xl flex items-center justify-center text-white
                         group focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 dark:focus:ring-offset-slate-950"
            >
                {isOpen ? <X className="w-7 h-7" /> : <MessageSquare className="w-7 h-7" />}

                {/* Pulse Animation */}
                {!isOpen && (
                    <span className="absolute inset-0 rounded-full bg-accent animate-ping opacity-20 pointer-events-none" />
                )}

                {/* Notification Dot */}
                {hasNewMessage && !isOpen && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 border-2 border-white dark:border-slate-950 rounded-full" />
                )}
            </motion.button>
        </div>
    )
}
