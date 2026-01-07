import { HeroSkeleton } from '@/components/Skeleton'

export default function Loading() {
    return (
        <div className="animate-fade-in">
            <HeroSkeleton />

            {/* Loading indicator for screen readers */}
            <div className="sr-only" role="status" aria-live="polite">
                Loading page content...
            </div>
        </div>
    )
}
