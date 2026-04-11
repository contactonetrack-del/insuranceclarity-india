'use client'

import type { RefObject } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import MobileMenuHeader from '@/components/header/MobileMenuHeader'
import MobileMenuUtilityBar from '@/components/header/MobileMenuUtilityBar'
import MobileNavSection from '@/components/header/MobileNavSection'
import MobileKnowledgeGrid from '@/components/header/MobileKnowledgeGrid'
import MobileMenuFooter from '@/components/header/MobileMenuFooter'
import MobilePrimaryCta from '@/components/header/MobilePrimaryCta'
import {
    insuranceTypes,
    businessTypes,
    tools,
    knowledgeCenter,
} from '@/config/navigation'

interface SessionLike {
    user?: {
        name?: string | null
        email?: string | null
    } | null
}

interface HeaderMobileMenuLabels {
    navigationMenu: string
    mobileNavigation: string
    personalProtection: string
    businessSolutions: string
    smartToolkit: string
}

interface HeaderMobileMenuDialogProps {
    isOpen: boolean
    menuRef: RefObject<HTMLDivElement | null>
    session: SessionLike | null | undefined
    openCategory: string | null
    onToggleCategory: (category: string) => void
    onClose: () => void
    onSignIn: () => void
    labels: HeaderMobileMenuLabels
}

export default function HeaderMobileMenuDialog({
    isOpen,
    menuRef,
    session,
    openCategory,
    onToggleCategory,
    onClose,
    onSignIn,
    labels,
}: HeaderMobileMenuDialogProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    id="mobile-menu"
                    ref={menuRef}
                    role="dialog"
                    aria-modal="true"
                    aria-label={labels.navigationMenu}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="xl:hidden fixed inset-0 top-0 z-[100] bg-card-bg flex flex-col overflow-hidden"
                >
                    <MobileMenuHeader onClose={onClose} />

                    <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
                        <MobileMenuUtilityBar
                            session={session}
                            onCloseMenu={onClose}
                            onSignIn={onSignIn}
                        />

                        <MobilePrimaryCta onNavigate={onClose} />

                        <nav aria-label={labels.mobileNavigation} className="space-y-2">
                            <MobileNavSection
                                sectionId="personal"
                                label={labels.personalProtection}
                                isOpen={openCategory === 'personal'}
                                onToggle={onToggleCategory}
                                items={insuranceTypes}
                                onNavigate={onClose}
                            />
                            <MobileNavSection
                                sectionId="business"
                                label={labels.businessSolutions}
                                isOpen={openCategory === 'business'}
                                onToggle={onToggleCategory}
                                items={businessTypes}
                                onNavigate={onClose}
                            />
                            <MobileNavSection
                                sectionId="tools"
                                label={labels.smartToolkit}
                                isOpen={openCategory === 'tools'}
                                onToggle={onToggleCategory}
                                items={tools}
                                onNavigate={onClose}
                                variant="grid"
                            />
                            <MobileKnowledgeGrid
                                items={knowledgeCenter}
                                onNavigate={onClose}
                            />
                        </nav>

                        <MobileMenuFooter />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

