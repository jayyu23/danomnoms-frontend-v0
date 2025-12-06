"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

const categories = [
  { id: "all", label: "All", icon: "🍽️" },
  { id: "pizza", label: "Pizza", icon: "🍕" },
  { id: "sushi", label: "Sushi", icon: "🍣" },
  { id: "burgers", label: "Burgers", icon: "🍔" },
  { id: "mexican", label: "Mexican", icon: "🌮" },
  { id: "chinese", label: "Chinese", icon: "🥡" },
  { id: "indian", label: "Indian", icon: "🍛" },
  { id: "thai", label: "Thai", icon: "🍜" },
  { id: "healthy", label: "Healthy", icon: "🥗" },
  { id: "dessert", label: "Dessert", icon: "🍰" },
]

export function CategoryBar() {
  const [active, setActive] = useState("all")

  return (
    <section className="border-b border-border bg-card sticky top-16 z-30">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActive(cat.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                active === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground hover:bg-secondary/80",
              )}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
