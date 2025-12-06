"use client"

import { createThirdwebClient } from "thirdweb"
import { wrapFetchWithPayment } from "thirdweb/x402"
import { createWallet } from "thirdweb/wallets"

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "",
})

export async function processPayment(amount: number, orderId: string): Promise<{
  success: boolean
  tx?: unknown
  error?: string
}> {
  try {
    // Connect wallet
    const wallet = createWallet("io.metamask")
    await wallet.connect({ client })

    // Wrap fetch with payment
    const fetchPay = wrapFetchWithPayment(fetch, client, wallet)

    // Make payment request (amount will be divided by 1000 on server side)
    const res = await fetchPay("/api/payment", {
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
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Payment error occurred",
    }
  }
}
