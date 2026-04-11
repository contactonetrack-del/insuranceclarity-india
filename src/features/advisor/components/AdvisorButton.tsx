import { MessageSquare, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'

export function AdvisorButton({
    isOpen,
    toggleOpen,
    hasNewMessage
}: {
    isOpen: boolean
    toggleOpen: () => void
    hasNewMessage: boolean
}) {
    const t = useTranslations('auditI18n.advisorWidget')

    return (
        <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={toggleOpen}
            className="tone-brand-gradient relative flex h-16 w-16 items-center justify-center rounded-full border text-white shadow-[0_18px_40px_rgb(var(--token-brand-soft)_/_0.32)]
                     focus:outline-none focus:ring-4 focus:ring-focus-ring/40 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-950 transition-all"
            aria-label={t('openAria')}
        >
            <AnimatePresence mode="wait">
                {isOpen
                    ? <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                        <X className="h-7 w-7 drop-shadow-sm" strokeWidth={2.5} />
                    </motion.div>
                    : <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                        <MessageSquare className="h-7 w-7 drop-shadow-sm" strokeWidth={2.4} />
                    </motion.div>
                }
            </AnimatePresence>

            {!isOpen && <span className="absolute inset-0 rounded-full bg-accent animate-ping opacity-20 pointer-events-none" />}

            {!isOpen && (
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-[7px] rounded-full border border-white/22 bg-white/10"
                />
            )}

            {hasNewMessage && !isOpen && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-rose-500 text-[10px] font-bold text-white shadow-sm dark:border-slate-950">1</span>
            )}

            {!isOpen && (
                <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className="pointer-events-none absolute right-20 hidden whitespace-nowrap rounded-full border border-white/70 bg-white/92 px-4 py-2 text-xs font-bold text-slate-900 shadow-xl backdrop-blur-xl md:block dark:border-white/12 dark:bg-slate-950/90 dark:text-white"
                >
                    {t('askButton')}
                </motion.div>
            )}
        </motion.button>
    )
}
