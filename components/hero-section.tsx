import { Sparkles, Zap, Shield } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              AI-Powered Food Delivery
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground lg:text-5xl xl:text-6xl text-balance">
              Order food with <span className="text-primary">natural language</span>
            </h1>
            <p className="max-w-lg text-lg text-muted-foreground text-pretty">
              Just tell our AI what you&apos;re craving. We&apos;ll find the best restaurants, build your order, and
              handle payments securely on Monad.
            </p>
            <div className="flex flex-wrap gap-6 pt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <span>Instant ordering</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <span>x402 secure payments</span>
              </div>
            </div>
          </div>

          {/* Right - Food Image Grid */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="overflow-hidden rounded-2xl shadow-lg">
                  <img src="/delicious-sushi-platter.jpg" alt="Sushi" className="h-48 w-full object-cover" />
                </div>
                <div className="overflow-hidden rounded-2xl shadow-lg">
                  <img src="/gourmet-burger-fries.png" alt="Burger" className="h-40 w-full object-cover" />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="overflow-hidden rounded-2xl shadow-lg">
                  <img src="/fresh-italian-pizza.jpg" alt="Pizza" className="h-40 w-full object-cover" />
                </div>
                <div className="overflow-hidden rounded-2xl shadow-lg">
                  <img src="/colorful-poke-bowl.jpg" alt="Poke Bowl" className="h-48 w-full object-cover" />
                </div>
              </div>
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-card px-6 py-3 shadow-xl border border-border">
              <p className="text-sm font-medium text-foreground">
                Powered by <span className="text-primary font-semibold">Monad</span> + DoorDash Drive
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
