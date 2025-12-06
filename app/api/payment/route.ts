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

    // Divide by 1000 for demo pricing (e.g., $24.42 -> $0.02442)
    const demoAmount = amount / 1000

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
          amount: demoAmount,
          currency: "USDC",
        },
        orderId,
      })
    }

    // Real payment flow with thirdweb x402
    const { thirdweb, x402, chains } = await getThirdwebModules()

    const client = thirdweb.createThirdwebClient({
      secretKey: process.env.THIRDWEB_SECRET_KEY || "",
    })

    const thirdwebX402Facilitator = x402.facilitator({
      client,
      serverWalletAddress: process.env.SERVER_WALLET_ADDRESS || "",
    })

    // Check if payment data exists in headers (sent by wrapFetchWithPayment)
    const paymentData = request.headers.get("x-payment")

    // If no payment data, return 402 Payment Required with payment requirements
    // wrapFetchWithPayment will handle this and prompt user for payment
    if (!paymentData) {
      try {
        // Get payment requirements from x402
        const paymentRequirements = await x402.getPaymentRequirements({
          network: chains.monadTestnet,
          price: `$${demoAmount}`,
          payTo: process.env.SERVER_WALLET_ADDRESS!,
          facilitator: thirdwebX402Facilitator,
        })

        return NextResponse.json(
          paymentRequirements,
          {
            status: 402,
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
      } catch (reqError: any) {
        console.error("Error getting payment requirements:", reqError)
        // If getPaymentRequirements fails (e.g., missing service key), return basic 402
        // This will allow demo mode to work
        return NextResponse.json(
          {
            message: "Payment required",
            price: `$${demoAmount}`,
          },
          {
            status: 402,
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
      }
    }

    // Payment data exists, validate and settle the payment
    try {
      const result = await x402.settlePayment({
        resourceUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/payment`,
        method: "POST",
        paymentData: paymentData,
        network: chains.monadTestnet,
        price: `$${demoAmount}`,
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
        return NextResponse.json(
          result.responseBody || { error: "Payment validation failed" },
          {
            status: result.status,
            headers: {
              "Content-Type": "application/json",
              ...(result.responseHeaders || {}),
            },
          }
        )
      }
    } catch (settleError: any) {
      console.error("Payment settlement error:", settleError)
      return NextResponse.json(
        { error: settleError.message || "Payment settlement failed" },
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      )
    }
  } catch (error: any) {
    console.error("Payment error:", error)
    return NextResponse.json(
      { error: error.message || "Server error processing payment" },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
}
