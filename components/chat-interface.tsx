"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Loader2, Bot, User, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MessageContent } from "@/components/message-content"

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

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
    setInput("")
    setIsLoading(true)

    // Simulate AI response with tool calls
    await simulateAgentResponse(input, setMessages)
    setIsLoading(false)
  }

  const handleSuggestion = (prompt: string) => {
    setInput(prompt)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="mx-auto max-w-3xl space-y-6">
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
                <MessageContent message={message} />
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
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Powered by x402 micropayments on Monad testnet
          </p>
        </form>
      </div>
    </div>
  )
}

// Simulate AI agent response with tool calls
async function simulateAgentResponse(userInput: string, setMessages: React.Dispatch<React.SetStateAction<Message[]>>) {
  const lowerInput = userInput.toLowerCase()

  // Simulate restaurant search
  await delay(1000)

  if (
    lowerInput.includes("sushi") ||
    lowerInput.includes("pizza") ||
    lowerInput.includes("burrito") ||
    lowerInput.includes("healthy") ||
    lowerInput.includes("lunch")
  ) {
    // Step 1: List restaurants
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

    // Step 2: Show restaurants
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

    // Step 3: Build cart and request approval - choose restaurant based on user input
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
      tax = 1.70
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

    // Step 4: Show order card
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "assistant",
        content: "ORDER_CARD",
        timestamp: new Date(),
      },
    ])
  } else if (lowerInput.includes("confirm") || lowerInput.includes("yes") || lowerInput.includes("approve")) {
    // Payment authorization flow
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "assistant",
        content: "Requesting payment authorization via x402...",
        toolCalls: [
          {
            name: "request_payment_authorization",
            args: { amount: 24.41, currency: "USD", protocol: "x402" },
          },
        ],
        timestamp: new Date(),
      },
    ])

    await delay(2000)

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "assistant",
        content: "Payment authorized! Creating your DoorDash delivery now...",
        toolCalls: [
          {
            name: "doordash.createDelivery",
            args: {
              pickup: "Wasabi Saratoga, 123 Market St",
              dropoff: "456 Pine St, San Francisco",
            },
            result: { deliveryId: "DD-X7K9M2", eta: "25-35 min" },
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
        content: "DELIVERY_TRACKER",
        timestamp: new Date(),
      },
    ])
  } else {
    // Default response
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

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
