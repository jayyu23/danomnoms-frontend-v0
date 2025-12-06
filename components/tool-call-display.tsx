"use client"

import { Terminal, Check } from "lucide-react"
import type { ToolCall } from "@/components/chat-interface"

interface ToolCallDisplayProps {
  toolCall: ToolCall
}

export function ToolCallDisplay({ toolCall }: ToolCallDisplayProps) {
  return (
    <div className="rounded-lg bg-background/50 border border-border p-2 text-xs font-mono">
      <div className="flex items-center gap-2 text-primary">
        <Terminal className="h-3 w-3" />
        <span className="font-semibold">{toolCall.name}</span>
        {toolCall.result && <Check className="h-3 w-3 ml-auto text-green-500" />}
      </div>
      <div className="mt-1 text-muted-foreground overflow-hidden">
        <span className="opacity-60">args: </span>
        {JSON.stringify(toolCall.args)}
      </div>
      {toolCall.result && (
        <div className="mt-1 text-green-600 dark:text-green-400">
          <span className="opacity-60">result: </span>
          {JSON.stringify(toolCall.result)}
        </div>
      )}
    </div>
  )
}
