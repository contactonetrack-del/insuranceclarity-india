import { MessageSquare, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function AdvisorButton({
    isOpen,
    toggleOpen,
    hasNewMessage
}: {
    isOpen: boolean
    toggleOpen: () => void
    hasNewMessage: boolean
}) {
    return (
        <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={toggleOpen}
            className="relative w-16 h-16 rounded-3xl bg-gradient-accent shadow-2xl flex items-center justify-center text-white
                     focus:outline-none focus:ring-4 focus:ring-accent focus:ring-offset-2 dark:focus:ring-offset-slate-950 transition-all"
            aria-label="Open Clarity Advisor"
        >
            <AnimatePresence mode="wait">
                {isOpen
                    ? <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                        <X className="w-7 h-7" />
                    </motion.div>
                    : <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                        <MessageSquare className="w-7 h-7" />
                    </motion.div>
                }
            </AnimatePresence>

            {!isOpen && <span className="absolute inset-0 rounded-3xl bg-accent animate-ping opacity-20 pointer-events-none" />}

            {hasNewMessage && !isOpen && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 border-2 border-white dark:border-slate-950 rounded-full flex items-center justify-center text-[10px] font-bold text-white">1</span>
            )}

            {!isOpen && (
                <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className="absolute right-20 bg-theme-primary border border-default px-4 py-2 rounded-xl shadow-xl text-xs font-bold whitespace-nowrap text-accent hidden md:block pointer-events-none"
                >
                    Ask Clarity Advisor
                </motion.div>
            )}
        </motion.button>
    )
}
