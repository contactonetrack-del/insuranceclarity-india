/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import DesktopScanCta from './DesktopScanCta'

describe('DesktopScanCta', () => {
    it('renders desktop scan CTA link to scan route', () => {
        render(<DesktopScanCta />)

        const link = screen.getByRole('link', { name: /scanPolicy/i })
        expect(link).toHaveAttribute('href', '/scan')
    })
})
