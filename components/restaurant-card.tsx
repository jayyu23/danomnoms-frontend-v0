"use client"

import { Star } from "lucide-react"

interface RestaurantCardProps {
  name: string
  cuisine: string
  rating: number
  deliveryTime: string
  deliveryFee: number
  image: string
}

export function RestaurantCard({ name, cuisine, rating, deliveryTime, deliveryFee, image }: RestaurantCardProps) {
  return (
    <div className="flex gap-3 rounded-lg bg-background/50 border border-border p-2 hover:border-primary/50 transition-colors cursor-pointer">
      <img src={image || "/placeholder.svg"} alt={name} className="h-16 w-16 rounded-lg object-cover" />
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate">{name}</h4>
        <p className="text-xs text-muted-foreground">{cuisine}</p>
        <div className="flex items-center gap-2 mt-1 text-xs">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{rating}</span>
          </div>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">{deliveryTime}</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">${deliveryFee.toFixed(2)} delivery</span>
        </div>
      </div>
    </div>
  )
}
