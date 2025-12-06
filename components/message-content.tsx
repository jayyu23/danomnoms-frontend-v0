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
    return (
      <OrderCard
        restaurant="Wasabi Saratoga"
        items={[
          { name: "Salmon Roll", price: 14.5, quantity: 1 },
          { name: "Miso Soup", price: 8.0, quantity: 1 },
        ]}
        subtotal={22.5}
        tax={1.91}
        deliveryFee={0}
        total={24.41}
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
