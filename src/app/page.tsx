import { HeroSection } from '@/components/home/HeroSection'
import { StatsSection } from '@/components/home/StatsSection'
import { CategoriesSection } from '@/components/home/CategoriesSection'
import { ToolsSection } from '@/components/home/ToolsSection'
import { CTASection } from '@/components/home/CTASection'

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
