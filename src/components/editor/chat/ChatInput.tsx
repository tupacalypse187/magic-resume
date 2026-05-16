"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { useTranslations } from "@/i18n/compat/client";
import { useChatStore } from "@/store/useChatStore";
import { useAIConfiguration } from "@/hooks/useAIConfiguration";
import { Button } from "@/components/ui/button";
import { Send, Square } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChatInput() {
  const t = useTranslations("aiChat");
  const { sendMessage, isStreaming, stopStreaming } = useChatStore();
  const { checkConfiguration } = useAIConfiguration();
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 120) + "px";
    }
  }, [value]);

  const handleSend = async () => {
    const trimmed = value.trim();
    if (!trimmed || isStreaming) return;
    if (!checkConfiguration()) return;

    setValue("");
    await sendMessage(trimmed);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-2">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t("placeholder")}
        rows={1}
        className={cn(
          "flex-1 resize-none rounded-lg border border-border/50 bg-background px-3 py-2 text-sm",
          "placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary",
          "max-h-[120px] overflow-y-auto"
        )}
      />
      {isStreaming ? (
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 flex-shrink-0"
          onClick={stopStreaming}
        >
          <Square className="h-3.5 w-3.5" />
        </Button>
      ) : (
        <Button
          size="icon"
          className="h-9 w-9 flex-shrink-0"
          onClick={handleSend}
          disabled={!value.trim()}
        >
          <Send className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
