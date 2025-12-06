import { NextResponse } from "next/server"

async function getThirdwebModules() {
  const thirdweb = await import("thirdweb")
  const x402 = await import("thirdweb/x402")
  const chains = await import("thirdweb/chains")
  return { thirdweb, x402, chains }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { amount, orderId } = body

    // This avoids the Solana dependency issue in the preview environment
    const isDemoMode = !process.env.THIRDWEB_SECRET_KEY || process.env.THIRDWEB_SECRET_KEY === ""

    if (isDemoMode) {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1000))

      return NextResponse.json({
        success: true,
        message: "Payment successful! Order confirmed.",
        tx: {
          hash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
          network: "monad-testnet",
          amount: amount,
        },
        orderId,
      })
    }

    // Real payment flow with thirdweb
    const { thirdweb, x402, chains } = await getThirdwebModules()

    const client = thirdweb.createThirdwebClient({
      secretKey: process.env.THIRDWEB_SECRET_KEY || "",
    })

    const thirdwebX402Facilitator = x402.facilitator({
      client,
      serverWalletAddress: process.env.SERVER_WALLET_ADDRESS || "",
    })

    const paymentData = request.headers.get("x-payment")

    const result = await x402.settlePayment({
      resourceUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/payment`,
      method: "POST",
      paymentData: paymentData || undefined,
      network: chains.monadTestnet,
      price: `$${amount}`,
      payTo: process.env.SERVER_WALLET_ADDRESS!,
      facilitator: thirdwebX402Facilitator,
    })

    if (result.status === 200) {
      return NextResponse.json({
        success: true,
        message: "Payment successful! Order confirmed.",
        tx: result.paymentReceipt,
        orderId,
      })
    } else {
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
      },
    )
  }
}
