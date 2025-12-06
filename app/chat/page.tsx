"use client"

import Link from "next/link"
import { ArrowLeft, MapPin, Wallet, ChevronDown, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChatInterface } from "@/components/chat-interface"
import { useState } from "react"

export default function ChatPage() {
  const [address, setAddress] = useState("San Francisco, CA")
  const [balance] = useState("125.00")
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [showBalanceModal, setShowBalanceModal] = useState(false)

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Chat Header */}
      <header className="border-b border-border bg-card px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
                <span className="text-sm font-bold text-primary-foreground">D</span>
              </div>
              <div>
                <h1 className="font-semibold text-foreground">DaNomNoms Agent</h1>
                <p className="text-xs text-muted-foreground">AI-powered ordering</p>
              </div>
            </div>
          </div>

          {/* Location, Balance, Settings */}
          <div className="flex items-center gap-2">
            {/* Location Button */}
            <button
              onClick={() => setShowLocationModal(true)}
              className="flex items-center gap-2 rounded-full bg-secondary px-3 py-2 text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              <MapPin className="h-4 w-4 text-primary" />
              <span className="hidden sm:inline max-w-[120px] truncate">{address}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>

            {/* Balance Button */}
            <button
              onClick={() => setShowBalanceModal(true)}
              className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
            >
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">${balance}</span>
            </button>

            {/* Settings */}
            <Button variant="ghost" size="icon" className="rounded-full">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Chat Interface */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface />
      </div>

      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">Delivery Location</h2>
            <div className="space-y-3">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your address"
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowLocationModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={() => setShowLocationModal(false)} className="flex-1">
                  Save Location
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Balance Modal */}
      {showBalanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">x402 Balance</h2>
            <div className="mb-4 rounded-xl bg-primary/10 p-4 text-center">
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <p className="text-3xl font-bold text-primary">${balance}</p>
              <p className="mt-1 text-xs text-muted-foreground">on Monad Testnet</p>
            </div>
            <div className="space-y-3">
              <input
                type="number"
                placeholder="Amount to add"
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowBalanceModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={() => setShowBalanceModal(false)} className="flex-1">
                  Add Funds
                </Button>
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Funds are held in your x402 spending cap and authorized per order
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
