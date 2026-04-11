'use client'

import { useTheme } from '@/components/ThemeProvider'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
    const { theme, toggleTheme, mounted } = useTheme()

    // Show placeholder while not mounted to prevent hydration mismatch
    if (!mounted) {
        return (
            <div className="w-10 h-10 rounded-xl glass animate-pulse shrink-0" />
        )
    }

    return (
        <button
            onClick={toggleTheme}
            className="interactive-focus relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl glass
                 border border-default/70 hover:border-accent/35 hover:shadow-glow transition-all duration-300
                 group overflow-hidden shrink-0"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {/* Sun icon - shown in light mode (green theme) */}
            <Sun
                className={`absolute w-5 h-5 text-amber-500 transition-all duration-500
                    ${theme === 'light'
                        ? 'rotate-0 scale-100 opacity-100'
                        : 'rotate-90 scale-0 opacity-0'}`}
            />

            {/* Moon icon - shown in dark mode */}
            <Moon
                className={`absolute w-5 h-5 text-accent transition-all duration-500
                    ${theme === 'dark'
                        ? 'rotate-0 scale-100 opacity-100'
                        : '-rotate-90 scale-0 opacity-0'}`}
            />

            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100
                      transition-opacity duration-300 rounded-xl" />
        </button>
    )
}
