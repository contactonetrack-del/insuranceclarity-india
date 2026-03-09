import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
        './src/config/**/*.{js,ts,jsx,tsx,mdx}', // include navigation config for dynamic class names
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // =====================================================
                // ACCENT — wired to CSS variables for light/dark theming
                // Light: green (#4CAF50), Dark: blue (#3B82F6)
                // =====================================================
                accent: {
                    DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
                    hover: 'rgb(var(--color-accent-dark) / <alpha-value>)',
                    light: 'rgb(var(--color-accent-light) / <alpha-value>)',
                    5: 'rgb(var(--color-accent) / 0.05)',
                    10: 'rgb(var(--color-accent) / 0.10)',
                    20: 'rgb(var(--color-accent) / 0.20)',
                },
                // Theme-aware background / text tokens
                theme: {
                    primary: 'rgb(var(--color-bg-primary) / <alpha-value>)',
                    secondary: 'rgb(var(--color-bg-secondary) / <alpha-value>)',
                    tertiary: 'rgb(var(--color-bg-tertiary) / <alpha-value>)',
                },
                // Semantic status colors (theme-independent)
                success: {
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    400: '#4ade80',
                    500: '#22c55e',
                    600: '#16a34a',
                },
                warning: {
                    50: '#fffbeb',
                    100: '#fef3c7',
                    400: '#fbbf24',
                    500: '#f59e0b',
                    600: '#d97706',
                },
                danger: {
                    50: '#fef2f2',
                    100: '#fee2e2',
                    400: '#f87171',
                    500: '#ef4444',
                    600: '#dc2626',
                },
                // Dark mode specific colors
                dark: {
                    primary: '#0a0f1a',
                    secondary: '#0f172a',
                    tertiary: '#1e293b',
                },
                // Light mode specific colors
                light: {
                    primary: '#ffffff',
                    secondary: '#fafafa',
                    tertiary: '#f5f5f5',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Outfit', 'Inter', 'sans-serif'],
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
                'fade-in': 'fade-in 0.6s ease-out',
                'fade-in-up': 'fade-in-up 0.6s ease-out',
                'slide-in': 'slide-in 0.4s ease-out',
                'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
            },
            keyframes: {
                'float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                'pulse-soft': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.8' },
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'fade-in-up': {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'slide-in': {
                    '0%': { transform: 'translateX(-10px)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                'glow-pulse': {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(var(--color-accent-rgb), 0.3)' },
                    '50%': { boxShadow: '0 0 40px rgba(var(--color-accent-rgb), 0.5)' },
                },
            },
        },
    },
    safelist: [
        'from-teal-600',
        'to-emerald-700',
        'from-green-600',
        'to-green-800',
        // include other dynamic gradient classes if added later
    ],
    plugins: [],
}
export default config
