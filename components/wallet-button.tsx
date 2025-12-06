"use client"

import { useState, useEffect } from "react"
import { Wallet, ChevronDown, LogOut } from "lucide-react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useMockWallet } from "./providers"

function MockWalletButton() {
  const [showMenu, setShowMenu] = useState(false)
  const { address, isConnected, connect, disconnect } = useMockWallet()

  if (!isConnected) {
    return (
      <button
        onClick={connect}
        className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Wallet className="h-4 w-4" />
        <span>Connect Wallet</span>
      </button>
    )
  }

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
      >
        <div className="flex items-center gap-2 rounded-full bg-secondary px-2 py-1">
          <div className="h-4 w-4 rounded-full bg-violet-500" />
          <span className="text-xs hidden sm:inline">Monad</span>
        </div>
        <Wallet className="h-4 w-4" />
        <span>{shortAddress}</span>
        <ChevronDown className="h-3 w-3" />
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 w-48 rounded-xl bg-card border shadow-lg overflow-hidden">
            <div className="p-3 border-b">
              <p className="text-xs text-muted-foreground">Connected to Monad Testnet</p>
              <p className="text-sm font-mono mt-1">{shortAddress}</p>
            </div>
            <button
              onClick={() => {
                disconnect()
                setShowMenu(false)
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Disconnect
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function RainbowKitWalletButton() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const connected = mounted && account && chain

        return (
          <div
            {...(!mounted && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <Wallet className="h-4 w-4" />
                    <span>Connect Wallet</span>
                  </button>
                )
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    className="flex items-center gap-2 rounded-full bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground"
                  >
                    Wrong network
                  </button>
                )
              }

              return (
                <div className="flex items-center gap-2">
                  <button
                    onClick={openChainModal}
                    className="flex items-center gap-2 rounded-full bg-secondary px-3 py-2 text-sm font-medium hover:bg-secondary/80 transition-colors"
                  >
                    {chain.hasIcon && (
                      <div
                        className="h-4 w-4 rounded-full overflow-hidden"
                        style={{ background: chain.iconBackground }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? "Chain"}
                            src={chain.iconUrl || "/placeholder.svg"}
                            className="h-4 w-4"
                          />
                        )}
                      </div>
                    )}
                    {!chain.hasIcon && <div className="h-4 w-4 rounded-full bg-violet-500" />}
                    <span className="hidden sm:inline">{chain.name}</span>
                  </button>

                  <button
                    onClick={openAccountModal}
                    className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Wallet className="h-4 w-4" />
                    <span>{account.displayName}</span>
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </div>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}

export function WalletButton() {
  const [mounted, setMounted] = useState(false)
  const { useRealWallet } = useMockWallet()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground opacity-50">
        <Wallet className="h-4 w-4" />
        <span>Loading...</span>
      </button>
    )
  }

  if (useRealWallet) {
    return <RainbowKitWalletButton />
  }

  return <MockWalletButton />
}
