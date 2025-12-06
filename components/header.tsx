"use client"

import { useState } from "react"
import { MapPin, Search, ShoppingBag, User, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  const [address] = useState("San Francisco, CA")

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
            <span className="text-lg font-bold text-primary-foreground">D</span>
          </div>
          <span className="text-xl font-bold text-foreground">DaNomNoms</span>
        </div>

        {/* Address & Search - Desktop */}
        <div className="hidden flex-1 items-center gap-4 px-8 md:flex">
          <button className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="max-w-[200px] truncate">{address}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search restaurants, cuisines..."
              className="w-full rounded-full bg-secondary py-2.5 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary sm:flex">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Monad Testnet
          </div>
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              0
            </span>
          </Button>
          <Button variant="outline" size="sm" className="hidden gap-2 sm:flex bg-transparent">
            <User className="h-4 w-4" />
            Sign In
          </Button>
        </div>
      </div>
    </header>
  )
}
