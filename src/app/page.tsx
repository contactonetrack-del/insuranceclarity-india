import { HeroSection } from '@/components/home/HeroSection'
import dynamic from 'next/dynamic'
import { SkeletonStats } from '@/components/ui/Skeleton'

// ─── Section Skeletons ────────────────────────────────────────────────────────
function SectionSkeleton() {
    return (
        <div className="py-24 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="h-6 w-32 bg-theme-tertiary rounded-full mx-auto mb-4 animate-pulse" />
                <div className="h-10 w-64 bg-theme-secondary rounded-xl mx-auto mb-12 animate-pulse" />
                <SkeletonStats count={4} />
            </div>
        </div>
    )
}

function CategorySkeleton() {
    return (
        <div className="py-24 px-6 bg-theme-secondary">
            <div className="max-w-7xl mx-auto">
                <div className="h-6 w-40 bg-theme-tertiary rounded-full mx-auto mb-4 animate-pulse" />
                <div className="h-10 w-72 bg-theme-tertiary rounded-xl mx-auto mb-12 animate-pulse" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-40 glass rounded-2xl animate-pulse" />
                    ))}
                </div>
            </div>
        </div>
    )
}

function ToolsSkeleton() {
    return (
        <div className="py-24 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="h-6 w-32 bg-theme-tertiary rounded-full mx-auto mb-4 animate-pulse" />
                <div className="h-10 w-56 bg-theme-secondary rounded-xl mx-auto mb-12 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-36 glass rounded-2xl animate-pulse" />
                    ))}
                </div>
            </div>
        </div>
    )
}

// ─── Lazy-loaded below-the-fold sections ─────────────────────────────────────
const StatsSection = dynamic(
    () => import('@/components/home/StatsSection').then(mod => mod.StatsSection),
    { loading: () => <SectionSkeleton /> }
)
const CategoriesSection = dynamic(
    () => import('@/components/home/CategoriesSection').then(mod => mod.CategoriesSection),
    { loading: () => <CategorySkeleton /> }
)
const ToolsSection = dynamic(
    () => import('@/components/home/ToolsSection').then(mod => mod.ToolsSection),
    { loading: () => <ToolsSkeleton /> }
)
const CTASection = dynamic(
    () => import('@/components/home/CTASection').then(mod => mod.CTASection),
    { loading: () => <div className="h-48 animate-pulse glass rounded-3xl mx-6 my-8" /> }
)

export default function HomePage() {
    return (
        <div className="min-h-screen">
            <HeroSection />
            <StatsSection />
            <CategoriesSection />
            <ToolsSection />
            <CTASection />
        </div>
    )
}
