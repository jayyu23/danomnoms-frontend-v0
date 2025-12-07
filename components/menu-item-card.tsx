"use client"

import { DollarSign } from "lucide-react"

interface MenuItemCardProps {
  name: string
  price: number
  description?: string
}

export function MenuItemCard({ name, price, description }: MenuItemCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-foreground">{name}</h4>
          {description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>}
        </div>
        <div className="flex items-center gap-1 text-sm font-semibold text-primary shrink-0">
          <DollarSign className="h-4 w-4" />
          <span>{price.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
