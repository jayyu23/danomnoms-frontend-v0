import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { RestaurantGrid } from "@/components/restaurant-grid"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <RestaurantGrid />
      </main>
    </div>
  )
}
