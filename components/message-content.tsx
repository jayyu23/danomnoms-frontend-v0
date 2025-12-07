"use client"

import ReactMarkdown from "react-markdown"
import { ToolCallDisplay } from "@/components/tool-call-display"
import { RestaurantCard } from "@/components/restaurant-card"
import { OrderCard } from "@/components/order-card"
import { DeliveryTracker } from "@/components/delivery-tracker"
import { MenuItemCard } from "@/components/menu-item-card"
import { parseApiResponse } from "@/lib/text-parser"
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
    let items: Array<{ name: string; price: number; quantity: number }> = [
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
        
        // Check if we have item details with prices in the args
        if (buildCart.args.itemDetails && Array.isArray(buildCart.args.itemDetails)) {
          // Use detailed item information if available
          items = (buildCart.args.itemDetails as Array<{ name: string; price: number; quantity?: number }>).map(
            (item) => ({
              name: item.name,
              price: item.price,
              quantity: item.quantity || 1,
            })
          )
          // Calculate subtotal from items if not provided
          if (!costEstimate?.args?.subtotal) {
            subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
          }
        } else {
          // Fallback: try to extract prices from costEstimate or use default pricing
          const itemPrices = (costEstimate?.args?.itemPrices as Record<string, number>) || {}
          items = cartItems.map((itemName) => ({
            name: itemName,
            price: itemPrices[itemName] || 10.0, // Default price if not found
            quantity: 1,
          }))
        }
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

  // For user messages, just display plain text (no parsing/rendering as menu)
  if (message.role === "user") {
    return <p className="text-sm whitespace-pre-wrap">{message.content}</p>
  }

  // For assistant messages, parse and render structured data
  const parsed = parseApiResponse(message.content)
  const hasMenuItems = parsed.menuItems.length > 0
  const hasRestaurants = parsed.restaurants.length > 0

  return (
    <div className="space-y-3">
      {message.toolCalls && message.toolCalls.length > 0 && (
        <div className="space-y-2">
          {message.toolCalls.map((tool, index) => (
            <ToolCallDisplay key={index} toolCall={tool} />
          ))}
        </div>
      )}

      {/* Display restaurants if found */}
      {hasRestaurants && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Restaurants</p>
          <div className="space-y-2">
            {parsed.restaurants.map((restaurant, index) => (
              <RestaurantCard
                key={index}
                name={restaurant.name}
                cuisine={restaurant.cuisine || "Restaurant"}
                rating={restaurant.rating || 4.5}
                deliveryTime={restaurant.deliveryTime || "30 min"}
                deliveryFee={0}
                image="/placeholder.svg"
              />
            ))}
          </div>
        </div>
      )}

      {/* Display menu items as cards if found */}
      {hasMenuItems && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Menu Items</p>
          <div className="grid grid-cols-1 gap-2">
            {parsed.menuItems.map((item, index) => (
              <MenuItemCard key={index} name={item.name} price={item.price} description={item.description} />
            ))}
          </div>
        </div>
      )}

      {/* Render markdown content (use filtered text if we have menu items to avoid duplication) */}
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="text-sm mb-2 last:mb-0">{children}</p>,
            h1: ({ children }) => <h1 className="text-lg font-semibold mb-2 mt-4 first:mt-0">{children}</h1>,
            h2: ({ children }) => <h2 className="text-base font-semibold mb-2 mt-3 first:mt-0">{children}</h2>,
            h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 mt-2 first:mt-0">{children}</h3>,
            ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-2 text-sm">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-2 text-sm">{children}</ol>,
            li: ({ children }) => <li className="text-sm">{children}</li>,
            code: ({ children }) => (
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
            ),
            pre: ({ children }) => (
              <pre className="bg-muted p-2 rounded text-xs font-mono overflow-x-auto mb-2">{children}</pre>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-2 border-primary pl-3 italic text-sm mb-2">{children}</blockquote>
            ),
            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
            em: ({ children }) => <em className="italic">{children}</em>,
            a: ({ href, children }) => (
              <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto mb-2">
                <table className="min-w-full text-sm border-collapse">{children}</table>
              </div>
            ),
            thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
            tbody: ({ children }) => <tbody>{children}</tbody>,
            tr: ({ children }) => <tr className="border-b border-border">{children}</tr>,
            th: ({ children }) => <th className="px-3 py-2 text-left font-semibold">{children}</th>,
            td: ({ children }) => <td className="px-3 py-2">{children}</td>,
          }}
        >
          {hasMenuItems ? parsed.filteredText : message.content}
        </ReactMarkdown>
      </div>
    </div>
  )
}
