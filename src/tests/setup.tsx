import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Cleanup after each test
afterEach(() => {
    cleanup()
})

// Mock Next.js router
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
}))

// Mock Next.js Image component
vi.mock('next/image', () => ({
    default: ({ src, alt, ...props }: { src: string; alt: string;[key: string]: unknown }) => {
        // eslint-disable-next-line @next/next/no-img-element
        return <img src={ src } alt = { alt } {...props
} />
    },
}))

// Mock Framer Motion to avoid animation issues in tests
vi.mock('framer-motion', async () => {
    const actual = await vi.importActual('framer-motion')
    return {
        ...actual,
        motion: {
            div: ({ children, ...props }: { children?: React.ReactNode;[key: string]: unknown }) => <div { ...props } > { children } </div>,
            span: ({ children, ...props }: { children?: React.ReactNode;[key: string]: unknown }) => <span { ...props } > { children } </span>,
            button: ({ children, ...props }: { children?: React.ReactNode;[key: string]: unknown }) => <button { ...props } > { children } </button>,
            a: ({ children, ...props }: { children?: React.ReactNode;[key: string]: unknown }) => <a { ...props } > { children } </a>,
        },
        AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{ children } </>,
    }
})

// Mock matchMedia for tests
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
})
