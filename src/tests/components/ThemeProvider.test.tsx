import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ThemeProvider, useTheme } from '@/components/ThemeProvider'

// Test component to access theme context
function ThemeConsumer() {
    const { theme, toggleTheme, setTheme, mounted } = useTheme()
    return (
        <div>
            <span data-testid="theme">{theme}</span>
            <span data-testid="mounted">{mounted.toString()}</span>
            <button onClick={toggleTheme} data-testid="toggle">Toggle</button>
            <button onClick={() => setTheme('dark')} data-testid="set-dark">Set Dark</button>
            <button onClick={() => setTheme('light')} data-testid="set-light">Set Light</button>
        </div>
    )
}

describe('ThemeProvider', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear()
        // Remove dark class from document
        document.documentElement.classList.remove('dark')
    })

    it('renders children', () => {
        render(
            <ThemeProvider>
                <div data-testid="child">Child content</div>
            </ThemeProvider>
        )

        expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('provides default theme as light', async () => {
        render(
            <ThemeProvider>
                <ThemeConsumer />
            </ThemeProvider>
        )

        await waitFor(() => {
            expect(screen.getByTestId('mounted').textContent).toBe('true')
        })
        expect(screen.getByTestId('theme').textContent).toBe('light')
    })

    it('toggles theme from light to dark', async () => {
        render(
            <ThemeProvider>
                <ThemeConsumer />
            </ThemeProvider>
        )

        await waitFor(() => {
            expect(screen.getByTestId('mounted').textContent).toBe('true')
        })

        const toggleButton = screen.getByTestId('toggle')
        fireEvent.click(toggleButton)

        await waitFor(() => {
            expect(screen.getByTestId('theme').textContent).toBe('dark')
        })
    })

    it('persists theme to localStorage', async () => {
        render(
            <ThemeProvider>
                <ThemeConsumer />
            </ThemeProvider>
        )

        await waitFor(() => {
            expect(screen.getByTestId('mounted').textContent).toBe('true')
        })

        const setDarkButton = screen.getByTestId('set-dark')
        fireEvent.click(setDarkButton)

        await waitFor(() => {
            expect(localStorage.getItem('theme')).toBe('dark')
        })
    })

    it('loads theme from localStorage', async () => {
        localStorage.setItem('theme', 'dark')

        render(
            <ThemeProvider>
                <ThemeConsumer />
            </ThemeProvider>
        )

        await waitFor(() => {
            expect(screen.getByTestId('mounted').textContent).toBe('true')
        })
        expect(screen.getByTestId('theme').textContent).toBe('dark')
    })

    it('adds dark class to document when theme is dark', async () => {
        render(
            <ThemeProvider>
                <ThemeConsumer />
            </ThemeProvider>
        )

        await waitFor(() => {
            expect(screen.getByTestId('mounted').textContent).toBe('true')
        })

        fireEvent.click(screen.getByTestId('set-dark'))

        await waitFor(() => {
            expect(document.documentElement.classList.contains('dark')).toBe(true)
        })
    })

    it('removes dark class when theme is light', async () => {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')

        render(
            <ThemeProvider>
                <ThemeConsumer />
            </ThemeProvider>
        )

        await waitFor(() => {
            expect(screen.getByTestId('mounted').textContent).toBe('true')
        })

        fireEvent.click(screen.getByTestId('set-light'))

        await waitFor(() => {
            expect(document.documentElement.classList.contains('dark')).toBe(false)
        })
    })
})

describe('useTheme', () => {
    it('returns default context values when used outside provider', () => {
        render(<ThemeConsumer />)

        expect(screen.getByTestId('theme').textContent).toBe('light')
        expect(screen.getByTestId('mounted').textContent).toBe('false')
    })
})
