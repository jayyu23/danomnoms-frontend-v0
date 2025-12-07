"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Loader2, Bot, User, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MessageContent } from "@/components/message-content"
import { useAccount } from "wagmi"

export type MessageRole = "user" | "assistant"

export interface ToolCall {
  name: string
  args: Record<string, unknown>
  result?: unknown
}

export interface Message {
  id: string
  role: MessageRole
  content: string
  toolCalls?: ToolCall[]
  timestamp: Date
}

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Hey! I'm your DaNomNoms AI agent. I can help you order food and handle payments securely on Monad. What are you in the mood for today?",
    timestamp: new Date(),
  },
]

const suggestedPrompts = [
  "Get me sushi under $30 delivered ASAP",
  "I want a burrito, something spicy",
  "Order me pizza for 4 people",
  "Find me healthy lunch options nearby",
]

const THREAD_ID_KEY = "danomnoms_thread_id"
const USE_DEMO_MODE_KEY = "danomnoms_use_demo_mode"
const SERVER_START_TIME_KEY = "danomnoms_server_start_time"

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [pendingOrderTotal, setPendingOrderTotal] = useState<number | null>(null)
  const [threadId, setThreadId] = useState<string | null>(null)
  const [useDemoMode, setUseDemoMode] = useState<boolean>(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { isConnected, address } = useAccount()

  // Load thread_id and demo mode preference from localStorage on mount
  // Also check if server has restarted and regenerate thread_id if needed
  useEffect(() => {
    const checkServerRestart = async () => {
      try {
        // Get current server start time
        const response = await fetch("/api/server-info")
        if (response.ok) {
          const data = await response.json()
          const currentServerStartTime = data.serverStartTime

          // Get saved server start time from localStorage
          const savedServerStartTime = localStorage.getItem(SERVER_START_TIME_KEY)

          // If server has restarted (different start time), clear thread_id
          if (savedServerStartTime && savedServerStartTime !== String(currentServerStartTime)) {
            console.log("[Chat] Server restarted, clearing old thread_id")
            localStorage.removeItem(THREAD_ID_KEY)
            setThreadId(null)
          }

          // Update saved server start time
          localStorage.setItem(SERVER_START_TIME_KEY, String(currentServerStartTime))
        }
      } catch (error) {
        console.error("[Chat] Error checking server start time:", error)
        // Continue with normal flow if check fails
      }

      // Load thread_id and demo mode preference
      const savedThreadId = localStorage.getItem(THREAD_ID_KEY)
      const savedDemoMode = localStorage.getItem(USE_DEMO_MODE_KEY)
      if (savedThreadId) {
        setThreadId(savedThreadId)
      }
      if (savedDemoMode !== null) {
        setUseDemoMode(savedDemoMode === "true")
      } else {
        // Default to demo mode for now
        setUseDemoMode(true)
      }
    }

    checkServerRestart()
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input
    setInput("")
    setIsLoading(true)

    try {
      if (useDemoMode) {
        await simulateAgentResponse(currentInput, messages, setMessages, setPendingOrderTotal)
      } else {
        await callAgentAPI(currentInput, threadId, setThreadId, setMessages, setPendingOrderTotal)
      }
    } catch (error) {
      console.error("Error in chat:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: `I encountered an error: ${error instanceof Error ? error.message : "Unknown error"}. Falling back to demo mode.`,
          timestamp: new Date(),
        },
      ])
      // Fallback to demo mode on error
      await simulateAgentResponse(currentInput, messages, setMessages, setPendingOrderTotal)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestion = (prompt: string) => {
    setInput(prompt)
  }

  const handleOrderConfirm = async (total: number, restaurant: string) => {
    if (!isConnected) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content:
            "Please connect your wallet first to complete the payment. Use the 'Connect Wallet' button in the header.",
          timestamp: new Date(),
        },
      ])
      return
    }

    const orderId = `ORDER-${Date.now()}`
    const demoAmount = total / 1000

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "assistant",
        content: "Redirecting to checkout to complete payment via x402 on Monad...",
        toolCalls: [
          {
            name: "request_payment_authorization",
            args: { amount: demoAmount, currency: "USDC", protocol: "x402", network: "Monad Testnet" },
          },
        ],
        timestamp: new Date(),
      },
    ])

    // Redirect to checkout page
    const checkoutUrl = `/checkout?amount=${total}&orderId=${orderId}&restaurant=${encodeURIComponent(restaurant)}`
    window.location.href = checkoutUrl
  }

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="mx-auto max-w-3xl space-y-6">
          {!isConnected && (
            <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 text-center">
              <p className="text-sm text-primary">Connect your wallet to enable payments on Monad Testnet</p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}
            >
              {message.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3",
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary",
                )}
              >
                <MessageContent
                  message={message}
                  onOrderConfirm={handleOrderConfirm}
                  isProcessingPayment={isProcessingPayment}
                />
              </div>
              {message.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/20">
                  <User className="h-4 w-4 text-accent" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="rounded-2xl bg-secondary px-4 py-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="border-t border-border bg-card/50 p-4">
          <div className="mx-auto max-w-3xl">
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              <span>Try asking</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSuggestion(prompt)}
                  className="rounded-full border border-border bg-card px-4 py-2 text-sm transition-colors hover:bg-secondary hover:border-primary/50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border bg-card p-4">
        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tell me what you'd like to eat..."
              className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button type="submit" size="lg" disabled={!input.trim() || isLoading} className="rounded-xl px-6">
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-center text-xs text-muted-foreground flex-1">
              Powered by x402 micropayments on Monad testnet
            </p>
            <button
              type="button"
              onClick={() => {
                const newMode = !useDemoMode
                setUseDemoMode(newMode)
                localStorage.setItem(USE_DEMO_MODE_KEY, String(newMode))
                if (!newMode && !threadId) {
                  // Generate new thread_id when switching to API mode
                  const newThreadId = `thread_${Date.now().toString(36)}${Math.random().toString(36).substring(2)}`
                  setThreadId(newThreadId)
                  localStorage.setItem(THREAD_ID_KEY, newThreadId)
                }
              }}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              {useDemoMode ? "Switch to API" : "Switch to Demo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

async function simulateAgentResponse(
  userInput: string,
  currentMessages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setPendingOrderTotal: React.Dispatch<React.SetStateAction<number | null>>,
) {
  const lowerInput = userInput.toLowerCase()

  await delay(1000)

  if (
    lowerInput.includes("sushi") ||
    lowerInput.includes("pizza") ||
    lowerInput.includes("burrito") ||
    lowerInput.includes("healthy") ||
    lowerInput.includes("lunch")
  ) {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "assistant",
        content: "Let me find some great options for you...",
        toolCalls: [
          {
            name: "list_restaurants",
            args: { query: userInput, location: "San Francisco" },
          },
        ],
        timestamp: new Date(),
      },
    ])

    await delay(1500)

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "assistant",
        content: "RESTAURANTS_DISPLAY",
        timestamp: new Date(),
      },
    ])

    await delay(1000)

    let restaurant = "The Burger Den"
    let items = ["Classic Burger", "French Fries"]
    let subtotal = 18.5
    let tax = 1.57
    let total = 20.07

    if (lowerInput.includes("sushi") || lowerInput.includes("japanese")) {
      restaurant = "Wasabi Saratoga"
      items = ["Salmon Roll", "Miso Soup"]
      subtotal = 22.5
      tax = 1.91
      total = 24.41
    } else if (lowerInput.includes("pizza") || lowerInput.includes("italian")) {
      restaurant = "Rustic Pizza and Eats"
      items = ["Margherita Pizza", "Caesar Salad"]
      subtotal = 19.99
      tax = 1.7
      total = 21.69
    } else if (lowerInput.includes("chinese") || lowerInput.includes("wok")) {
      restaurant = "Sunny Wok"
      items = ["Kung Pao Chicken", "Fried Rice"]
      subtotal = 16.99
      tax = 1.44
      total = 18.43
    }

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "assistant",
        content: "I found a great option! Here's what I recommend based on your request:",
        toolCalls: [
          {
            name: "build_cart",
            args: { restaurant, items },
          },
          {
            name: "compute_cost_estimate",
            args: { subtotal, tax, delivery: 0 },
            result: { total },
          },
        ],
        timestamp: new Date(),
      },
    ])

    await delay(800)

    setPendingOrderTotal(total)
    setMessages((prev) => {
      const lastMessage = prev[prev.length - 1]
      return [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "ORDER_CARD",
          toolCalls: lastMessage?.toolCalls,
          timestamp: new Date(),
        },
      ]
    })
  } else if (lowerInput.includes("confirm") || lowerInput.includes("yes") || lowerInput.includes("approve")) {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "assistant",
        content: "Please click the 'Confirm & Pay' button on the order card above to proceed with payment.",
        timestamp: new Date(),
      },
    ])
  } else {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "assistant",
        content:
          "I can help you order food! Just tell me what you're craving - like 'Get me sushi under $30' or 'I want pizza for dinner'. I'll find the best options, show you the prices, and handle the payment securely on Monad.",
        timestamp: new Date(),
      },
    ])
  }
}

