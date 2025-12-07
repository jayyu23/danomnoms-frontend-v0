import { NextResponse } from "next/server"

const API_BASE_URL = "https://danomnoms-api.onrender.com"

export async function POST(request: Request) {
  const startTime = Date.now()
  try {
    const body = await request.json()
    const { prompt, thread_id } = body

    console.log("[Agent API] Received request:", {
      prompt: prompt?.substring(0, 100) + (prompt?.length > 100 ? "..." : ""),
      thread_id: thread_id || "new",
      timestamp: new Date().toISOString(),
    })

    if (!prompt) {
      console.error("[Agent API] Missing prompt in request")
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Enhance prompt to request JSON format when menu/order information is needed
    const enhancedPrompt = enhancePromptForJsonResponse(prompt)

    console.log("[Agent API] Calling backend API:", {
      url: `${API_BASE_URL}/api/agent/chat`,
      enhancedPrompt: enhancedPrompt.substring(0, 150) + "...",
    })

    const response = await fetch(`${API_BASE_URL}/api/agent/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        thread_id: thread_id || undefined,
      }),
    })

    const responseTime = Date.now() - startTime
    console.log("[Agent API] Backend response:", {
      status: response.status,
      statusText: response.statusText,
      responseTime: `${responseTime}ms`,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[Agent API] Backend error:", {
        status: response.status,
        error: errorText.substring(0, 200),
      })
      return NextResponse.json(
        { error: `API error: ${errorText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log("[Agent API] Response data:", {
      hasResponse: !!data.response,
      responseLength: data.response?.length || 0,
      threadId: data.thread_id,
      responsePreview: data.response?.substring(0, 200) + (data.response?.length > 200 ? "..." : ""),
    })

    return NextResponse.json(data)
  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error("[Agent API] Error calling agent API:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      responseTime: `${responseTime}ms`,
    })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

/**
 * Enhance the user prompt to request JSON format when menu/order information is needed
 */
function enhancePromptForJsonResponse(originalPrompt: string): string {
  const lowerPrompt = originalPrompt.toLowerCase()
  
  // Check if the prompt is asking for menu, order, or pricing information
  const isMenuRequest = 
    lowerPrompt.includes("menu") ||
    lowerPrompt.includes("show me") ||
    lowerPrompt.includes("what") ||
    lowerPrompt.includes("list") ||
    lowerPrompt.includes("items") ||
    lowerPrompt.includes("order") ||
    lowerPrompt.includes("price") ||
    lowerPrompt.includes("cost") ||
    lowerPrompt.includes("total")

  if (isMenuRequest) {
    return `${originalPrompt}

IMPORTANT: If you are providing menu items, restaurant information, or order details, please format your response as JSON in the following structure:

\`\`\`json
{
  "type": "order_summary",
  "restaurant": "Restaurant Name",
  "items": [
    {
      "name": "Item Name",
      "price": 12.99,
      "quantity": 1
    }
  ],
  "pricing": {
    "subtotal": 12.99,
    "tax": 1.10,
    "deliveryFee": 0.00,
    "total": 14.09
  },
  "message": "Optional human-readable message to display"
}
\`\`\`

If you cannot provide order information, respond normally with text.`
  }

  return originalPrompt
}
