'use client'

import NavDropdown from '@/components/header/NavDropdown'
import { useTranslations } from 'next-intl'
import {
    insuranceTypes,
    businessTypes,
    tools,
    knowledgeCenter,
} from '@/config/navigation'

interface DesktopMainNavProps {
    activeDropdown: string | null
    setActiveDropdown: (id: string | null) => void
}

export default function DesktopMainNav({
    activeDropdown,
    setActiveDropdown,
}: DesktopMainNavProps) {
    const t = useTranslations('auditI18n.header')

    return (
        <nav
            className="hidden xl:flex items-center h-full gap-x-4 2xl:gap-x-8"
            aria-label={t('mainNavAria')}
        >
            <NavDropdown
                label={t('personalInsurance')}
                id="personal-insurance"
                items={insuranceTypes}
                activeDropdown={activeDropdown}
                setActiveDropdown={setActiveDropdown}
            />
            <NavDropdown
                label={t('businessAndCyber')}
                id="business-insurance"
                items={businessTypes}
                activeDropdown={activeDropdown}
                setActiveDropdown={setActiveDropdown}
            />
            <NavDropdown
                label="Tools"
                id="tools"
                items={tools}
                activeDropdown={activeDropdown}
                setActiveDropdown={setActiveDropdown}
            />
            <NavDropdown
                label={t('knowledgeCenter')}
                id="knowledge-center"
                items={knowledgeCenter}
                activeDropdown={activeDropdown}
                setActiveDropdown={setActiveDropdown}
            />
        </nav>
    )
}
