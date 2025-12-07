"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useActiveWallet, ConnectButton } from "thirdweb/react"
import { wrapFetchWithPayment } from "thirdweb/x402"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { client } from "@/lib/thirdweb.client"

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const wallet = useActiveWallet()
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [message, setMessage] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  const amount = searchParams.get("amount")
  const orderId = searchParams.get("orderId")
  const restaurant = searchParams.get("restaurant") || "Restaurant"
  const demoAmount = amount ? parseFloat(amount) / 1000 : 0

  const processPayment = async () => {
    if (!wallet) {
      setMessage("Please connect your wallet first")
      return
    }

    if (!amount || !orderId) {
      setError("Missing payment information")
      setStatus("error")
      return
    }

    setStatus("processing")
    setMessage("Processing payment on Monad…")

    try {
      const fetchWithPayment = wrapFetchWithPayment(fetch, client, wallet)

      const checkoutUrl = `/api/checkout?amount=${amount}&orderId=${encodeURIComponent(orderId)}`
      const res = await fetchWithPayment(checkoutUrl, {
        method: "GET",
      })

      const json = await res.json()

      if (res.ok) {
        // Ensure tx is a string, not an object
        const txHash = typeof json.tx === 'string' 
          ? json.tx 
          : json.tx?.hash || json.tx?.transaction?.hash || null;
        setTxHash(txHash)
        setStatus("success")
        setMessage("Payment successful! Order confirmed.")
        
        // Redirect to success page after 2 seconds
        setTimeout(() => {
          if (orderId && txHash) {
            router.push(`/checkout/success?orderId=${orderId}&tx=${txHash}`)
          }
        }, 2000)
      } else {
        setError(json.error || json.message || "Payment failed")
        setStatus("error")
        setMessage("Error from server:\n" + JSON.stringify(json, null, 2))
      }
    } catch (e: any) {
      console.error("Payment error:", e)
      setError(e?.message || "Unknown error")
      setStatus("error")
      setMessage("Client error: " + (e?.message || "Unknown error"))
    }
  }

  if (status === "idle") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="max-w-md w-full space-y-4">
          <h1 className="text-2xl font-bold text-center">Complete Your Order</h1>
          
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

          <div className="flex justify-center">
            <ConnectButton client={client} />
          </div>

          {message && (
            <div className="bg-secondary rounded-lg p-4 min-h-[100px]">
              <pre className="text-sm whitespace-pre-wrap break-words">{message}</pre>
            </div>
          )}

          <button
            onClick={processPayment}
            disabled={!wallet}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Pay & Confirm Order
          </button>

          <p className="text-xs text-muted-foreground text-center">
            You will be prompted to approve USDC spend in your wallet
          </p>

          <Link href="/chat" className="block">
            <Button variant="outline" className="w-full">
              Back to Chat
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (status === "processing") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="max-w-md w-full space-y-4">
          <h1 className="text-2xl font-bold text-center">Processing Payment</h1>
          
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

          {message && (
            <div className="bg-secondary rounded-lg p-4 min-h-[100px]">
              <pre className="text-sm whitespace-pre-wrap break-words">{message}</pre>
            </div>
          )}

          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">
              Please approve the transaction in your wallet
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (status === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="max-w-md w-full space-y-4 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold">Payment Successful!</h1>
          <p className="text-muted-foreground">
            Redirecting to confirmation page...
          </p>
          {message && (
            <div className="bg-secondary rounded-lg p-4 min-h-[100px]">
              <pre className="text-sm whitespace-pre-wrap break-words">{message}</pre>
            </div>
          )}
          {txHash && (
            <p className="text-xs text-muted-foreground font-mono break-all">
              {typeof txHash === 'string' ? txHash : JSON.stringify(txHash)}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="max-w-md w-full space-y-4 text-center">
        <XCircle className="h-16 w-16 text-red-500 mx-auto" />
        <h1 className="text-2xl font-bold">Payment Failed</h1>
        {error && <p className="text-muted-foreground">{error}</p>}
        {message && (
          <div className="bg-secondary rounded-lg p-4 min-h-[100px]">
            <pre className="text-sm whitespace-pre-wrap break-words">{message}</pre>
          </div>
        )}
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

