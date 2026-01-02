'use client'

import { useTheme } from '@/components/ThemeProvider'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
    const { theme, toggleTheme, mounted } = useTheme()

    // Show placeholder while not mounted to prevent hydration mismatch
    if (!mounted) {
        return (
            <div className="w-12 h-12 rounded-xl glass animate-pulse" />
        )
    }

    return (
        <button
            onClick={toggleTheme}
            className="relative w-12 h-12 rounded-xl glass flex items-center justify-center
                 hover:border-accent-50 hover:shadow-glow transition-all duration-300
                 group overflow-hidden"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {/* Sun icon - shown in light mode (green theme) */}
            <Sun
                className={`absolute w-5 h-5 text-amber-500 transition-all duration-500
                    ${theme === 'light'
                        ? 'rotate-0 scale-100 opacity-100'
                        : 'rotate-90 scale-0 opacity-0'}`}
            />

            {/* Moon icon - shown in dark mode (blue theme) */}
            <Moon
                className={`absolute w-5 h-5 text-blue-400 transition-all duration-500
                    ${theme === 'dark'
                        ? 'rotate-0 scale-100 opacity-100'
                        : '-rotate-90 scale-0 opacity-0'}`}
            />

            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-accent-10 opacity-0 group-hover:opacity-100 
                      transition-opacity duration-300 rounded-xl" />
        </button>
    )
}
