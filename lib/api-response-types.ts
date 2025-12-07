export interface OrderItem {
  name: string
  price: number
  quantity: number
}

export interface OrderPricing {
  subtotal: number
  tax: number
  deliveryFee: number
  total: number
}

export interface OrderSummaryResponse {
  type: "order_summary"
  restaurant: string
  items: OrderItem[]
  pricing: OrderPricing
  message?: string
}

export function parseOrderSummaryFromText(text: string): OrderSummaryResponse | null {
  try {
    // Try to extract JSON from markdown code blocks
    const jsonBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/)
    if (jsonBlockMatch) {
      const jsonText = jsonBlockMatch[1].trim()
      const parsed = JSON.parse(jsonText)
      if (parsed.type === "order_summary") {
        return parsed as OrderSummaryResponse
      }
    }

    // Try to parse the entire text as JSON
    const parsed = JSON.parse(text)
    if (parsed.type === "order_summary") {
      return parsed as OrderSummaryResponse
    }
  } catch (error) {
    // Not JSON, return null
  }

  return null
}
