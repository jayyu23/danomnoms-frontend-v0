"use client"

import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"

interface OrderItem {
  name: string
  price: number
  quantity: number
}

interface OrderCardProps {
  restaurant: string
  items: OrderItem[]
  subtotal: number
  tax: number
  deliveryFee: number
  total: number
}

export function OrderCard({ restaurant, items, subtotal, tax, deliveryFee, total }: OrderCardProps) {
  return (
    <div className="rounded-xl bg-background border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">{restaurant}</h4>
        <div className="flex items-center gap-1 text-xs text-primary">
          <Shield className="h-3 w-3" />
          x402
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between">
            <span>
              {item.quantity}x {item.name}
            </span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-2 space-y-1 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Delivery</span>
          <span>${deliveryFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-semibold pt-1">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <Button className="w-full">Confirm Order</Button>
      <p className="text-center text-xs text-muted-foreground">
        Say &quot;confirm&quot; or &quot;approve&quot; to authorize payment
      </p>
    </div>
  )
}
