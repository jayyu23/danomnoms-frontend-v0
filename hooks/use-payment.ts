"use client"

import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from "wagmi"
import { parseEther } from "viem"
import { useState } from "react"

// Server wallet address that receives payments
const SERVER_WALLET = process.env.NEXT_PUBLIC_SERVER_WALLET_ADDRESS || "0x0000000000000000000000000000000000000000"

export function usePayment() {
  const { address, isConnected } = useAccount()
  const [isPending, setIsPending] = useState(false)

  const { sendTransactionAsync, data: hash } = useSendTransaction()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const processPayment = async (amountUsd: number, orderId: string) => {
    if (!isConnected || !address) {
      return { success: false, error: "Wallet not connected" }
    }

    setIsPending(true)

    try {
      // Convert USD to MON (mock rate: 1 MON = $2 USD)
      const monAmount = amountUsd / 2
      const value = parseEther(monAmount.toFixed(6))

      // Send transaction to server wallet
      const txHash = await sendTransactionAsync({
        to: SERVER_WALLET as `0x${string}`,
        value,
        // Include orderId in data field for tracking
        data: `0x${Buffer.from(orderId).toString("hex")}` as `0x${string}`,
      })

      setIsPending(false)

      return {
        success: true,
        tx: txHash,
        monAmount: monAmount.toFixed(4),
      }
    } catch (error: unknown) {
      setIsPending(false)
      const errorMessage = error instanceof Error ? error.message : "Transaction failed"
      return { success: false, error: errorMessage }
    }
  }

  return {
    processPayment,
    isPending: isPending || isConfirming,
    isSuccess,
    isConnected,
    address,
    txHash: hash,
  }
}
