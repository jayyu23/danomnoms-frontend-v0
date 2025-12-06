import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { CategoryBar } from "@/components/category-bar"
import { RestaurantGrid } from "@/components/restaurant-grid"
import { AiAgentWidget } from "@/components/ai-agent-widget"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <CategoryBar />
        <RestaurantGrid />
      </main>
      <AiAgentWidget />
    </div>
  )
}
