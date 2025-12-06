"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createThirdwebClient } from "thirdweb"
import { wrapFetchWithPayment } from "thirdweb/x402"
import { createWallet } from "thirdweb/wallets"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "",
})

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "processing" | "success" | "error">("loading")
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  const amount = searchParams.get("amount")
  const orderId = searchParams.get("orderId")
  const restaurant = searchParams.get("restaurant") || "Restaurant"
  const demoAmount = amount ? parseFloat(amount) / 1000 : 0

  useEffect(() => {
    if (!amount || !orderId) {
      setError("Missing payment information")
      setStatus("error")
      return
    }

    processPayment()
  }, [])

  const processPayment = async () => {
    try {
      setStatus("processing")

      // Connect wallet
      const wallet = createWallet("io.metamask")
      await wallet.connect({ client })

      // Wrap fetch with payment
      const fetchPay = wrapFetchWithPayment(fetch, client, wallet)

      // Make payment request
      const res = await fetchPay("/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          orderId,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setTxHash(data.tx?.hash || data.tx)
        setStatus("success")
        
        // Redirect to success page after 2 seconds
        setTimeout(() => {
          router.push(`/checkout/success?orderId=${orderId}&tx=${data.tx?.hash || data.tx}`)
        }, 2000)
      } else {
        const errorData = await res.json()
        setError(errorData.error || "Payment failed")
        setStatus("error")
      }
    } catch (error: any) {
      setError(error.message || "Payment error occurred")
      setStatus("error")
    }
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Preparing checkout...</p>
        </div>
      </div>
    )
  }

  if (status === "processing") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto p-6">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Processing Payment</h1>
          <p className="text-muted-foreground mb-4">
            Please approve the transaction in your wallet
          </p>
          <div className="bg-secondary rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Restaurant:</span>
              <span className="font-medium">{restaurant}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium">${demoAmount.toFixed(5)} USDC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order ID:</span>
              <span className="font-mono text-xs">{orderId}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (status === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto p-6">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground mb-4">
            Redirecting to confirmation page...
          </p>
          {txHash && (
            <p className="text-xs text-muted-foreground font-mono break-all">
              {txHash}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto p-6">
        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <div className="space-y-2">
          <Button onClick={processPayment} className="w-full">
            Try Again
          </Button>
          <Link href="/chat">
            <Button variant="outline" className="w-full">
              Back to Chat
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

