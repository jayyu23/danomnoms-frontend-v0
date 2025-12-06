"use client"

import React from "react"

import type { ReactNode } from "react"
import { useState, useEffect, createContext, useContext } from "react"
import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RainbowKitProvider, getDefaultConfig, darkTheme } from "@rainbow-me/rainbowkit"
import { defineChain } from "viem"

// Define Monad Testnet chain
const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Monad",
    symbol: "MON",
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.monad.xyz"],
    },
  },
  blockExplorers: {
    default: { name: "Monad Explorer", url: "https://testnet.monadexplorer.com" },
  },
  testnet: true,
})

// Create wagmi config with RainbowKit defaults
const config = getDefaultConfig({
  appName: "DaNomNoms",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "demo-project-id",
  chains: [monadTestnet],
  ssr: true,
})

const queryClient = new QueryClient()

// Mock wallet context for fallback
interface MockWalletState {
  address: string | null
  isConnected: boolean
  connect: () => void
  disconnect: () => void
  useRealWallet: boolean
}

const MockWalletContext = createContext<MockWalletState>({
  address: null,
  isConnected: false,
  connect: () => {},
  disconnect: () => {},
  useRealWallet: false,
})

export const useMockWallet = () => useContext(MockWalletContext)

function MockWalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)

  const connect = () => {
    setAddress("0x742d35Cc6634C0532925a3b844Bc9e7595f8bE35")
  }

  const disconnect = () => {
    setAddress(null)
  }

  return (
    <MockWalletContext.Provider
      value={{
        address,
        isConnected: !!address,
        connect,
        disconnect,
        useRealWallet: false,
      }}
    >
      {children}
    </MockWalletContext.Provider>
  )
}

function RealWalletProvider({ children }: { children: ReactNode }) {
  return (
    <MockWalletContext.Provider
      value={{
        address: null,
        isConnected: false,
        connect: () => {},
        disconnect: () => {},
        useRealWallet: true,
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            theme={darkTheme({
              accentColor: "#8b5cf6",
              accentColorForeground: "white",
              borderRadius: "medium",
            })}
          >
            {children}
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </MockWalletContext.Provider>
  )
}

// Error boundary component
class WalletErrorBoundary extends React.Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.log("[v0] Wallet provider error, using mock:", error.message)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <WalletErrorBoundary fallback={<MockWalletProvider>{children}</MockWalletProvider>}>
      <RealWalletProvider>{children}</RealWalletProvider>
    </WalletErrorBoundary>
  )
}
