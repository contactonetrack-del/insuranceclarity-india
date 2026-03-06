'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, User } from 'lucide-react'
import { io, Socket } from 'socket.io-client'

export default function LiveChat() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<{ text: string, sender: 'user' | 'agent' }[]>([
        { text: 'Hello! I am your InsuranceClarity guide. How can I help you today?', sender: 'agent' }
    ])
    const [inputValue, setInputValue] = useState('')
    const [socket, setSocket] = useState<Socket | null>(null)

    // Setup socket connection
    useEffect(() => {
        // We connect to a generic path. In production, this would point to a valid WebSocket server.
        const socketInstance = io({
            path: '/api/socket',
            autoConnect: false // We use autoConnect: false as a placeholder to prevent errors without a real server
        })
        setSocket(socketInstance)

        return () => {
            socketInstance.disconnect()
        }
    }, [])

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault()
        if (!inputValue.trim()) return

        // Add user message to UI
        const newMessage = { text: inputValue, sender: 'user' as const }
        setMessages(prev => [...prev, newMessage])
        setInputValue('')

        // Simulate agent typing and replying via the socket placeholder
        setTimeout(() => {
            setMessages(prev => [...prev, {
                text: 'Based on your inquiry, an agent will contact you shortly to clarify this policy.',
                sender: 'agent'
            }])
        }, 1500)
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-default overflow-hidden flex flex-col"
                        style={{ height: '450px' }}
                    >
                        {/* Header */}
                        <div className="bg-gradient-accent p-4 flex items-center justify-between text-white">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm">Clarity Advisor</h3>
                                    <p className="text-xs text-white/80">Online</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                                aria-label="Close Chat"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 p-4 overflow-y-auto bg-slate-50 dark:bg-slate-900/50 space-y-4">
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.sender === 'user'
                                                ? 'bg-accent text-white rounded-tr-none'
                                                : 'bg-white dark:bg-slate-800 text-theme-primary border border-default rounded-tl-none shadow-sm'
                                            }`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-slate-900 border-t border-default">
                            <div className="flex items-center gap-2 relative">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Type your question..."
                                    className="w-full bg-slate-100 dark:bg-slate-800 text-sm rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-accent/50 border border-transparent focus:border-accent"
                                    aria-label="Chat input message"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 w-8 h-8 flex items-center justify-center bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors shadow-sm disabled:opacity-50"
                                    disabled={!inputValue.trim()}
                                    aria-label="Send Message"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Toggle Button */}
            <motion.button
                onClick={() => setIsOpen(prev => !prev)}
                className="w-14 h-14 bg-gradient-accent rounded-full flex items-center justify-center shadow-glow text-white hover:scale-105 active:scale-95 transition-transform"
                aria-label="Toggle Live Chat"
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                whileHover={{ y: -2 }}
                whileTap={{ y: 2 }}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
            </motion.button>
        </div>
    )
}
