"use client"

import { parseEther } from "viem"

export async function processPayment(
  amount: number,
  orderId: string,
): Promise<{
  success: boolean
  tx?: unknown
  error?: string
}> {
  try {
    // Make payment request to our API route which handles the payment server-side
    const res = await fetch("/api/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        orderId,
      }),
    })

    if (res.ok) {
      const data = await res.json()
      return {
        success: true,
        tx: data.tx,
      }
    } else {
      const error = await res.json()
      return {
        success: false,
        error: error.error || "Payment failed",
      }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Payment error occurred"
    return {
      success: false,
      error: errorMessage,
    }
  }
}

// Helper to convert USD to MON (mock rate for demo)
export function usdToMon(usdAmount: number): bigint {
  // Mock conversion rate: 1 MON = $2 USD
  const monAmount = usdAmount / 2
  return parseEther(monAmount.toString())
}
