/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Heart } from 'lucide-react'
import MobileNavSection from './MobileNavSection'

describe('MobileNavSection', () => {
    it('calls onToggle with section id when section header is clicked', () => {
        const onToggle = vi.fn()

        render(
            <MobileNavSection
                sectionId="personal"
                label="Personal Protection"
                isOpen={false}
                onToggle={onToggle}
                onNavigate={vi.fn()}
                items={[
                    {
                        href: '/insurance/life',
                        label: 'Life Insurance',
                        description: 'Financial protection for your family',
                        icon: Heart,
                        tone: 'brand',
                        surface: 'gradient',
                    },
                ]}
            />,
        )

        fireEvent.click(
            screen.getByRole('button', { name: /personal protection/i }),
        )

        expect(onToggle).toHaveBeenCalledTimes(1)
        expect(onToggle).toHaveBeenCalledWith('personal')
    })
})
