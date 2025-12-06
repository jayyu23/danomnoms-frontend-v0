import { NextResponse } from "next/server"

async function getThirdwebModules() {
  const thirdweb = await import("thirdweb")
  const x402 = await import("thirdweb/x402")
  const chains = await import("thirdweb/chains")
  return { thirdweb, x402, chains }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const amount = searchParams.get("amount")
    const orderId = searchParams.get("orderId")

    if (!amount || !orderId) {
      return NextResponse.json(
        { error: "Missing amount or orderId parameter" },
        { status: 400 }
      )
    }

    // Divide by 1000 for demo pricing (e.g., $24.42 -> $0.02442)
    const demoAmount = parseFloat(amount) / 1000

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

    // If no payment data, return 402 Payment Required
    // wrapFetchWithPayment will handle this and prompt user for payment
    if (!paymentData) {
      return NextResponse.json(
        {
          message: "Payment required",
          price: `$${demoAmount.toFixed(5)}`,
          payTo: process.env.SERVER_WALLET_ADDRESS || "",
          network: "monad-testnet",
        },
        {
          status: 402,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
    }

    // Payment data exists, validate and settle the payment
    try {
      const result: any = await x402.settlePayment({
        resourceUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/checkout?amount=${amount}&orderId=${orderId}`,
        method: "GET",
        paymentData: paymentData,
        network: chains.monadTestnet,
        price: `$${demoAmount.toFixed(5)}`,
        payTo: process.env.SERVER_WALLET_ADDRESS!,
        facilitator: thirdwebX402Facilitator,
      })

      if (result.status === 200) {
        // If payment is settled, return paid response
        return NextResponse.json({
          success: true,
          message: "Payment successful! Order confirmed.",
          tx: result.paymentReceipt,
          orderId,
        })
      } else if (result.status === 402) {
        console.log("Payment required", result)
        // Payment required - return 402 with proper format for wrapFetchWithPayment
        // wrapFetchWithPayment expects: { x402Version, accepts: [...] }
        // Use the responseBody from settlePayment if available, otherwise construct it
        const responseBody = result.responseBody || {
          message: "Payment required",
          price: `$${demoAmount.toFixed(5)}`,
          payTo: process.env.SERVER_WALLET_ADDRESS || "",
          network: "monad-testnet",
        }
        
        return new NextResponse(
          JSON.stringify(responseBody),
          {
            status: 402,
            headers: {
              "Content-Type": "application/json",
              ...(result.responseHeaders || {}),
            },
          }
        )
      } else {
        // Other error statuses
        const errorResponseBody = (result as any).responseBody || { error: "Payment validation failed" }
        const errorStatus = (result as any).status || 500
        const errorHeaders = (result as any).responseHeaders || {}
        
        return new NextResponse(
          JSON.stringify(errorResponseBody),
          {
            status: errorStatus,
            headers: {
              "Content-Type": "application/json",
              ...errorHeaders,
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
    console.error("Checkout error:", error)
    return NextResponse.json(
      { error: error.message || "Server error processing checkout" },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
}
