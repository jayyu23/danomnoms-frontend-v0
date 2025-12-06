"use client"

import { ToolCallDisplay } from "@/components/tool-call-display"
import { RestaurantCard } from "@/components/restaurant-card"
import { OrderCard } from "@/components/order-card"
import { DeliveryTracker } from "@/components/delivery-tracker"
import type { Message } from "@/components/chat-interface"

interface MessageContentProps {
  message: Message
}

export function MessageContent({ message }: MessageContentProps) {
  // Handle special content types
  if (message.content === "RESTAURANTS_DISPLAY") {
    return (
      <div className="space-y-3">
        <p className="text-sm">I found these great options nearby:</p>
        <div className="space-y-2">
          <RestaurantCard
            name="Sushi Master"
            cuisine="Japanese"
            rating={4.8}
            deliveryTime="25-35 min"
            deliveryFee={4.99}
            image="/bustling-sushi-restaurant.png"
          />
          <RestaurantCard
            name="Pizza Palace"
            cuisine="Italian"
            rating={4.5}
            deliveryTime="30-40 min"
            deliveryFee={3.99}
            image="/bustling-pizza-restaurant.png"
          />
        </div>
      </div>
    )
  }

  if (message.content === "ORDER_CARD") {
    return (
      <OrderCard
        restaurant="Sushi Master"
        items={[
          { name: "Dragon Roll", price: 16.5, quantity: 1 },
          { name: "Miso Soup", price: 4.0, quantity: 2 },
        ]}
        subtotal={24.5}
        tax={2.08}
        deliveryFee={4.99}
        total={31.57}
      />
    )
  }

  if (message.content === "DELIVERY_TRACKER") {
    return <DeliveryTracker deliveryId="DD-X7K9M2" restaurant="Sushi Master" eta="25-35 min" />
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
