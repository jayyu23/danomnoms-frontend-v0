"use client"

import { useState, useEffect } from "react"
import { Check, Truck, ChefHat, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

interface DeliveryTrackerProps {
  deliveryId: string
  restaurant: string
  eta: string
}

const stages = [
  { id: "confirmed", label: "Order Confirmed", icon: Check },
  { id: "preparing", label: "Preparing", icon: ChefHat },
  { id: "picked_up", label: "Picked Up", icon: Truck },
  { id: "delivered", label: "Delivered", icon: MapPin },
]

export function DeliveryTracker({ deliveryId, restaurant, eta }: DeliveryTrackerProps) {
  const [currentStage, setCurrentStage] = useState(0)

  useEffect(() => {
    // Simulate delivery progress
    const interval = setInterval(() => {
      setCurrentStage((prev) => (prev < stages.length - 1 ? prev + 1 : prev))
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="rounded-xl bg-background border border-border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold">{restaurant}</h4>
          <p className="text-xs text-muted-foreground">Order #{deliveryId}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-primary">{eta}</p>
          <p className="text-xs text-muted-foreground">Estimated arrival</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        {stages.map((stage, index) => {
          const Icon = stage.icon
          const isComplete = index <= currentStage
          const isCurrent = index === currentStage

          return (
            <div key={stage.id} className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                  isComplete ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
                  isCurrent && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className={cn("text-xs", isComplete ? "text-foreground" : "text-muted-foreground")}>
                {stage.label}
              </span>
            </div>
          )
        })}
      </div>

      <div className="rounded-lg bg-primary/10 p-3 text-center">
        <p className="text-xs text-primary font-medium">Transaction recorded on Monad • Block #12847291</p>
      </div>
    </div>
  )
}
