"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [orderId, setOrderId] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  useEffect(() => {
    const orderIdParam = searchParams.get("orderId")
    const txParam = searchParams.get("tx")
    setOrderId(orderIdParam)
    setTxHash(txParam)
  }, [searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Payment Successful!</h1>
          <p className="text-muted-foreground">
            Your order has been confirmed and payment processed via x402 on Monad testnet.
          </p>
        </div>

        <div className="bg-secondary rounded-lg p-4 space-y-3 text-left">
          {orderId && (
            <div>
              <span className="text-sm text-muted-foreground">Order ID:</span>
              <p className="font-mono text-sm font-medium">{orderId}</p>
            </div>
          )}
          {txHash && (
            <div>
              <span className="text-sm text-muted-foreground">Transaction Hash:</span>
              <p className="font-mono text-xs break-all">{txHash}</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Your delivery is being prepared. You'll receive updates in the chat.
          </p>
          <div className="flex gap-3">
            {txHash ? (
              <a
                href={`https://testnet.monadexplorer.com/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button className="w-full">
                  View Order Onchain
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            ) : (
              <Link href="/chat" className="flex-1">
                <Button className="w-full" disabled>
                  View Order Onchain
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full">
                Back Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

