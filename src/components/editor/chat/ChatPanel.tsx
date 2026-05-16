"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "@/i18n/compat/client";
import { useChatStore } from "@/store/useChatStore";
import { useResumeStore } from "@/store/useResumeStore";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet-no-overlay";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ChatSessionList } from "./ChatSessionList";
import { QuickActions } from "./QuickActions";
import { X, Plus, MessageSquare, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChatPanel() {
  const t = useTranslations("aiChat");
  const {
    isOpen,
    isStreaming,
    activeSessionId,
    setOpen,
    createSession,
    getActiveSession,
    getActiveSessions,
  } = useChatStore();
  const { activeResume } = useResumeStore();
  const [showSessions, setShowSessions] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const resumeId = activeResume?.id;
  const session = resumeId ? getActiveSession() : null;
  const sessions = resumeId ? getActiveSessions(resumeId) : [];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [session?.messages?.length, session?.messages?.[session.messages.length - 1]?.content]);

  const handleNewSession = () => {
    if (!resumeId) return;
    createSession(resumeId);
    setShowSessions(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setOpen} modal={false}>
      <SheetContent side="right" className="w-[400px] sm:w-[450px] p-0 flex flex-col gap-0 border-l shadow-lg bg-muted/30 backdrop-blur-xl">
        {/* Header */}
        <div className="p-4 bg-background/80 backdrop-blur-sm sticky top-0 z-10 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageSquare className="w-4 h-4 text-primary" />
              </div>
              <div>
                <SheetTitle className="text-sm font-semibold">{t("title")}</SheetTitle>
                <SheetDescription className="text-[10px]">
                  {isStreaming ? t("thinking") : ""}
                </SheetDescription>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setShowSessions(!showSessions)}
              >
                <MessageSquare className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleNewSession}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setOpen(false)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Session list (collapsible) */}
        {showSessions && (
          <div className="border-b">
            <ChatSessionList
              sessions={sessions}
              activeSessionId={activeSessionId}
              onSelect={(id) => {
                useChatStore.getState().setActiveSession(id);
                setShowSessions(false);
              }}
              onDelete={(id) => {
                if (resumeId) useChatStore.getState().deleteSession(resumeId, id);
              }}
            />
          </div>
        )}

        {/* Messages */}
        <ScrollArea className="flex-1 h-full">
          <div ref={scrollRef} className="p-4 space-y-4">
            {session?.messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground max-w-[250px]">
                  {t("placeholder")}
                </p>
                <div className="mt-4">
                  <QuickActions />
                </div>
              </div>
            )}

            {session?.messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {isStreaming && session?.messages[session.messages.length - 1]?.content === "" && (
              <div className="flex items-center gap-2 px-3 py-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">{t("thinking")}</span>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t bg-background/80 backdrop-blur-sm p-3">
          {session && session.messages.length > 0 && (
            <div className="mb-2">
              <QuickActions />
            </div>
          )}
          <ChatInput />
        </div>
      </SheetContent>
    </Sheet>
  );
}
