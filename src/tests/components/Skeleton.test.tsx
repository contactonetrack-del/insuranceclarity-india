import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Skeleton, TextSkeleton, CardSkeleton, HeroSkeleton, StatsGridSkeleton } from '@/components/Skeleton'

describe('Skeleton', () => {
    it('renders with default props', () => {
        const { container } = render(<Skeleton />)
        const skeleton = container.firstChild as HTMLElement

        expect(skeleton).toBeInTheDocument()
        expect(skeleton).toHaveAttribute('aria-hidden', 'true')
        expect(skeleton).toHaveClass('rounded-md')
    })

    it('applies custom width and height', () => {
        const { container } = render(<Skeleton width={100} height={50} />)
        const skeleton = container.firstChild as HTMLElement

        expect(skeleton).toHaveStyle({ width: '100px', height: '50px' })
    })

    it('applies string width and height', () => {
        const { container } = render(<Skeleton width="50%" height="2rem" />)
        const skeleton = container.firstChild as HTMLElement

        expect(skeleton).toHaveStyle({ width: '50%', height: '2rem' })
    })

    it('applies different rounded variants', () => {
        const { container: smContainer } = render(<Skeleton rounded="sm" />)
        expect(smContainer.firstChild).toHaveClass('rounded-sm')

        const { container: lgContainer } = render(<Skeleton rounded="lg" />)
        expect(lgContainer.firstChild).toHaveClass('rounded-lg')

        const { container: fullContainer } = render(<Skeleton rounded="full" />)
        expect(fullContainer.firstChild).toHaveClass('rounded-full')
    })

    it('applies custom className', () => {
        const { container } = render(<Skeleton className="custom-class" />)
        expect(container.firstChild).toHaveClass('custom-class')
    })
})

describe('TextSkeleton', () => {
    it('renders default 3 lines', () => {
        const { container } = render(<TextSkeleton />)
        const skeletons = container.querySelectorAll('[aria-hidden="true"] > div')

        // The component renders a div with aria-hidden containing multiple Skeleton elements
        expect(container.firstChild).toHaveClass('space-y-2')
    })

    it('renders specified number of lines', () => {
        const { container } = render(<TextSkeleton lines={5} />)
        expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
    })

    it('applies custom className', () => {
        const { container } = render(<TextSkeleton className="custom-text-skeleton" />)
        expect(container.firstChild).toHaveClass('custom-text-skeleton')
    })
})

describe('CardSkeleton', () => {
    it('renders with card styling', () => {
        const { container } = render(<CardSkeleton />)
        const card = container.firstChild as HTMLElement

        expect(card).toHaveClass('card')
        expect(card).toHaveClass('p-6')
        expect(card).toHaveAttribute('aria-hidden', 'true')
    })

    it('applies custom className', () => {
        const { container } = render(<CardSkeleton className="my-card" />)
        expect(container.firstChild).toHaveClass('my-card')
    })
})

describe('HeroSkeleton', () => {
    it('renders hero layout', () => {
        const { container } = render(<HeroSkeleton />)
        const hero = container.firstChild as HTMLElement

        expect(hero).toHaveClass('min-h-[80vh]')
        expect(hero).toHaveAttribute('aria-hidden', 'true')
    })

    it('contains grid layout', () => {
        const { container } = render(<HeroSkeleton />)
        const grid = container.querySelector('.grid')

        expect(grid).toBeInTheDocument()
        expect(grid).toHaveClass('lg:grid-cols-2')
    })
})

describe('StatsGridSkeleton', () => {
    it('renders default 4 items', () => {
        const { container } = render(<StatsGridSkeleton />)
        const grid = container.firstChild as HTMLElement

        expect(grid).toHaveClass('grid-cols-2')
        expect(grid).toHaveClass('md:grid-cols-4')
        expect(grid).toHaveAttribute('aria-hidden', 'true')
    })

    it('renders specified count of items', () => {
        const { container } = render(<StatsGridSkeleton count={6} />)
        const cards = container.querySelectorAll('.card')

        expect(cards).toHaveLength(6)
    })
})
