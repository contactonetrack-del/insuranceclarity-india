'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useAdvisorChat } from '@/features/advisor/hooks/useAdvisorChat'
import { AdvisorHeader } from '@/features/advisor/components/AdvisorHeader'
import { AdvisorMessageBubble } from '@/features/advisor/components/AdvisorMessageBubble'
import { TypingIndicator } from '@/features/advisor/components/TypingIndicator'
import { AdvisorInputArea } from '@/features/advisor/components/AdvisorInputArea'
import { AdvisorButton } from '@/features/advisor/components/AdvisorButton'
import { AdvisorSuggestionChips } from '@/features/advisor/components/AdvisorSuggestionChips'
import { useGlobalStore } from '@/store/useGlobalStore'

export default function ClarityAdvisor() {
    const {
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
    } = useAdvisorChat()
    const isMobileMenuOpen = useGlobalStore((state) => state.mobileMenuOpen);

    // Completely hide advisor when mobile navigation is active to prevent UI overlap
    if (isMobileMenuOpen) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.92 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        className="mb-4 w-[390px] max-w-[95vw] h-[600px] flex flex-col overflow-hidden rounded-3xl border border-default shadow-3xl bg-theme-primary"
                    >
                        <AdvisorHeader clearChat={clearChat} toggleOpen={toggleOpen} />

                        {/* Chat Body */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-5 space-y-5 scroll-smooth bg-slate-50/50 dark:bg-slate-900/50"
                        >
                            {messages.map((msg) => (
                                <AdvisorMessageBubble key={msg.id} msg={msg} setIsOpen={setIsOpen} />
                            ))}

                            {isTyping && <TypingIndicator />}
                        </div>

                        {/* Quick Suggestion Chips — visible when chat is fresh */}
                        {messages.length <= 1 && !isTyping && (
                            <AdvisorSuggestionChips handleSend={handleSend} />
                        )}

                        <AdvisorInputArea
                            inputValue={inputValue}
                            setInputValue={setInputValue}
                            handleSend={handleSend}
                            isTyping={isTyping}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <AdvisorButton
                isOpen={isOpen}
                toggleOpen={toggleOpen}
                hasNewMessage={hasNewMessage}
            />
        </div>
    )
}
