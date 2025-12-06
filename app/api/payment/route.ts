import { NextResponse } from "next/server"
import { createThirdwebClient } from "thirdweb"
import { facilitator, settlePayment } from "thirdweb/x402"
import { monadTestnet } from "thirdweb/chains"

const client = createThirdwebClient({
  secretKey: process.env.THIRDWEB_SECRET_KEY || "",
})

const thirdwebX402Facilitator = facilitator({
  client,
  serverWalletAddress: process.env.SERVER_WALLET_ADDRESS || "",
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { amount, orderId } = body

    const paymentData = request.headers.get("x-payment")

    const result = await settlePayment({
      resourceUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/payment`,
      method: "POST",
      paymentData: paymentData || undefined,
      network: monadTestnet,
      price: `$${amount}`,
      payTo: process.env.SERVER_WALLET_ADDRESS!,
      facilitator: thirdwebX402Facilitator,
    })

    if (result.status === 200) {
      // Payment successful, return success response
      return NextResponse.json({
        success: true,
        message: "Payment successful! Order confirmed.",
        tx: result.paymentReceipt,
        orderId,
      })
    } else {
      // Send payment status (402 with payment requirements)
      return NextResponse.json(result.responseBody, {
        status: result.status,
        headers: {
          "Content-Type": "application/json",
          ...(result.responseHeaders || {}),
        },
      })
    }
  } catch (error) {
    console.error("Payment error:", error)
    return NextResponse.json(
      { error: "Server error processing payment" },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
}

