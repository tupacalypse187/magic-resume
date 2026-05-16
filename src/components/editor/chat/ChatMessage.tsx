"use client";

import { ChatMessage as ChatMessageType } from "@/types/review";
import { cn } from "@/lib/utils";
import { User, Bot } from "lucide-react";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div className={cn(
        "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center",
        isUser ? "bg-primary text-primary-foreground" : "bg-muted"
      )}>
        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
      </div>
      <div className={cn(
        "flex-1 max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed",
        isUser
          ? "bg-primary text-primary-foreground"
          : "bg-card border border-border/50"
      )}>
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            {message.content || ""}
          </div>
        )}
      </div>
    </div>
  );
}
