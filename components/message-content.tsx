"use client"

import { ToolCallDisplay } from "@/components/tool-call-display"
import { RestaurantCard } from "@/components/restaurant-card"
import { OrderCard } from "@/components/order-card"
import { DeliveryTracker } from "@/components/delivery-tracker"
import type { Message } from "@/components/chat-interface"

interface MessageContentProps {
  message: Message
  onOrderConfirm?: (total: number, restaurant: string) => void
  isProcessingPayment?: boolean
}

export function MessageContent({ message, onOrderConfirm, isProcessingPayment }: MessageContentProps) {
  // Handle special content types
  if (message.content === "RESTAURANTS_DISPLAY") {
    return (
      <div className="space-y-3">
        <p className="text-sm">I found these great options nearby:</p>
        <div className="space-y-2">
          <RestaurantCard
            name="Wasabi Saratoga"
            cuisine="Japanese, Sushi"
            rating={4.8}
            deliveryTime="35 min"
            deliveryFee={0}
            image="/elegant-sushi-restaurant-food.jpg"
          />
          <RestaurantCard
            name="Rustic Pizza and Eats"
            cuisine="Italian, Pizza"
            rating={4.7}
            deliveryTime="30 min"
            deliveryFee={0}
            image="/wood-fired-pizza-restaurant.jpg"
          />
          <RestaurantCard
            name="Sunny Wok"
            cuisine="Chinese"
            rating={4.6}
            deliveryTime="40 min"
            deliveryFee={0}
            image="/indian-curry-dishes-restaurant.jpg"
          />
        </div>
      </div>
    )
  }

  if (message.content === "ORDER_CARD") {
    // Extract order details from tool calls
    let restaurant = "Wasabi Saratoga"
    let items = [
      { name: "Salmon Roll", price: 14.5, quantity: 1 },
      { name: "Miso Soup", price: 8.0, quantity: 1 },
    ]
    let subtotal = 22.5
    let tax = 1.91
    let deliveryFee = 0
    let total = 24.41

    // Try to extract from tool calls
    if (message.toolCalls) {
      const buildCart = message.toolCalls.find((tc) => tc.name === "build_cart")
      const costEstimate = message.toolCalls.find((tc) => tc.name === "compute_cost_estimate")

      if (buildCart?.args) {
        restaurant = (buildCart.args.restaurant as string) || restaurant
        const cartItems = (buildCart.args.items as string[]) || []
        // Convert item names to order items (simplified - in real app, you'd have full item data)
        items = cartItems.map((itemName, idx) => ({
          name: itemName,
          price: idx === 0 ? 14.5 : 8.0, // Simplified pricing
          quantity: 1,
        }))
      }

      if (costEstimate?.args) {
        subtotal = (costEstimate.args.subtotal as number) || subtotal
        tax = (costEstimate.args.tax as number) || tax
        deliveryFee = (costEstimate.args.delivery as number) || deliveryFee
      }

      if (costEstimate?.result && typeof costEstimate.result === "object" && "total" in costEstimate.result) {
        total = costEstimate.result.total as number
      }
    }

    return (
      <OrderCard
        restaurant={restaurant}
        items={items}
        subtotal={subtotal}
        tax={tax}
        deliveryFee={deliveryFee}
        total={total}
        onConfirm={() => onOrderConfirm?.(total, restaurant)}
        isProcessing={isProcessingPayment}
      />
    )
  }

  if (message.content === "DELIVERY_TRACKER") {
    return <DeliveryTracker deliveryId="DD-X7K9M2" restaurant="Wasabi Saratoga" eta="35 min" />
  }

  return (
    <div className="space-y-3">
      {message.toolCalls && message.toolCalls.length > 0 && (
        <div className="space-y-2">
          {message.toolCalls.map((tool, index) => (
            <ToolCallDisplay key={index} toolCall={tool} />
          ))}
        </div>
      )}
      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
    </div>
  )
}
