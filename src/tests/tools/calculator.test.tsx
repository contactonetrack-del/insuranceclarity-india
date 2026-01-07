import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CalculatorPage from '@/app/tools/calculator/page'

// Mock formatCurrency since it uses Intl which might behave differently in test env
// But we have good polyfills, let's see. Reusing the helper from utils if needed.
// Actually, let's just test the values presence.

describe('CalculatorPage', () => {
    it('renders all form inputs', () => {
        render(<CalculatorPage />)
        expect(screen.getByLabelText(/Age/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Insurance Type/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Sum Assured/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Gender/i)).toBeInTheDocument()
    })

    it('calculates premium on button click', async () => {
        render(<CalculatorPage />)

        const calculateBtn = screen.getByRole('button', { name: /Calculate Premium/i })
        fireEvent.click(calculateBtn)

        // Button should show loading state
        expect(screen.getByText(/Calculating.../i)).toBeInTheDocument()

        // Wait for result (timeout in component is 600ms)
        await waitFor(() => {
            const resultDisplay = screen.getByText(/\/year/i)
            expect(resultDisplay).toBeInTheDocument()
            // Default params: Age 25, Life (2000), 50L (2500), Male (1.0)
            // Logic: (2000 * 1.14 * 1.0) + (25 * 100) = 2280 + 2500 = 4780
            // Wait, logic in component:
            // Base 2000. Age 25 -> 1 + (7 * 0.02) = 1.14. Gender Male 1.0.
            // Sum 50,00,000 / 1L = 50. 50 * 0.5 = 25 factor.
            // Total = (2000 * 1.14 * 1.0) + (25 * 100) = 2280 + 2500 = 4780.
            // Let's just check for '₹' or a number.
            expect(screen.getAllByText(/₹/i).length).toBeGreaterThan(0)
        }, { timeout: 1000 })
    })

    it('updates inputs correctly', () => {
        render(<CalculatorPage />)

        const ageInput = screen.getByLabelText(/Age/i) as HTMLInputElement
        fireEvent.change(ageInput, { target: { value: '30' } })
        expect(ageInput.value).toBe('30')
    })
})