async function callAgentAPI(
  userInput: string,
  currentThreadId: string | null,
  setThreadId: React.Dispatch<React.SetStateAction<string | null>>,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setPendingOrderTotal: React.Dispatch<React.SetStateAction<number | null>>,
) {
  try {
    console.log("[Chat] Calling agent API with prompt:", userInput.substring(0, 100))
    
    const response = await fetch("/api/agent/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: userInput,
        thread_id: currentThreadId || undefined,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
      console.error("[Chat] API error:", errorData)
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    const data = await response.json()
    const { response: agentResponse, thread_id: newThreadId } = data

    console.log("[Chat] Received response:", {
      threadId: newThreadId,
      responseLength: agentResponse?.length || 0,
      hasOrderSummary: agentResponse?.includes("order_summary") || false,
    })

    // Update thread_id if we got a new one
    if (newThreadId && newThreadId !== currentThreadId) {
      setThreadId(newThreadId)
      localStorage.setItem(THREAD_ID_KEY, newThreadId)
    }

    // Try to parse order summary from response
    const { parseOrderSummaryFromText } = await import("@/lib/api-response-types")
    const orderSummary = parseOrderSummaryFromText(agentResponse)

    if (orderSummary) {
      console.log("[Chat] Parsed order summary:", orderSummary)
      
      // Display message if provided
      const messageText = orderSummary.message
      if (messageText) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: messageText,
            timestamp: new Date(),
          },
        ])
      }

      // Display order card with full item details
      setPendingOrderTotal(orderSummary.pricing.total)
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "ORDER_CARD",
          toolCalls: [
            {
              name: "build_cart",
              args: {
                restaurant: orderSummary.restaurant,
                items: orderSummary.items.map((item) => item.name),
                itemDetails: orderSummary.items, // Include full item details with prices
              },
            },
            {
              name: "compute_cost_estimate",
              args: {
                subtotal: orderSummary.pricing.subtotal,
                tax: orderSummary.pricing.tax,
                delivery: orderSummary.pricing.deliveryFee,
              },
              result: {
                total: orderSummary.pricing.total,
              },
            },
          ],
          timestamp: new Date(),
        },
      ])
    } else {
      // Regular text response
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: agentResponse,
          timestamp: new Date(),
        },
      ])
    }
  } catch (error) {
    console.error("[Chat] Error calling agent API:", error)
    throw error
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
