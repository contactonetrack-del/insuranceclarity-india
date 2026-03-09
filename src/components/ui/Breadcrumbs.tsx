'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { JsonLd, generateBreadcrumbSchema } from '@/components/seo/JsonLd';

export default function Breadcrumbs() {
    const pathname = usePathname()

    // Don't render breadcrumbs on homepage
    if (pathname === '/') return null

    // Split pathname into segments
    const segments = pathname.split('/').filter((segment) => segment !== '')

    // Map segments to formatted labels
    const formatSegment = (segment: string) => {
        return segment
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase())
    }

    const breadcrumbItems = [
        { name: 'Home', item: 'https://insuranceclarity.in' },
        ...segments.map((segment, index) => ({
            name: formatSegment(segment),
            item: `https://insuranceclarity.in/${segments.slice(0, index + 1).join('/')}`
        }))
    ];

    const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

    return (
        <nav aria-label="Breadcrumb" className="mb-6 overflow-x-auto">
            <JsonLd data={breadcrumbSchema} />
            <ol className="flex items-center gap-2 text-sm text-theme-muted min-w-max">
                <li>
                    <Link
                        href="/"
                        className="flex items-center gap-1.5 hover:text-accent transition-colors focus:ring-2 focus:ring-accent rounded outline-none"
                        aria-label="Home"
                    >
                        <Home className="w-4 h-4" />
                    </Link>
                </li>

                {segments.map((segment, index) => {
                    const isLast = index === segments.length - 1
                    const href = `/${segments.slice(0, index + 1).join('/')}`

                    return (
                        <li key={href} className="flex items-center gap-2">
                            <ChevronRight className="w-4 h-4 opacity-50 flex-shrink-0" />
                            {isLast ? (
                                <span className="font-medium text-theme-primary truncate max-w-[200px]" aria-current="page">
                                    {formatSegment(segment)}
                                </span>
                            ) : (
                                <Link
                                    href={href}
                                    className="hover:text-accent transition-colors truncate max-w-[200px] focus:ring-2 focus:ring-accent rounded outline-none"
                                >
                                    {formatSegment(segment)}
                                </Link>
                            )}
                        </li>
                    )
                })}
            </ol>
        </nav>
    )
}
